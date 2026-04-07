/**
 * QuoteHook Email Sender — Resend Integration
 */

const { Resend } = require('resend');

const {
  RESEND_API_KEY,
  FROM_EMAIL = 'Borne Systems <noreply@bornesystems.com>',
} = process.env;

let resendClient = null;

function getClient() {
  if (!RESEND_API_KEY) {
    throw new Error('Resend API key not configured: RESEND_API_KEY required');
  }
  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Send an email via Resend
 * @param {string} to      - Destination email address
 * @param {string} subject - Email subject
 * @param {string} html    - Email HTML body
 * @param {string} text    - Plain text fallback
 * @returns {Promise<{ id: string, from: string, to: string }>}
 */
async function sendEmail(to, subject, html, text) {
  const client = getClient();

  const { data, error } = await client.emails.send({
    from:    FROM_EMAIL,
    to:      [to],
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  return {
    id:    data.id,
    from:  FROM_EMAIL,
    to,
  };
}

/**
 * Validate an email address
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = { sendEmail, isValidEmail };
