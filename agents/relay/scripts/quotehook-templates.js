/**
 * QuoteHook Templates
 * Edit these without touching code.
 * All templates receive the same context variables:
 *   { clientName, quoteValue, companyName, source }
 *
 * Templates are organized by touch day and channel.
 */

const TEMPLATES = {
  // ─── DAY 1 — Initial follow-up after quote request ───────────────────────
  day1: {
    sms: {
      default: `Hi {{clientName}}! This is from Borne Systems. We sent over a quote for you — just wanted to make sure you saw it. Questions? Just reply here.`,
    },
    email: {
      subject: 'Your quote from Borne Systems',
      default: `
        <p>Hi {{clientName}},</p>
        <p>Thanks for reaching out! I've put together a quote for you and wanted to make sure it made it to your inbox.</p>
        <p>If you have any questions or need anything adjusted, just reply to this email — I'm happy to help.</p>
        <p>Looking forward to working with you.</p>
        <p>— The Borne Systems Team</p>
      `,
    },
  },

  // ─── DAY 3 — Value reminder ─────────────────────────────────────────────
  day3: {
    sms: {
      default: `Hey {{clientName}} — just following up on the quote we sent over. Happy to answer any questions or walk you through the details. Reply here or give us a call!`,
    },
    email: {
      subject: 'Quick follow-up — your Borne Systems quote',
      default: `
        <p>Hi {{clientName}},</p>
        <p>Wanted to check in and make sure you have everything you need to move forward.</p>
        <p>Our quote covers everything we discussed — happy to jump on a quick call to walk through the details or answer any questions.</p>
        <p>No pressure at all. Just here if you need us.</p>
        <p>— The Borne Systems Team</p>
      `,
    },
  },

  // ─── DAY 7 — Urgency nudge ──────────────────────────────────────────────
  day7: {
    sms: {
      default: `{{clientName}} — just a heads up, our quotes are typically valid for 14 days. If you're still interested, let's get this sorted. Happy to chat!`,
    },
    email: {
      subject: 'Friendly reminder — your quote is still waiting',
      default: `
        <p>Hi {{clientName}},</p>
        <p>Just a quick note — it's been about a week since we sent over your quote. I wanted to make sure it didn't get buried.</p>
        <p>If you're still interested, I'd love to connect and answer any questions. If now isn't the right time, totally understand — just let me know.</p>
        <p>Either way, thanks again for considering Borne Systems.</p>
        <p>— The Borne Systems Team</p>
      `,
    },
  },

  // ─── DAY 14 — Final close attempt ─────────────────────────────────────
  day14: {
    sms: {
      default: `{{clientName}} — this is our final follow-up on your quote. After today, we'll close out your request. If you're still interested, just reply and we'll make it happen.`,
    },
    email: {
      subject: 'Last chance — your Borne Systems quote is expiring',
      default: `
        <p>Hi {{clientName}},</p>
        <p>This is our final follow-up on your quote. We'll be closing it out after today.</p>
        <p>If there's anything holding you back — pricing, timing, questions — please let me know. I'd rather find a way to help than lose you over something we can solve.</p>
        <p>Thank you for your time, and apologies if this comes at a busy moment.</p>
        <p>— The Borne Systems Team</p>
      `,
    },
  },

  // ─── Human escalation notifications ───────────────────────────────────
  escalation: {
    sms: {
      interested: `Got it — someone from our team will be in touch shortly!`,
      stop:       `No problem at all. You'll no longer receive messages from us. Have a great day!`,
    },
  },
};

/**
 * Render a template with context variables
 * Replaces {{variable}} placeholders
 */
function render(template, context) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return context[key] !== undefined ? context[key] : match;
  });
}

/**
 * Get a rendered template
 * @param {number} touchDay   - 1, 3, 7, or 14
 * @param {string} channel    - 'sms' or 'email'
 * @param {string} variant    - 'default' or a custom key
 * @param {object} context    - { clientName, quoteValue, companyName, source }
 */
function getTemplate(touchDay, channel, variant = 'default', context = {}) {
  const dayTemplates = TEMPLATES[`day${touchDay}`];
  if (!dayTemplates) throw new Error(`No template for touch day ${touchDay}`);

  const channelTemplates = dayTemplates[channel];
  if (!channelTemplates) throw new Error(`No ${channel} template for day ${touchDay}`);

  const raw = channelTemplates[variant] || channelTemplates.default;
  return render(raw, context);
}

/**
 * Get email template with subject
 */
function getEmailTemplate(touchDay, variant = 'default', context = {}) {
  const dayTemplates = TEMPLATES[`day${touchDay}`];
  if (!dayTemplates) throw new Error(`No email template for touch day ${touchDay}`);

  return {
    subject: render(dayTemplates.email.subject, context),
    html:    render(dayTemplates.email[variant] || dayTemplates.email.default, context),
    text:    render(dayTemplates.email[variant] || dayTemplates.email.default, context)
               .replace(/<[^>]+>/g, ''), // strip HTML for text version
  };
}

/**
 * Get escalation message
 */
function getEscalationTemplate(type, channel = 'sms') {
  return TEMPLATES.escalation[channel]?.[type] || null;
}

module.exports = { TEMPLATES, getTemplate, getEmailTemplate, getEscalationTemplate, render };
