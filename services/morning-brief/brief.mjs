import crypto from "crypto";
import fs from "fs";

// --- Config ---
const BASE = process.env.X_API_BASE || "https://api.twitter.com/2";
const CONSUMER_KEY = process.env.X_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.X_CONSUMER_SECRET;
const USER_ID = "2027664778642989056";
const LOCATION = process.env.BRIEF_LOCATION || "New York";

// --- OAuth 1.0a (App-only with consumer key/secret -> Bearer) ---
async function getBearerToken() {
  const creds = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const res = await fetch("https://api.twitter.com/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Bearer token error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

// --- Twitter: fetch recent tweets from user timeline ---
async function fetchTimeline(token) {
  const url = `${BASE}/users/${USER_ID}/tweets?max_results=10&tweet.fields=created_at,text`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { error: `Timeline fetch failed: ${res.status} ${await res.text()}` };
  return await res.json();
}

// --- Twitter: fetch mentions ---
async function fetchMentions(token) {
  const url = `${BASE}/users/${USER_ID}/mentions?max_results=10&tweet.fields=created_at,text,author_id`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { error: `Mentions fetch failed: ${res.status} ${await res.text()}` };
  return await res.json();
}

// --- Weather via wttr.in ---
async function fetchWeather(location) {
  try {
    const res = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=3`);
    if (!res.ok) return `Weather unavailable (${res.status})`;
    return (await res.text()).trim();
  } catch (e) {
    return `Weather error: ${e.message}`;
  }
}

// --- Tasks from TODO.md ---
function fetchTasks() {
  const todoPath = "/home/saint/.openclaw/workspace/TODO.md";
  try {
    return fs.readFileSync(todoPath, "utf8").trim();
  } catch {
    return "No TODO.md found.";
  }
}

// --- Compose brief ---
function composeBrief({ weather, tasks, timeline, mentions }) {
  const now = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  let brief = `Morning Brief - ${now}\n${"=".repeat(40)}\n\n`;

  brief += `Weather: ${weather}\n\n`;

  brief += `Tasks:\n${tasks}\n\n`;

  brief += `Recent Tweets:\n`;
  if (timeline.error) {
    brief += `  ${timeline.error}\n`;
  } else if (timeline.data && timeline.data.length > 0) {
    timeline.data.slice(0, 5).forEach((t) => {
      brief += `  - ${t.text.slice(0, 120)}${t.text.length > 120 ? "..." : ""}\n`;
    });
  } else {
    brief += `  No recent tweets.\n`;
  }

  brief += `\nMentions:\n`;
  if (mentions.error) {
    brief += `  ${mentions.error}\n`;
  } else if (mentions.data && mentions.data.length > 0) {
    mentions.data.slice(0, 5).forEach((m) => {
      brief += `  - ${m.text.slice(0, 120)}${m.text.length > 120 ? "..." : ""}\n`;
    });
  } else {
    brief += `  No recent mentions.\n`;
  }

  return brief;
}

// --- Main ---
async function main() {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    console.error("Missing X_CONSUMER_KEY or X_CONSUMER_SECRET");
    process.exit(1);
  }

  const token = await getBearerToken();
  const [weather, timeline, mentions] = await Promise.all([
    fetchWeather(LOCATION),
    fetchTimeline(token),
    fetchMentions(token),
  ]);
  const tasks = fetchTasks();
  const brief = composeBrief({ weather, tasks, timeline, mentions });

  // Output
  console.log(brief);

  // Save to file
  const outDir = "/home/saint/.openclaw/workspace/services/morning-brief/logs";
  fs.mkdirSync(outDir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(`${outDir}/brief-${date}.txt`, brief);
  console.log(`Saved to ${outDir}/brief-${date}.txt`);
}

main().catch((e) => {
  console.error("Brief failed:", e.message);
  process.exit(1);
});
