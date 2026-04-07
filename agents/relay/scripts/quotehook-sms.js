/**
 * QuoteHook SMS Sender — Twilio Integration
 */

const twilio = require('twilio');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  FROM_NUMBER = TWILIO_PHONE_NUMBER,
} = process.env;

let twilioClient = null;

function getClient() {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials not configured: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN required');
  }
  if (!twilioClient) {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

/**
 * Send an SMS via Twilio
 * @param {string} to   - E.164 destination number
 * @param {string} body - Message body
 * @returns {Promise<{ sid: string, status: string }>}
 */
async function sendSMS(to, body) {
  const client = getClient();

  const message = await client.messages.create({
    body,
    from: FROM_NUMBER,
    to,
  });

  return {
    sid:        message.sid,
    status:     message.status,
    to:         message.to,
    from:       message.from,
    dateSent:   message.dateSent,
  };
}

/**
 * Validate an E.164 phone number
 */
function isValidE164(phone) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

/**
 * Format a number to E.164 if possible
 */
function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+${digits}`;
  }
  return phone.startsWith('+') ? phone : `+${digits}`;
}

module.exports = { sendSMS, isValidE164, normalizePhone };
