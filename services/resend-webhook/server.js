import dotenv from "dotenv";
dotenv.config({ path: "/home/saint/.openclaw/.env" });
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";

const app = express();
const port = process.env.PORT || 3001;
const webhook = new Webhook(process.env.RESEND_WEBHOOK_SECRET || "");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const logDir = "/home/saint/.openclaw/workspace/services/resend-webhook/logs";
const logPath = path.join(logDir, "events.jsonl");

function appendLog(entry) {
  fs.mkdirSync(logDir, { recursive: true });
  fs.appendFileSync(logPath, JSON.stringify(entry) + "\n");
}

// ── MIDDLEWARE ───────────────────────────────────────────────
app.use(cors({
  origin: ['http://srv1430138.tail9c961.ts.net:8080', 'https://resendhook.bornesystems.com'],
  methods: ['GET', 'POST']
}));
app.use(express.json());

// ── HEALTH ───────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

// ── RESEND WEBHOOK ───────────────────────────────────────────
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const payload = req.body.toString("utf8");
  const headers = {
    "svix-id": req.header("svix-id"),
    "svix-timestamp": req.header("svix-timestamp"),
    "svix-signature": req.header("svix-signature"),
  };

  appendLog({ receivedAt: new Date().toISOString(), headers: { ...headers, "user-agent": req.header("user-agent") }, payload, note: "raw" });

  let event;
  try {
    event = webhook.verify(payload, headers);
  } catch (err) {
    appendLog({ receivedAt: new Date().toISOString(), error: err?.message, note: "verify_failed" });
    return res.status(400).send("invalid webhook");
  }

  appendLog({ receivedAt: new Date().toISOString(), event, note: "verified" });

  const { type, data } = event;
  const tracked = ["email.opened", "email.clicked", "email.bounced", "email.unsubscribed", "email.delivered"];

  if (tracked.includes(type)) {
    const { error: insertError } = await supabase.from("email_events").insert({
      ts: new Date().toISOString(),
      event_type: type,
      email_id: data.email_id || null,
      recipient: Array.isArray(data.to) ? data.to[0] : data.to || null,
      subject: data.subject || null,
      template: data.tags?.template || null,
      lead_id: data.tags?.lead_id || null,
      campaign: data.tags?.campaign || null
    });

    if (insertError) {
      appendLog({ receivedAt: new Date().toISOString(), error: insertError.message, note: "supabase_error" });
    } else {
      appendLog({ receivedAt: new Date().toISOString(), type, note: "supabase_written" });
    }

    if (type === "email.bounced" || type === "email.unsubscribed") {
      await supabase.from("pulse_alerts").insert({
        ts: new Date().toISOString(),
        source: "resend",
        event: type,
        recipient: Array.isArray(data.to) ? data.to[0] : data.to || null,
        lead_id: data.tags?.lead_id || null,
        action_required: true,
        resolved: false,
        notes: type === "email.bounced"
          ? "Bad email — update lead, pause sequence"
          : "Unsubscribed — remove from all sequences immediately"
      });
    }
  }

  res.status(200).send("ok");
});

// ── REPLY DETECTION ──────────────────────────────────────────
app.post('/reply', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'email.replied' || type === 'inbound.email') {
      const recipient = data?.from || data?.sender || '';
      const subject = data?.subject || '';

      await supabase.from('email_events').insert({
        event_type: 'email.replied',
        recipient,
        subject,
        ts: new Date().toISOString(),
        notified: false,
      });

      const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: `🔥 *New Reply from Lead*\n\n*From:* ${recipient}\n*Subject:* ${subject}\n\nCheck your inbox and respond fast.`,
          parse_mode: 'Markdown'
        })
      });

      await supabase.from('leads')
        .update({ status: 'hot' })
        .eq('email', recipient);
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SUPPORT (SNS) ────────────────────────────────────────────
app.post("/support", express.text({ type: "*/*" }), async (req, res) => {
  const body = JSON.parse(req.body || "{}");

  if (req.headers["x-amz-sns-message-type"] === "SubscriptionConfirmation") {
    try {
      const https = await import("https");
      https.get(body.SubscribeURL, (r) => { r.resume(); }).on("error", (e) => {
        console.error("SNS confirm error:", e.message);
      });
    } catch (e) {
      console.error("SNS confirm failed:", e.message);
    }
    return res.status(200).send("confirmed");
  }

  if (req.headers["x-amz-sns-message-type"] === "Notification") {
    const message = JSON.parse(body.Message);
    const mail = message.mail;
    fs.appendFileSync(
      "/home/saint/.openclaw/logs/support-inbound.log",
      JSON.stringify({ ts: new Date().toISOString(), from: mail?.source, to: mail?.destination, subject: mail?.commonHeaders?.subject, messageId: mail?.messageId, note: "inbound_email" }) + "\n"
    );
  }

  res.status(200).send("ok");
});

