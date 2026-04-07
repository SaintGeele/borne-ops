/**
 * QuoteHook Cron — Daily touch evaluator
 * Run daily via cron: node agents/relay/scripts/quotehook-cron.js
 *
 * Logic:
 *   1. Fetch all quotes where next_touch_date <= today
 *   2. For each quote, determine the current touch day
 *   3. Check if touch was already sent today on each channel
 *   4. Send SMS and/or email for the appropriate touch day
 *   5. Log the touch in Supabase
 *   6. Advance the quote to the next stage
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const { QuoteHookStateMachine, STAGES } = require('./quotehook-state-machine');
const { sendSMS, normalizePhone, isValidE164 } = require('./quotehook-sms');
const { sendEmail, isValidEmail } = require('./quotehook-email');
const { getTemplate, getEmailTemplate, getEscalationTemplate } = require('./quotehook-templates');

const {
  SUPABASE_URL,
  SUPABASE_KEY,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  RESEND_API_KEY,
  ESCALATION_WEBHOOK_URL,
  LOG_LEVEL = 'info',
} = process.env;

// Stage → touch day mapping
const STAGE_TO_TOUCH_DAY = {
  [STAGES.PENDING]: 1,
  [STAGES.DAY1]:    3,
  [STAGES.DAY3]:    7,
  [STAGES.DAY7]:    14,
};

function log(level, msg, meta = {}) {
  if (LOG_LEVEL === 'silent') return;
  const timestamp = new Date().toISOString();
  const metaStr   = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${msg}${metaStr}`);
}

async function sendTouch(stateMachine, quote, touchDay, channel) {
  const context = {
    clientName:   quote.client_name,
    quoteValue:   quote.quote_value,
    companyName:  'Borne Systems',
    source:       quote.source || 'unknown',
  };

  if (channel === 'sms') {
    const phone = normalizePhone(quote.client_phone);

    if (!isValidE164(phone)) {
      log('warn', `Invalid phone for quote ${quote.id}, skipping SMS`, { phone });
      return null;
    }

    const body = getTemplate(touchDay, 'sms', 'default', context);
    const result = await sendSMS(phone, body);
    log('info', `SMS sent to ${quote.client_name}`, { quoteId: quote.id, sid: result.sid });
    return result;

  } else if (channel === 'email') {
    if (!isValidEmail(quote.client_email)) {
      log('warn', `Invalid email for quote ${quote.id}, skipping email`, { email: quote.client_email });
      return null;
    }

    const { subject, html, text } = getEmailTemplate(touchDay, 'default', context);
    const result = await sendEmail(quote.client_email, subject, html, text);
    log('info', `Email sent to ${quote.client_name}`, { quoteId: quote.id, emailId: result.id });
    return result;
  }
}

async function notifyEscalation(quote, reason) {
  if (!ESCALATION_WEBHOOK_URL) {
    log('warn', 'No ESCALATION_WEBHOOK_URL configured, skipping escalation notification');
    return;
  }

  try {
    const res = await fetch(ESCALATION_WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ quote, reason, timestamp: new Date().toISOString() }),
    });

    if (!res.ok) throw new Error(`Webhook returned ${res.status}`);
    log('info', 'Escalation notification sent', { quoteId: quote.id, reason });
  } catch (err) {
    log('error', 'Failed to send escalation notification', { error: err.message });
  }
}

async function processQuote(quote, stateMachine) {
  const currentStage = quote.stage;

  // Skip closed/expired
  if (currentStage === STAGES.CLOSED || currentStage === STAGES.EXPIRED) {
    return { skipped: true, reason: 'terminal_state' };
  }

  // Determine touch day from current stage
  const touchDay = STAGE_TO_TOUCH_DAY[currentStage];
  if (!touchDay) {
    return { skipped: true, reason: 'unknown_stage', stage: currentStage };
  }

  // Determine channels to use
  const channels = ['email']; // always email
  if (quote.client_phone) channels.push('sms'); // add SMS if phone available

  const results = [];

  for (const channel of channels) {
    // Check if already touched today on this channel
    const alreadySent = await stateMachine.touchSentToday(quote.id, touchDay, channel);
    if (alreadySent) {
      log('info', `Touch already sent today for quote ${quote.id} on ${channel}, skipping`);
      continue;
    }

    try {
      const sendResult = await sendTouch(stateMachine, quote, touchDay, channel);

      if (sendResult) {
        // Log the touch
        await stateMachine.logTouch({
          quoteId:   quote.id,
          touchDay,
          channel,
          message:   channel === 'sms'
                       ? getTemplate(touchDay, 'sms', 'default', { clientName: quote.client_name, quoteValue: quote.quote_value })
                       : getEmailTemplate(touchDay, 'default', { clientName: quote.client_name, quoteValue: quote.quote_value }).text,
          messageId: sendResult.sid || sendResult.id,
        });

        results.push({ channel, sent: true, messageId: sendResult.sid || sendResult.id });
      }
    } catch (err) {
      log('error', `Failed to send ${channel} for quote ${quote.id}`, { error: err.message });
      results.push({ channel, sent: false, error: err.message });
    }
  }

  // If at least one channel succeeded, advance the stage
  if (results.some(r => r.sent)) {
    const advanceResult = await stateMachine.advanceStage(quote.id, touchDay);
    log('info', `Quote ${quote.id} advanced to ${advanceResult.toStage}`, { from: advanceResult.fromStage });
    return { touched: true, results, advanceResult };
  }

  return { touched: false, results };
}

async function main() {
  log('info', 'QuoteHook cron job started');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    log('error', 'SUPABASE_URL and SUPABASE_KEY are required');
    process.exit(1);
  }

  const stateMachine = new QuoteHookStateMachine(SUPABASE_URL, SUPABASE_KEY);

  let quotes;
  try {
    quotes = await stateMachine.getQuotesNeedingTouch();
  } catch (err) {
    log('error', 'Failed to fetch quotes', { error: err.message });
    process.exit(1);
  }

  log('info', `Found ${quotes.length} quotes needing a touch`);

  const summary = { processed: 0, touched: 0, errors: 0 };

  for (const quote of quotes) {
    summary.processed++;
    try {
      const result = await processQuote(quote, stateMachine);
      if (result.touched) summary.touched++;
    } catch (err) {
      summary.errors++;
      log('error', `Error processing quote ${quote.id}`, { error: err.message });
    }
  }

  log('info', 'QuoteHook cron job completed', summary);
  console.log(JSON.stringify({ ok: true, ...summary }));
}

main().catch(err => {
  log('error', 'Cron job crashed', { error: err.message });
  process.exit(1);
});
