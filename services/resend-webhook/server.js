import express from "express";
import fs from "fs";
import path from "path";
import { Webhook } from "svix";

const app = express();
const port = process.env.PORT || 3001;
const webhook = new Webhook(process.env.RESEND_WEBHOOK_SECRET || "");

app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

app.post(
  "/resend",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const payload = req.body.toString("utf8");
    const headers = {
      id: req.header("svix-id"),
      timestamp: req.header("svix-timestamp"),
      signature: req.header("svix-signature"),
    };

    const logDir = "/home/saint/.openclaw/workspace/services/resend-webhook/logs";
    fs.mkdirSync(logDir, { recursive: true });
    const logPath = path.join(logDir, "events.jsonl");

    // Log all incoming requests (even invalid) for debugging reachability
    fs.appendFileSync(logPath, JSON.stringify({
      receivedAt: new Date().toISOString(),
      headers: {
        "svix-id": headers.id,
        "svix-timestamp": headers.timestamp,
        "svix-signature": headers.signature,
        "user-agent": req.header("user-agent"),
      },
      payload,
      note: "raw"
    }) + "\n");

    try {
      const result = webhook.verify(payload, {
        "svix-id": headers.id,
        "svix-timestamp": headers.timestamp,
        "svix-signature": headers.signature,
      });

      fs.appendFileSync(logPath, JSON.stringify({
        receivedAt: new Date().toISOString(),
        event: result,
        note: "verified"
      }) + "\n");

      res.status(200).send("ok");
    } catch (err) {
      fs.appendFileSync(logPath, JSON.stringify({
        receivedAt: new Date().toISOString(),
        error: err?.message || String(err),
        note: "verify_failed"
      }) + "\n");
      res.status(400).send("invalid webhook");
    }
  }
);

app.listen(port, "127.0.0.1", () => {
  console.log(`Resend webhook listener running on http://127.0.0.1:${port}`);
});