// ── CARE TICKETS ─────────────────────────────────────────────
app.post("/care", async (req, res) => {
  const { name, email, issue_type, subject, description } = req.body;

  if (!name || !email || !subject || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabase.from("tickets").insert({
      name, email,
      issue_type: issue_type || "general",
      subject, description,
      status: "open",
      priority: "normal",
      assigned_to: "Care"
    }).select().single();

    if (error) throw error;

    await supabase.from("ticket_log").insert({
      ticket_id: data.id,
      agent: "Care",
      action: "ticket_created",
      notes: `Inbound from ${email}`
    });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "Borne Systems Support <support@bornesystems.com>",
        to: [email],
        subject: `We got your message — ${subject}`,
        html: `<p>Hey ${name},</p><p>Thanks for reaching out. We'll get back to you within 24 hours.</p><p><strong>Ticket ID:</strong> ${data.id}</p><p>— Borne Systems Support</p>`
      })
    });

    res.status(200).json({ success: true, ticket_id: data.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to create ticket" });
  }
});

// ── LEADS ────────────────────────────────────────────────────
app.post("/leads", async (req, res) => {
  const { name, email, company, interest, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const { data, error } = await supabase.from("leads").insert({
      name, email,
      company: company || null,
      interest: interest || "Other",
      message: message || null,
      source: "website",
      status: "new",
      assigned_to: "Chase"
    }).select().single();

    if (error) throw error;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "Borne Systems <support@bornesystems.com>",
        to: [email],
        subject: "Thanks for reaching out — Borne Systems",
        html: `<p>Hey ${name},</p><p>I'll personally review your message and get back to you within 24 hours.</p><p><strong>Interest:</strong> ${interest || 'General inquiry'}</p><p>— Geele<br>Borne Systems</p>`
      })
    });

    res.status(200).json({ success: true, lead_id: data.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to capture lead" });
  }
});

// ── VAPI WEBHOOK ─────────────────────────────────────────────
app.post("/vapi-webhook", async (req, res) => {
  const event = req.body;
  const type = event?.message?.type;

  if (type === "end-of-call-report") {
    const call = event.message;
    const transcript = call.transcript || "";
    const summary = call.summary || "";
    const recordingUrl = call.recordingUrl || null;

    const nameMatch = transcript.match(/(?:name is|I am|I'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    const emailMatch = transcript.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = transcript.match(/(\+?1?[\s.-]?\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4})/);
    const businessMatch = transcript.match(/(?:business|company|practice|office|shop)(?:\s+is\s+called|\s+name\s+is|\s+is)?\s+([A-Z][\w\s]+)/i);

    const name = nameMatch?.[1] || "Unknown Caller";
    const email = emailMatch?.[0] || null;
    const phone = phoneMatch?.[1] || call.customer?.number || null;
    const company = businessMatch?.[1] || null;

    if (phone || email) {
      await supabase.from("leads").insert({ name, email, phone, company, source: "phone", status: "new", message: summary });
    }

    await supabase.from("activity_log").insert({
      agent_id: "care",
      action_type: "call_received",
      title: `Inbound call — ${name}`,
      description: summary || transcript.slice(0, 200),
      metadata: { name, email, phone, company, recording_url: recordingUrl, call_id: call.id }
    });

    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `📞 Inbound Call Completed\n\n👤 ${name}\n📱 ${phone || "—"}\n📧 ${email || "—"}\n🏢 ${company || "—"}\n\n📝 Summary:\n${summary || "No summary available"}${recordingUrl ? `\n\n🎙 Recording: ${recordingUrl}` : ""}`
      })
    });
  }

  res.status(200).json({ received: true });
});

