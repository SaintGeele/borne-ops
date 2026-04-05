import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const router = express.Router();
const supabase = createClient(
 process.env.SUPABASE_URL,
 process.env.SUPABASE_SERVICE_KEY
);

// Verify Resend webhook signature
function verifySignature(payload, signature, secret) {
 const hmac = crypto
 .createHmac('sha256', secret)
 .update(payload)
 .digest('hex');
 return `sha256=${hmac}` === signature;
}

router.post('/webhooks/resend', express.raw({ type: 'application/json' }), async (req, res) => {
 const signature = req.headers['svix-signature'];
 const secret = process.env.RESEND_WEBHOOK_SECRET;

 if (!verifySignature(req.body, signature, secret)) {
 return res.status(401).json({ error: 'Invalid signature' });
 }

 const event = JSON.parse(req.body);
 const { type, data } = event;

 // Only process tracked events
 const tracked = ['email.opened', 'email.clicked', 'email.bounced', 'email.unsubscribed'];
 if (!tracked.includes(type)) return res.status(200).json({ received: true });

 try {
 // Log to Supabase email_events table
 await supabase.from('email_events').insert({
 ts: new Date().toISOString(),
 event_type: type,
 email_id: data.email_id,
 recipient: data.to,
 subject: data.subject || null,
 template: data.tags?.template || null,
 lead_id: data.tags?.lead_id || null,
 campaign: data.tags?.campaign || null
 });

 // Flag bounces and unsubscribes to Chase immediately
 if (type === 'email.bounced' || type === 'email.unsubscribed') {
 await supabase.from('pulse_alerts').insert({
 ts: new Date().toISOString(),
 source: 'resend',
 event: type,
 recipient: data.to,
 lead_id: data.tags?.lead_id || null,
 action_required: true,
 notes: type === 'email.bounced'
 ? 'Bad email — update Notion lead, pause sequence'
 : 'Unsubscribed — remove from all sequences immediately'
 });
 }

 res.status(200).json({ received: true });
 } catch (err) {
 console.error('Resend webhook error:', err);
 res.status(500).json({ error: 'Internal error' });
 }
});

export default router;