// ── STRIPE WEBHOOK ───────────────────────────────────────────
app.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const payload = req.body.toString();
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Stripe signature verification failed:', err.message);
      return res.status(400).send('Webhook Error');
    }

    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded' || event.type === 'customer.subscription.created') {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email || session.receipt_email || '';
      const amount = (session.amount_total || session.amount || 0) / 100;

      await supabase.from('revenue').insert({ type: 'payment', amount, source: 'stripe', ts: new Date().toISOString() });

      if (customerEmail) {
        await supabase.from('leads').update({ status: 'closed' }).eq('email', customerEmail);
      }

      await supabase.from('activity_log').insert({
        agent_id: 'ledger',
        action_type: 'payment_received',
        title: `Stripe payment — $${amount}`,
        description: `Customer: ${customerEmail}`,
        metadata: { amount, email: customerEmail, event_type: event.type }
      });

      const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: `💰 *Payment Received*\n\n*Amount:* $${amount}\n*Customer:* ${customerEmail}`,
          parse_mode: 'Markdown'
        })
      });
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      await supabase.from('activity_log').insert({
        agent_id: 'ledger',
        action_type: 'subscription_cancelled',
        title: `Subscription cancelled`,
        description: `Customer ID: ${sub.customer}`,
        metadata: { customer: sub.customer, event_type: event.type }
      });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── TOKEN REFRESH ────────────────────────────────────────────
app.post('/refresh-meta', async (req, res) => {
  try {
    const appSecret = process.env.META_APP_SECRET;

    const igCreds = JSON.parse(fs.readFileSync('/home/saint/.openclaw/credentials/instagram.json', 'utf8'));
    const igRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${igCreds.app_id}&client_secret=${appSecret}&fb_exchange_token=${igCreds.page_access_token}`);
    const igData = await igRes.json();
    if (igData.access_token) {
      igCreds.page_access_token = igData.access_token;
      igCreds.expires_in_days = 60;
      igCreds.created = new Date().toISOString().split('T')[0];
      fs.writeFileSync('/home/saint/.openclaw/credentials/instagram.json', JSON.stringify(igCreds, null, 2));
    }

    const thCreds = JSON.parse(fs.readFileSync('/home/saint/.openclaw/credentials/threads.json', 'utf8'));
    const thRes = await fetch(`https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${thCreds.access_token}`);
    const thData = await thRes.json();
    if (thData.access_token) {
      thCreds.access_token = thData.access_token;
      thCreds.created = new Date().toISOString().split('T')[0];
      fs.writeFileSync('/home/saint/.openclaw/credentials/threads.json', JSON.stringify(thCreds, null, 2));
    }

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: '✅ Instagram + Threads tokens refreshed. New expiry: +60 days.' })
    });

    res.json({ ok: true, message: 'Instagram + Threads tokens refreshed.' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/refresh-linkedin', (req, res) => {
  const clientId = '78j02ertscfztd';
  const redirectUri = encodeURIComponent('https://resendhook.bornesystems.com/linkedin-callback');
  const scope = encodeURIComponent('openid profile email w_member_social');
  res.redirect(`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`);
});

app.get('/linkedin-callback', async (req, res) => {
  try {
    const { code } = req.query;
    const clientId = '78j02ertscfztd';
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = 'https://resendhook.bornesystems.com/linkedin-callback';

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=authorization_code&code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}`
    });
    const tokenData = await tokenRes.json();

    if (tokenData.access_token) {
      const creds = JSON.parse(fs.readFileSync('/home/saint/.openclaw/credentials/linkedin.json', 'utf8'));
      creds.access_token = tokenData.access_token;
      creds.created = new Date().toISOString().split('T')[0];
      creds.expires_in_days = 60;
      fs.writeFileSync('/home/saint/.openclaw/credentials/linkedin.json', JSON.stringify(creds, null, 2));

      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: '✅ LinkedIn token refreshed. New expiry: +60 days.' })
      });

      res.send('<html><body style="background:#050608;color:#E8EDF5;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><h2>✅ LinkedIn token refreshed. You can close this tab.</h2></body></html>');
    } else {
      res.send('<html><body style="background:#050608;color:#EF4444;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><h2>❌ Token refresh failed. Check logs.</h2></body></html>');
    }
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

// ── START ────────────────────────────────────────────────────
app.listen(port, "127.0.0.1", () => {
  console.log(`Resend webhook listener running on http://127.0.0.1:${port}`);
});
