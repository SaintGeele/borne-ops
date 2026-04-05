Command Center — Full Build Plan
Overview
A single-user business dashboard that aggregates data from Stripe, YouTube, Instagram, X, Facebook Ads, ClickUp, Skool, Google Calendar, Revolut, Mercury, Whoop, Help Scout (×2), Kit (ConvertKit), and a manual Partnerships tracker into one clean, Linear-inspired interface with natural language querying and an AI Business Coach powered by Claude Opus 4.6 and Sonnet 4.5.
Stack: Next.js 14 (App Router) · MongoDB · NextAuth · Tailwind CSS · Claude API

Phase 0: Project Setup & Infrastructure (Day 1)
0.1 Initialize Project
npx create-next-app@latest buildmyagent-dash --typescript --tailwind --app --src-dir
cd buildmyagent-dash
npm install mongoose next-auth @auth/mongodb-adapter
npm install stripe @google/youtube axios
npm install date-fns recharts lucide-react
npm install @anthropic-ai/sdk  # for query feature

0.2 Environment Variables (.env.local)
# Auth
NEXTAUTH_SECRET=<generate-with-openssl>
NEXTAUTH_URL=http://localhost:3000
ALLOWED_IPS=<your-static-ip>,127.0.0.1

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/buildmyagent

# Stripe
STRIPE_SECRET_KEY=sk_live_...

# YouTube
YOUTUBE_API_KEY=AIza...
YOUTUBE_CHANNEL_ID=UC...

# Instagram (via Facebook Graph API)
INSTAGRAM_ACCESS_TOKEN=EAA...
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841...

# Facebook Ads
META_ADS_ACCESS_TOKEN=EAA...
META_AD_ACCOUNT_ID=act_...

# X (Twitter) - Scraping (no API needed)
X_USERNAME=yourusername

# Skool - Scraping
SKOOL_EMAIL=your@email.com
SKOOL_PASSWORD=your_skool_password
SKOOL_FREE_GROUP_SLUG=buildmyagent-free
SKOOL_PAID_GROUP_SLUG=buildmyagent-paid


# ClickUp
CLICKUP_API_KEY=pk_...
CLICKUP_TEAM_ID=...

# Google Calendar (OAuth via NextAuth Google provider)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALENDAR_ID=primary

# Mercury (Company 1)
MERCURY_API_TOKEN=...

# Revolut Business (Company 2)
REVOLUT_CLIENT_ID=...
REVOLUT_PRIVATE_KEY=...            # Path or PEM string
REVOLUT_CERTIFICATE=...            # Path or PEM string
REVOLUT_ACCESS_TOKEN=...           # Obtained via OAuth flow
REVOLUT_REFRESH_TOKEN=...

# Whoop
WHOOP_CLIENT_ID=...
WHOOP_CLIENT_SECRET=...
WHOOP_ACCESS_TOKEN=...
WHOOP_REFRESH_TOKEN=...

# Help Scout — BuildMyAgent
HELPSCOUT_BMA_APP_ID=...
HELPSCOUT_BMA_APP_SECRET=...

# Help Scout — The 1 Percent
HELPSCOUT_T1P_APP_ID=...
HELPSCOUT_T1P_APP_SECRET=...

# Kit (ConvertKit), and a manual Partnerships tracker
KIT_API_KEY=...

# Claude (for query feature)
ANTHROPIC_API_KEY=sk-ant-...

0.3 MongoDB Schema Design
Collection: metrics
{
  _id: ObjectId,
  platform: "stripe" | "youtube" | "instagram" | "x" | "facebook_ads" | "clickup" | "skool_free" | "skool_paid",
  metric_type: string,        // e.g. "mrr", "subscribers", "followers", "tasks_total"
  value: number,
  metadata: object,           // platform-specific extra data
  recorded_at: Date,          // when the snapshot was taken
  created_at: Date
}

Index: { platform: 1, metric_type: 1, recorded_at: -1 }

Collection: skool_entries (manual input)
{
  _id: ObjectId,
  group: "free" | "paid",
  members: number,
  revenue: number | null,     // only for paid
  churn: number | null,       // only for paid
  notes: string,
  recorded_at: Date
}

Collection: sync_logs
{
  _id: ObjectId,
  platform: string,
  status: "success" | "error",
  records_written: number,
  error_message: string | null,
  duration_ms: number,
  synced_at: Date
}

0.4 IP Firewall Middleware
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  // Skip IP check in development
  if (process.env.NODE_ENV === 'development') return NextResponse.next();

  if (!allowedIPs.includes(clientIP)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};


Phase 1: Auth & Layout Shell (Day 1–2)
1.1 NextAuth Configuration
Use Credentials Provider (email + password) since this is single-user
Store hashed password in MongoDB users collection
Session strategy: JWT (stateless, simpler)
Protect all routes — redirect to /login if unauthenticated
// src/app/api/auth/[...nextauth]/route.ts
// Credentials provider with bcrypt password check against MongoDB

1.2 Layout & Navigation
See buildmyagent-design-spec.md for the complete design specification. It covers: color system (dark + light themes), typography (Geist + Geist Mono), spacing/grid, every component spec (KPI cards, charts, tables, sidebar, command bar, buttons, badges), all animations with exact durations/easing, page layouts, Tailwind config, theme provider implementation, and anti-patterns to avoid.
Key design decisions (summary):
Dark mode default with light mode toggle (sun/moon icon in sidebar)
Geist font family (body) + Geist Mono (all numbers/metrics)
Accent color: #8B5CF6 (violet) — used ONLY for interactive elements
12-column CSS grid, 24px gap, 240px fixed sidebar
Cards: --bg-surface with 1px subtle borders, 8px radius, no shadows in dark mode
All metric values use monospace tabular numerals for perfect alignment
KPI cards count-up on load with staggered entrance animation
⌘K command bar for natural language queries
Sidebar structure:
◆ albertolgaard.com
─────────────
Overview
Revenue          (Stripe)
Content          (expandable)
  ├ YouTube
  ├ Instagram
  └ X
Ads              (Meta)
Community        (expandable)
  ├ Skool Free
  └ Skool Paid
Tasks            (ClickUp)
Calendar         (Google Calendar)
Finances         (expandable)
  ├ Mercury      (Company 1)
  └ Revolut      (Company 2)
Health           (Whoop)
Support          (expandable)
  ├ BuildMyAgent (Help Scout)
  └ The 1 Percent (Help Scout)
Email            (Kit / ConvertKit)
Partnerships     (Manual)
Coach            (AI — Claude)
─────────────
⌘K  Query
⚙   Settings
☀   Theme toggle


Phase 2: Platform Integrations — Sync Services (Days 2–5)
Each integration follows the same pattern:
Service file (src/lib/services/<platform>.ts) — Fetches data from API
API route (src/app/api/sync/<platform>/route.ts) — Triggers sync, writes to MongoDB
Dashboard route (src/app/api/<platform>/route.ts) — Reads from MongoDB for UI

2.1 Stripe Integration
API Docs: https://docs.stripe.com/api
Metrics to collect:
Metric
API Endpoint
Notes
MRR
stripe.subscriptions.list
Sum of active sub amounts
Total Revenue (30d)
stripe.charges.list
Filter by created date
Active Customers
stripe.customers.list
Count where subscriptions active
Churn Rate
Derived
(Canceled subs / Total subs start of period)
New Subscriptions (30d)
stripe.subscriptions.list
Filter by created date
Failed Payments
stripe.charges.list
Filter status=failed
Net Revenue
stripe.balanceTransactions.list
Sum of net amounts
ARPU
Derived
MRR / Active Customers

Implementation:
// src/lib/services/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function syncStripeMetrics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 1. Get all active subscriptions for MRR
  const subs = await stripe.subscriptions.list({
    status: 'active',
    limit: 100,
    expand: ['data.items'],
  });
  const mrr = subs.data.reduce((sum, sub) => {
    return sum + sub.items.data.reduce((s, item) => s + (item.price?.unit_amount || 0), 0);
  }, 0) / 100;

  // 2. Get charges for revenue
  const charges = await stripe.charges.list({
    created: { gte: Math.floor(thirtyDaysAgo.getTime() / 1000) },
    limit: 100,
  });
  const revenue30d = charges.data
    .filter(c => c.status === 'succeeded')
    .reduce((sum, c) => sum + c.amount, 0) / 100;

  // 3. Churn — canceled subs in period
  const canceled = await stripe.subscriptions.list({
    status: 'canceled',
    created: { gte: Math.floor(thirtyDaysAgo.getTime() / 1000) },
    limit: 100,
  });

  return {
    mrr,
    revenue_30d: revenue30d,
    active_subscriptions: subs.data.length,
    canceled_subscriptions_30d: canceled.data.length,
    churn_rate: subs.data.length > 0
      ? (canceled.data.length / (subs.data.length + canceled.data.length)) * 100
      : 0,
    failed_charges_30d: charges.data.filter(c => c.status === 'failed').length,
    arpu: subs.data.length > 0 ? mrr / subs.data.length : 0,
  };
}


2.2 YouTube Integration
API: YouTube Data API v3
Metrics to collect:
Metric
Endpoint
Notes
Subscribers
channels.list (statistics)
part=statistics
Total Views
channels.list (statistics)


Video Count
channels.list (statistics)


Videos This Month
search.list
publishedAfter filter
Recent Video Performance
videos.list
views/likes per video

Implementation:
// src/lib/services/youtube.ts
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export async function syncYouTubeMetrics() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  // Channel stats
  const channelRes = await fetch(
    `${BASE_URL}/channels?part=statistics,snippet&id=${channelId}&key=${apiKey}`
  );
  const channelData = await channelRes.json();
  const stats = channelData.items[0].statistics;

  // Videos posted this month
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);

  const searchRes = await fetch(
    `${BASE_URL}/search?part=id&channelId=${channelId}&type=video&publishedAfter=${firstOfMonth.toISOString()}&maxResults=50&key=${apiKey}`
  );
  const searchData = await searchRes.json();

  return {
    subscribers: parseInt(stats.subscriberCount),
    total_views: parseInt(stats.viewCount),
    total_videos: parseInt(stats.videoCount),
    videos_this_month: searchData.pageInfo.totalResults,
  };
}


2.3 Instagram Integration
API: Instagram Graph API (requires Facebook Business account)
Metrics:
Metric
Endpoint
Followers
GET /{user-id}?fields=followers_count
Posts Count
GET /{user-id}?fields=media_count
Recent Posts
GET /{user-id}/media?fields=like_count,comments_count,timestamp
Follower Growth
Derived from stored snapshots

// src/lib/services/instagram.ts
const BASE_URL = 'https://graph.facebook.com/v19.0';

export async function syncInstagramMetrics() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  const profileRes = await fetch(
    `${BASE_URL}/${accountId}?fields=followers_count,media_count,username&access_token=${token}`
  );
  const profile = await profileRes.json();

  // Recent media for engagement
  const mediaRes = await fetch(
    `${BASE_URL}/${accountId}/media?fields=like_count,comments_count,timestamp,media_type&limit=30&access_token=${token}`
  );
  const media = await mediaRes.json();

  const postsThisMonth = media.data.filter((m: any) => {
    return new Date(m.timestamp).getMonth() === new Date().getMonth();
  });

  return {
    followers: profile.followers_count,
    total_posts: profile.media_count,
    posts_this_month: postsThisMonth.length,
    avg_likes_recent: media.data.reduce((s: number, m: any) => s + (m.like_count || 0), 0) / media.data.length,
    avg_comments_recent: media.data.reduce((s: number, m: any) => s + (m.comments_count || 0), 0) / media.data.length,
  };
}


2.4 X (Twitter) — Puppeteer Scraping (Free)
Instead of the $100/mo X API, we scrape your public profile page with Puppeteer — the same approach used for Skool. For just pulling your own profile stats a few times per day, this is free and reliable.
Alternative options if Puppeteer breaks:
Twikit — Free open-source Python library using Twitter's internal API (github.com/d60/twikit)
Lobstr.io — ~$0.0005/result with a free tier of 100 results/month
Apify Twitter Scraper — Pay-per-result, ~$0.25 per 1,000 tweets
Metrics to scrape from profile page:
Metric
Location on Page
Followers
Profile header stats
Following
Profile header stats
Total Posts
Profile header stats
Posts This Month
Scroll timeline, filter by date

Implementation:
// src/lib/services/x.ts
import puppeteer from 'puppeteer';

export async function syncXMetrics() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Set a realistic user agent to avoid blocks
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    const username = process.env.X_USERNAME; // your handle without @

    // Navigate to public profile (no login needed for public stats)
    await page.goto(`https://x.com/${username}`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for profile stats to render
    await page.waitForSelector('[data-testid="UserName"]', { timeout: 10000 });

    // Extract stats from profile header
    const stats = await page.evaluate(() => {
      // X renders follower/following counts in specific link elements
      // These selectors target the public profile stats section
      const getText = (selector: string): string => {
        const el = document.querySelector(selector);
        return el?.textContent || '0';
      };

      // Parse "12.4K" style numbers
      const parseCount = (text: string): number => {
        const clean = text.replace(/,/g, '').trim();
        if (clean.endsWith('K')) return parseFloat(clean) * 1000;
        if (clean.endsWith('M')) return parseFloat(clean) * 1000000;
        return parseInt(clean, 10) || 0;
      };

      // Find follower/following links in the profile
      const links = Array.from(document.querySelectorAll('a[href*="/followers"], a[href*="/following"], a[href*="/verified_followers"]'));

      let followers = 0;
      let following = 0;

      links.forEach(link => {
        const href = (link as HTMLAnchorElement).href;
        const countEl = link.querySelector('span span') || link.querySelector('span');
        const count = countEl ? parseCount(countEl.textContent || '0') : 0;

        if (href.includes('/followers') && !href.includes('/verified')) {
          followers = count;
        } else if (href.includes('/following')) {
          following = count;
        }
      });

      return { followers, following };
    });

    // For post count: X shows this in the profile header as well
    // If not easily parseable, we can count visible tweets as an approximation
    // or use the profile's post count from the header subtitle

    return {
      followers: stats.followers,
      following: stats.following,
      // Posts this month requires scrolling the timeline — start with totals
      // and add monthly counting in v2 if needed
    };
  } finally {
    await browser.close();
  }
}

Important notes on X scraping:
X.com is aggressive with anti-scraping — use realistic user agents and add random delays
Public profiles load without login, but may occasionally show login walls
Run at most 3–4x per day to stay under the radar
Selectors WILL change — build alerts for when scraping returns 0 values
Fallback: Add a manual entry form (same pattern as Skool fallback)
Consider running through a residential proxy if you get blocked
For "posts this month" counting: either scroll the timeline (fragile) or just track the total post count daily and calculate the delta

2.5 Facebook Ads Integration
API: Meta Marketing API
Metrics:
Metric
API Field
Total Spend
spend
Impressions
impressions
Clicks
clicks
CTR
ctr
CPC
cpc
CPM
cpm
Conversions
actions (filtered)
ROAS
purchase_roas

// src/lib/services/facebook-ads.ts
const BASE_URL = 'https://graph.facebook.com/v19.0';

export async function syncFacebookAdsMetrics() {
  const token = process.env.META_ADS_ACCESS_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT_ID;

  // Last 30 days insights
  const insightsRes = await fetch(
    `${BASE_URL}/${adAccountId}/insights?fields=spend,impressions,clicks,ctr,cpc,cpm,actions,cost_per_action_type,purchase_roas&date_preset=last_30d&access_token=${token}`
  );
  const insights = await insightsRes.json();
  const data = insights.data?.[0] || {};

  // Active campaigns count
  const campaignsRes = await fetch(
    `${BASE_URL}/${adAccountId}/campaigns?effective_status=["ACTIVE"]&limit=100&access_token=${token}`
  );
  const campaigns = await campaignsRes.json();

  return {
    spend_30d: parseFloat(data.spend || '0'),
    impressions_30d: parseInt(data.impressions || '0'),
    clicks_30d: parseInt(data.clicks || '0'),
    ctr: parseFloat(data.ctr || '0'),
    cpc: parseFloat(data.cpc || '0'),
    cpm: parseFloat(data.cpm || '0'),
    roas: data.purchase_roas?.[0]?.value || 0,
    active_campaigns: campaigns.data?.length || 0,
    conversions_30d: data.actions?.find((a: any) => a.action_type === 'offsite_conversion.fb_pixel_purchase')?.value || 0,
  };
}


2.6 ClickUp Integration
API: ClickUp API v2
Metrics:
Metric
Endpoint
My Open Tasks
GET /team/{team_id}/task?assignees[]=me&statuses[]=open
My Completed (30d)
Filter by date_done
Assistant's Open Tasks
Same with assistant's user ID
Assistant's Completed
Same with date filter
Overdue Tasks
Filter by due_date < now

// src/lib/services/clickup.ts
export async function syncClickUpMetrics() {
  const apiKey = process.env.CLICKUP_API_KEY;
  const teamId = process.env.CLICKUP_TEAM_ID;
  const headers = { 'Authorization': apiKey! };

  // Get all tasks
  const tasksRes = await fetch(
    `https://api.clickup.com/api/v2/team/${teamId}/task?subtasks=true&include_closed=true`,
    { headers }
  );
  const tasks = await tasksRes.json();

  // You'll need to set these in env
  const myUserId = process.env.CLICKUP_MY_USER_ID;
  const assistantUserId = process.env.CLICKUP_ASSISTANT_USER_ID;

  const myTasks = tasks.tasks?.filter((t: any) =>
    t.assignees?.some((a: any) => a.id.toString() === myUserId)
  ) || [];

  const assistantTasks = tasks.tasks?.filter((t: any) =>
    t.assignees?.some((a: any) => a.id.toString() === assistantUserId)
  ) || [];

  return {
    my_open_tasks: myTasks.filter((t: any) => t.status.type !== 'closed').length,
    my_completed_tasks: myTasks.filter((t: any) => t.status.type === 'closed').length,
    assistant_open_tasks: assistantTasks.filter((t: any) => t.status.type !== 'closed').length,
    assistant_completed_tasks: assistantTasks.filter((t: any) => t.status.type === 'closed').length,
    total_tasks: tasks.tasks?.length || 0,
    overdue_tasks: tasks.tasks?.filter((t: any) =>
      t.due_date && new Date(parseInt(t.due_date)) < new Date() && t.status.type !== 'closed'
    ).length || 0,
  };
}


2.7 Skool (Puppeteer Scraping)
Since there's no API, we use headless browser scraping to pull stats from the Skool admin dashboard.
Prerequisites:
Puppeteer installed (npm install puppeteer)
Your Skool login credentials stored in env vars
Chromium available on the server (Puppeteer bundles it)
Metrics to scrape:
Metric
Source Page
Selector Strategy
Total Members
Group admin → Members tab
Parse member count from header
Revenue (paid)
Group admin → Revenue/Billing
Parse from billing dashboard
New Members (30d)
Members tab sorted by join date
Count recent entries
Churn (paid)
Canceled members list
Count cancellations

Implementation:
// src/lib/services/skool.ts
import puppeteer from 'puppeteer';

export async function syncSkoolMetrics(group: 'free' | 'paid') {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 1. Login to Skool
    await page.goto('https://www.skool.com/login', { waitUntil: 'networkidle2' });
    await page.type('input[name="email"]', process.env.SKOOL_EMAIL!);
    await page.type('input[name="password"]', process.env.SKOOL_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // 2. Navigate to group admin
    const groupSlug = group === 'free'
      ? process.env.SKOOL_FREE_GROUP_SLUG
      : process.env.SKOOL_PAID_GROUP_SLUG;

    await page.goto(`https://www.skool.com/${groupSlug}/about`, {
      waitUntil: 'networkidle2',
    });

    // 3. Extract member count from the page
    // NOTE: Selectors will need adjustment based on Skool's actual DOM
    // Use page.evaluate() to extract text content from the right elements
    const memberCount = await page.evaluate(() => {
      // Look for member count in the group header/about section
      // This selector WILL need to be updated based on actual DOM inspection
      const memberEl = document.querySelector('[data-testid="member-count"]')
        || document.querySelector('.member-count');
      if (memberEl) {
        const text = memberEl.textContent || '';
        return parseInt(text.replace(/[^0-9]/g, ''), 10);
      }
      return 0;
    });

    // 4. For paid group: navigate to billing/revenue section
    let revenue = null;
    let churn = null;
    if (group === 'paid') {
      await page.goto(`https://www.skool.com/${groupSlug}/settings/billing`, {
        waitUntil: 'networkidle2',
      });
      // Extract revenue and churn data from billing page
      const billingData = await page.evaluate(() => {
        // Parse revenue figures from the billing dashboard
        // Selectors need inspection of actual Skool billing page DOM
        return { revenue: 0, canceledThisMonth: 0 };
      });
      revenue = billingData.revenue;
      churn = billingData.canceledThisMonth;
    }

    return {
      members: memberCount,
      revenue,
      churn,
      group,
    };
  } finally {
    await browser.close();
  }
}

Important notes on Skool scraping:
Skool's DOM structure may change without notice — build a health check that alerts you if selectors break
Add a manual override form as fallback (simple CRUD endpoint) in case scraping fails
Run scraper at most 2–3x per day to avoid any rate limiting or account flags
Store Skool credentials encrypted; consider a dedicated Skool account for scraping
First time setup: manually inspect Skool's DOM with DevTools to get accurate selectors
Fallback: Manual entry endpoint
// src/app/api/skool/manual/route.ts
// POST - Quick manual entry if scraper breaks
// Fields: group, members, revenue, churn, date, notes


2.8 Google Calendar Integration
API: Google Calendar API v3 (free, OAuth 2.0 via NextAuth Google provider)
Since we're already using NextAuth, we add Google as an OAuth provider and request the calendar.readonly scope. This gives us read access to the user's calendar without any extra API keys — the OAuth token from login doubles as the Calendar API credential.
Metrics / Data to collect:
Data
Endpoint
Notes
Today's events
events.list with timeMin/timeMax
Primary calendar
This week's events
Same, wider range
For weekly view
Upcoming events (next 7 days)
Same
For overview widget
Event count by day
Derived
For the calendar heatmap
Free/busy time
freebusy.query
To show utilization

NextAuth Google Provider Setup:
// In your NextAuth config — add Google provider with calendar scope
import GoogleProvider from 'next-auth/providers/google';

GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
      access_type: 'offline',     // Get refresh token for background syncs
      prompt: 'consent',          // Force consent to ensure refresh token
    },
  },
})

// IMPORTANT: Store the access_token and refresh_token in the JWT callback
// so we can use them server-side to call the Calendar API

Implementation:
// src/lib/services/google-calendar.ts
import { google } from 'googleapis';

export async function getCalendarEvents(
  accessToken: string,
  timeMin: Date,
  timeMax: Date
) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,          // Expand recurring events
    orderBy: 'startTime',
    maxResults: 100,
  });

  const events = response.data.items || [];

  return events.map(event => ({
    id: event.id,
    title: event.summary || '(No title)',
    description: event.description || '',
    start: event.start?.dateTime || event.start?.date,
    end: event.end?.dateTime || event.end?.date,
    isAllDay: !event.start?.dateTime,    // date-only = all-day event
    location: event.location || null,
    meetLink: event.hangoutLink || null,
    status: event.status,                // confirmed, tentative, cancelled
    attendees: event.attendees?.length || 0,
    color: event.colorId || null,
  }));
}

export async function getTodaysEvents(accessToken: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
  return getCalendarEvents(accessToken, startOfDay, endOfDay);
}

export async function getWeekEvents(accessToken: string) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());  // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
  return getCalendarEvents(accessToken, startOfWeek, endOfWeek);
}

export async function getUpcomingEvents(accessToken: string, days: number = 7) {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return getCalendarEvents(accessToken, now, future);
}

API route:
// src/app/api/calendar/route.ts
// GET ?range=today|week|upcoming|month
// Returns events from Google Calendar using the stored OAuth token
// No MongoDB caching needed — always fetch live from Google (fast enough)
// This is the one integration that does NOT go through the sync engine
// because calendar data changes frequently and the API is fast

Key notes:
Google Calendar data is fetched live (not cached in MongoDB) since it changes constantly and the API is fast
We need access_type: 'offline' to get a refresh token so the token doesn't expire
Store both access_token and refresh_token in the NextAuth JWT — refresh automatically when expired
The googleapis npm package handles token refresh if you configure the OAuth2 client with the refresh token
Calendar events feed into the ⌘K query system too — "What meetings do I have tomorrow?"

2.9 Mercury Integration (Company 1)
API: Mercury API (free, Bearer token auth)
Mercury has the simplest banking API — just a Bearer token in the header. Generate it from Mercury Dashboard → Settings → API.
Metrics to collect:
Metric
Endpoint
Notes
Account Balance
GET /accounts
Current balance per account
Transactions
GET /account/{id}/transactions
Filter by date range
Income (30d)
Derived
Sum of credit transactions
Expenses (30d)
Derived
Sum of debit transactions
Net Cash Flow
Derived
Income - Expenses
Top Expense Categories
Derived
Group by counterparty/description

Implementation:
// src/lib/services/mercury.ts
const BASE_URL = 'https://backend.mercury.com/api/v1';

async function mercuryFetch(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${process.env.MERCURY_API_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Mercury API error: ${res.status}`);
  return res.json();
}

export async function syncMercuryMetrics() {
  // 1. Get all accounts
  const { accounts } = await mercuryFetch('/accounts');
  const totalBalance = accounts.reduce(
    (sum: number, acc: any) => sum + acc.currentBalance, 0
  );

  // 2. Get transactions for last 30 days (across all accounts)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let allTransactions: any[] = [];
  for (const account of accounts) {
    const { transactions } = await mercuryFetch(
      `/account/${account.id}/transactions?start=${thirtyDaysAgo.toISOString()}&limit=500`
    );
    allTransactions.push(
      ...transactions.map((t: any) => ({ ...t, accountName: account.name }))
    );
  }

  // 3. Categorize income vs expenses
  const completed = allTransactions.filter(t => t.status === 'sent' || t.status === 'received');
  const income = completed
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = completed
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // 4. Top expense categories (group by counterparty)
  const expensesByCounterparty: Record<string, number> = {};
  completed.filter(t => t.amount < 0).forEach(t => {
    const name = t.counterpartyName || 'Unknown';
    expensesByCounterparty[name] = (expensesByCounterparty[name] || 0) + Math.abs(t.amount);
  });
  const topExpenses = Object.entries(expensesByCounterparty)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  return {
    balance: totalBalance,
    income_30d: income,
    expenses_30d: expenses,
    net_cash_flow_30d: income - expenses,
    transaction_count_30d: completed.length,
    top_expenses: topExpenses,
    accounts: accounts.map((a: any) => ({
      name: a.name,
      balance: a.currentBalance,
      type: a.type,
    })),
  };
}


2.10 Revolut Business Integration (Company 2)
API: Revolut Business API (free with Grow/Scale/Enterprise plans, JWT + certificate auth)
Revolut's auth is more involved than Mercury — it uses mutual TLS with a client certificate. You generate a certificate in the Revolut Business dashboard, upload it, and use it to sign requests.
Auth setup steps:
Revolut Business Dashboard → Settings → APIs → Business API
Generate an API certificate (or upload your own)
Download the private key
Create a JWT signed with the private key to exchange for an access token
Store access_token and refresh_token — refresh when expired (40 min expiry)
Metrics to collect:
Metric
Endpoint
Notes
Account Balances
GET /accounts
Balance per currency/account
Transactions
GET /transactions
Filter by from/to dates, type
Income (30d)
Derived
Sum of incoming transactions
Expenses (30d)
Derived
Sum of outgoing transactions
Net Cash Flow
Derived
Income - Expenses
By Type
Derived
card_payment, transfer, exchange, fee

Implementation:
// src/lib/services/revolut.ts
import jwt from 'jsonwebtoken';
import fs from 'fs';

const BASE_URL = 'https://b2b.revolut.com/api/1.0';

// Token management — store in DB or memory, refresh when expired
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.accessToken;
  }

  // Use refresh token to get new access token
  const res = await fetch('https://b2b.revolut.com/api/1.0/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.REVOLUT_REFRESH_TOKEN!,
      client_id: process.env.REVOLUT_CLIENT_ID!,
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: generateClientAssertion(),
    }),
  });

  const data = await res.json();
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };
  return cachedToken.accessToken;
}

function generateClientAssertion(): string {
  const privateKey = process.env.REVOLUT_PRIVATE_KEY!;
  return jwt.sign(
    {
      iss: process.env.REVOLUT_CLIENT_ID,
      sub: process.env.REVOLUT_CLIENT_ID,
      aud: 'https://revolut.com',
    },
    privateKey,
    { algorithm: 'RS256', expiresIn: '2m' }
  );
}

async function revolutFetch(endpoint: string) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Revolut API error: ${res.status}`);
  return res.json();
}

export async function syncRevolutMetrics() {
  // 1. Get all accounts
  const accounts = await revolutFetch('/accounts');
  const totalBalance = accounts.reduce(
    (sum: number, acc: any) => sum + acc.balance, 0
  );

  // 2. Get transactions (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const transactions = await revolutFetch(
    `/transactions?from=${thirtyDaysAgo.toISOString()}&count=1000`
  );

  // 3. Categorize
  const completed = transactions.filter((t: any) =>
    t.state === 'completed'
  );

  const income = completed
    .filter((t: any) => t.legs?.some((l: any) => l.amount > 0))
    .reduce((sum: number, t: any) => {
      const incomeLeg = t.legs.find((l: any) => l.amount > 0);
      return sum + (incomeLeg?.amount || 0);
    }, 0);

  const expenses = completed
    .filter((t: any) => t.legs?.some((l: any) => l.amount < 0))
    .reduce((sum: number, t: any) => {
      const expLeg = t.legs.find((l: any) => l.amount < 0);
      return sum + Math.abs(expLeg?.amount || 0);
    }, 0);

  // 4. Breakdown by type
  const byType: Record<string, number> = {};
  completed.forEach((t: any) => {
    byType[t.type] = (byType[t.type] || 0) + 1;
  });

  return {
    balance: totalBalance,
    income_30d: income,
    expenses_30d: expenses,
    net_cash_flow_30d: income - expenses,
    transaction_count_30d: completed.length,
    by_type: byType,
    accounts: accounts.map((a: any) => ({
      name: a.name,
      balance: a.balance,
      currency: a.currency,
    })),
  };
}

Important notes on Revolut:
Access tokens expire every 40 minutes — must refresh automatically
The initial OAuth flow requires manual consent in the Revolut app (one-time)
Max 1,000 transactions per request — paginate for heavy months
Transaction structure uses "legs" (each leg is one side of the transaction)
IP whitelisting is required in Revolut dashboard → set your server's IP

2.11 Whoop Integration (Health & Recovery)
API: Whoop Developer API v2 (free, OAuth 2.0)
Whoop has a clean REST API with OAuth2. You register an app at developer.whoop.com, get a client ID/secret, and the user authorizes via OAuth. It gives you read access to recovery, strain, sleep, workouts, and body measurements.
Available scopes: read:recovery, read:cycles, read:sleep, read:workout, read:profile, read:body_measurement
Metrics to collect:
Metric
Endpoint
Notes
Recovery Score (0–100%)
GET /v2/recovery
How ready your body is today
Strain Score (0–21)
GET /v2/cycle
Daily exertion level
HRV (ms)
Recovery data
Heart rate variability
Resting Heart Rate
Recovery data
BPM
Sleep Performance (%)
GET /v2/sleep
Sleep quality score
Sleep Duration
Sleep data
Total time + per-stage breakdown
Deep Sleep / REM / Light
Sleep data
Stage durations in milliseconds
Workouts
GET /v2/workout
Strain, duration, avg/max HR, calories
SpO2
Recovery data
Blood oxygen (Whoop 4.0+)
Skin Temperature
Recovery data
Whoop 4.0+

Implementation:
// src/lib/services/whoop.ts
const BASE_URL = 'https://api.prod.whoop.com/developer';

// Token management — store access_token and refresh_token in DB
// OAuth flow is handled once via NextAuth or a custom OAuth redirect

async function whoopFetch(endpoint: string, accessToken: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Whoop API error: ${res.status}`);
  return res.json();
}

export async function syncWhoopMetrics(accessToken: string) {
  // 1. Get recent cycles (last 7 days) — contains strain data
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const cycles = await whoopFetch(
    `/v2/cycle?start=${sevenDaysAgo.toISOString()}&limit=7`,
    accessToken
  );

  const latestCycle = cycles.records?.[0];
  const todayStrain = latestCycle?.score?.strain || 0;
  const avgHeartRate = latestCycle?.score?.average_heart_rate || 0;

  // 2. Get recent recoveries
  const recoveries = await whoopFetch(
    `/v2/recovery?start=${sevenDaysAgo.toISOString()}&limit=7`,
    accessToken
  );

  const latestRecovery = recoveries.records?.[0];
  const recoveryScore = latestRecovery?.score?.recovery_score || 0;
  const hrv = latestRecovery?.score?.hrv_rmssd_milli || 0;
  const restingHR = latestRecovery?.score?.resting_heart_rate || 0;
  const spo2 = latestRecovery?.score?.spo2_percentage || null;
  const skinTemp = latestRecovery?.score?.skin_temp_celsius || null;

  // 3. Get recent sleep
  const sleeps = await whoopFetch(
    `/v2/sleep?start=${sevenDaysAgo.toISOString()}&limit=7`,
    accessToken
  );

  const latestSleep = sleeps.records?.[0];
  const sleepScore = latestSleep?.score?.sleep_performance_percentage || 0;
  const stageSummary = latestSleep?.score?.stage_summary || {};
  const totalSleepMs = (stageSummary.total_light_sleep_time_milli || 0)
    + (stageSummary.total_slow_wave_sleep_time_milli || 0)
    + (stageSummary.total_rem_sleep_time_milli || 0);
  const totalSleepHours = totalSleepMs / (1000 * 60 * 60);

  // 4. Get recent workouts
  const workouts = await whoopFetch(
    `/v2/workout?start=${sevenDaysAgo.toISOString()}&limit=25`,
    accessToken
  );

  const workoutsThisWeek = workouts.records || [];
  const totalCaloriesWeek = workoutsThisWeek.reduce(
    (sum: number, w: any) => sum + (w.score?.kilojoule || 0) / 4.184, 0
  );

  // 5. 7-day averages for trends
  const avgRecovery = recoveries.records?.reduce(
    (sum: number, r: any) => sum + (r.score?.recovery_score || 0), 0
  ) / (recoveries.records?.length || 1);

  const avgStrain = cycles.records?.reduce(
    (sum: number, c: any) => sum + (c.score?.strain || 0), 0
  ) / (cycles.records?.length || 1);

  return {
    // Today's snapshot
    recovery_score: recoveryScore,
    strain_score: todayStrain,
    hrv,
    resting_heart_rate: restingHR,
    spo2,
    skin_temp_celsius: skinTemp,

    // Last night's sleep
    sleep_performance: sleepScore,
    sleep_hours: Math.round(totalSleepHours * 10) / 10,
    deep_sleep_min: Math.round((stageSummary.total_slow_wave_sleep_time_milli || 0) / 60000),
    rem_sleep_min: Math.round((stageSummary.total_rem_sleep_time_milli || 0) / 60000),
    light_sleep_min: Math.round((stageSummary.total_light_sleep_time_milli || 0) / 60000),
    awake_min: Math.round((stageSummary.total_awake_time_milli || 0) / 60000),

    // Weekly summary
    workouts_this_week: workoutsThisWeek.length,
    total_calories_week: Math.round(totalCaloriesWeek),
    avg_recovery_7d: Math.round(avgRecovery),
    avg_strain_7d: Math.round(avgStrain * 10) / 10,
    avg_heart_rate: avgHeartRate,

    // Raw arrays for charts
    recovery_history: recoveries.records?.map((r: any) => ({
      date: r.created_at,
      score: r.score?.recovery_score,
      hrv: r.score?.hrv_rmssd_milli,
      rhr: r.score?.resting_heart_rate,
    })),
    strain_history: cycles.records?.map((c: any) => ({
      date: c.start,
      strain: c.score?.strain,
      calories: c.score?.kilojoule ? c.score.kilojoule / 4.184 : 0,
    })),
  };
}

OAuth setup:
Whoop uses standard OAuth 2.0 authorization code flow:
Register an app at https://developer-dashboard.whoop.com
Set redirect URI to https://yourdomain.com/api/auth/callback/whoop
Request all read:* scopes
User authorizes once → store access_token + refresh_token
Tokens refresh via POST https://api.prod.whoop.com/oauth/oauth2/token
You can either add Whoop as a custom OAuth provider in NextAuth, or handle the OAuth flow separately and store the tokens in MongoDB.
Key notes:
API is paginated with nextToken — max 25 records per page
Recovery data is tied to cycles (sleep-to-sleep periods), not calendar days
Strain accumulates throughout the day — the score goes up, never down
HRV is in milliseconds (RMSSD), typical range 20–150ms
Syncs every 6 hours (data updates once per cycle, usually morning)

2.12 Help Scout Integration (Support — 2 Accounts)
API: Help Scout Mailbox API v2 (OAuth 2.0 with client credentials flow)
You have 2 separate Help Scout accounts — one for BuildMyAgent, one for The 1 Percent. Each gets its own OAuth app credentials, and we run the same sync logic against both.
Auth: Client credentials flow (app-level, no user consent needed). For each account: Help Scout → Profile → My Apps → Create OAuth App → get App ID + App Secret. Exchange them for a Bearer token via POST https://api.helpscout.net/v2/oauth2/token.
Metrics to collect (per account):
Metric
Endpoint
Notes
Open Conversations
GET /v2/conversations?status=active
Count from pagination
Pending Conversations
GET /v2/conversations?status=pending
Awaiting customer reply
Closed (30d)
GET /v2/conversations?status=closed&modifiedSince=...
Resolved tickets
Total Conversations (30d)
GET /v2/reports/conversations
Requires Plus/Pro plan
Avg Response Time
GET /v2/reports/company
Requires Plus/Pro
Happiness Score
GET /v2/reports/company
Requires Plus/Pro
Customers Helped (30d)
Reports endpoint
Requires Plus/Pro
Conversations Per Day
Reports endpoint
Requires Plus/Pro

Implementation:
// src/lib/services/helpscout.ts
const TOKEN_URL = 'https://api.helpscout.net/v2/oauth2/token';
const BASE_URL = 'https://api.helpscout.net/v2';

interface HelpScoutAccount {
  name: string;          // "BuildMyAgent" | "The 1 Percent"
  appId: string;
  appSecret: string;
}

// Token cache per account
const tokenCache: Record<string, { token: string; expiresAt: number }> = {};

async function getToken(account: HelpScoutAccount): Promise<string> {
  const cacheKey = account.appId;
  if (tokenCache[cacheKey] && tokenCache[cacheKey].expiresAt > Date.now() + 60000) {
    return tokenCache[cacheKey].token;
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: account.appId,
      client_secret: account.appSecret,
    }),
  });

  const data = await res.json();
  tokenCache[cacheKey] = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };
  return data.access_token;
}

async function hsFetch(endpoint: string, token: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Help Scout API error: ${res.status}`);
  return res.json();
}

export async function syncHelpScoutMetrics(account: HelpScoutAccount) {
  const token = await getToken(account);

  // 1. Get conversation counts by status
  const active = await hsFetch('/v2/conversations?status=active&page=1', token);
  const pending = await hsFetch('/v2/conversations?status=pending&page=1', token);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const closed = await hsFetch(
    `/v2/conversations?status=closed&modifiedSince=${thirtyDaysAgo.toISOString()}&page=1`,
    token
  );

  // 2. Get mailboxes for context
  const mailboxes = await hsFetch('/v2/mailboxes', token);

  // 3. Try reports (Plus/Pro only — gracefully fail)
  let reportData: any = null;
  try {
    const report = await hsFetch(
      `/v2/reports/company?start=${thirtyDaysAgo.toISOString()}&end=${new Date().toISOString()}`,
      token
    );
    reportData = report.current;
  } catch (e) {
    // Reports unavailable on free/standard plan — that's fine
  }

  return {
    account_name: account.name,
    open_conversations: active.page?.totalElements || 0,
    pending_conversations: pending.page?.totalElements || 0,
    closed_30d: closed.page?.totalElements || 0,
    mailbox_count: mailboxes.page?.totalElements || 0,

    // Report data (Plus/Pro only — null if unavailable)
    total_conversations_30d: reportData?.totalConversations || null,
    customers_helped_30d: reportData?.customersHelped || null,
    conversations_per_day: reportData?.conversationsPerDay || null,
    avg_response_time_sec: reportData?.responseTime || null,
    avg_resolution_time_sec: reportData?.resolutionTime || null,
    happiness_score: reportData?.happinessScore || null,
    resolved_on_first_reply_pct: reportData?.percentResolvedOnFirstReply || null,
  };
}

// Sync both accounts
export async function syncAllHelpScout() {
  const accounts: HelpScoutAccount[] = [
    {
      name: 'BuildMyAgent',
      appId: process.env.HELPSCOUT_BMA_APP_ID!,
      appSecret: process.env.HELPSCOUT_BMA_APP_SECRET!,
    },
    {
      name: 'The 1 Percent',
      appId: process.env.HELPSCOUT_T1P_APP_ID!,
      appSecret: process.env.HELPSCOUT_T1P_APP_SECRET!,
    },
  ];

  const results = await Promise.all(
    accounts.map(acc => syncHelpScoutMetrics(acc))
  );

  return {
    buildmyagent: results[0],
    the1percent: results[1],
    combined: {
      total_open: results.reduce((s, r) => s + r.open_conversations, 0),
      total_pending: results.reduce((s, r) => s + r.pending_conversations, 0),
      total_closed_30d: results.reduce((s, r) => s + r.closed_30d, 0),
    },
  };
}

Key notes:
Client credentials tokens expire in ~48 hours — auto-refresh before expiry
Conversation listing (active/pending/closed) works on ALL plans
Report endpoints (/v2/reports/*) require Plus or Pro — the code gracefully falls back to null
Help Scout uses "conversations" not "tickets" — we label them as "tickets" in the UI since that's more intuitive
Rate limit: 400 requests per minute per OAuth app — plenty for syncing
Syncs every 2 hours (support data changes frequently)

2.13 Kit (ConvertKit) Integration (Email Marketing)
API: Kit API V4 — https://api.kit.com/v4/
Auth: API key via X-Kit-Api-Key header. Get it from Kit → Settings → Advanced → API. V4 API keys are different from V3 — generate a new one if you were on V3.
Metrics to collect:
Metric
Endpoint
Notes
Total Subscribers
GET /v4/subscribers?status=active
Paginate to get total count
New Subscribers (30d)
GET /v4/subscribers?created_after=...
Filter by date
Subscribers by State
GET /v4/subscribers?status={active,inactive,cancelled,complained}
Health breakdown
Tags
GET /v4/tags
Segment counts
Forms
GET /v4/forms
Landing page / form count
Sequences
GET /v4/sequences
Active automations
Broadcasts Sent
GET /v4/broadcasts
List all broadcasts
Broadcast Stats
GET /v4/broadcasts/stats
open_rate, click_rate, unsubscribes, recipients (Pro plan or dev auth)
Per-Broadcast Stats
GET /v4/broadcasts/{id}/stats
Individual broadcast performance
Purchases
GET /v4/purchases
Digital product revenue (if selling via Kit)

Implementation:
// src/lib/services/kit.ts
const BASE_URL = 'https://api.kit.com/v4';
const API_KEY = process.env.KIT_API_KEY!;

const headers = {
  'X-Kit-Api-Key': API_KEY,
  'Accept': 'application/json',
};

async function kitFetch(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
  if (!res.ok) throw new Error(`Kit API error: ${res.status}`);
  return res.json();
}

// Paginate through all subscribers to get total count
// (Kit uses cursor-based pagination, not page numbers)
async function getTotalSubscribers(status: string = 'active'): Promise<number> {
  let count = 0;
  let cursor: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const url = `/subscribers?status=${status}&per_page=1000${cursor ? `&after=${cursor}` : ''}`;
    const data = await kitFetch(url);
    count += data.subscribers.length;
    hasMore = data.pagination.has_next_page;
    cursor = data.pagination.end_cursor;
  }

  return count;
}

async function getNewSubscribers30d(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  let count = 0;
  let cursor: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const url = `/subscribers?status=active&created_after=${thirtyDaysAgo.toISOString()}&per_page=1000${cursor ? `&after=${cursor}` : ''}`;
    const data = await kitFetch(url);
    count += data.subscribers.length;
    hasMore = data.pagination.has_next_page;
    cursor = data.pagination.end_cursor;
  }

  return count;
}

export async function syncKitMetrics() {
  // 1. Subscriber counts
  const totalActive = await getTotalSubscribers('active');
  const newSubs30d = await getNewSubscribers30d();

  // 2. Tags, forms, sequences (for quick counts)
  const tags = await kitFetch('/tags');
  const forms = await kitFetch('/forms');
  const sequences = await kitFetch('/sequences');

  // 3. Recent broadcasts
  const broadcasts = await kitFetch('/broadcasts?per_page=50');

  // 4. Broadcast stats (Pro plan or dev-authorized — gracefully fail)
  let broadcastStats: any = null;
  try {
    broadcastStats = await kitFetch('/broadcasts/stats?per_page=20');
  } catch (e) {
    // Stats endpoint requires Pro plan — that's okay
  }

  // 5. Calculate avg open/click rates from recent broadcast stats
  let avgOpenRate = null;
  let avgClickRate = null;
  let totalUnsubscribes30d = null;

  if (broadcastStats?.broadcasts?.length) {
    const sent = broadcastStats.broadcasts.filter(
      (b: any) => b.stats.status === 'completed' && b.stats.recipients > 0
    );
    if (sent.length > 0) {
      avgOpenRate = sent.reduce((s: number, b: any) => s + b.stats.open_rate, 0) / sent.length;
      avgClickRate = sent.reduce((s: number, b: any) => s + b.stats.click_rate, 0) / sent.length;
      totalUnsubscribes30d = sent.reduce((s: number, b: any) => s + b.stats.unsubscribes, 0);
    }
  }

  // 6. Purchases (if selling via Kit)
  let purchaseData: any = null;
  try {
    purchaseData = await kitFetch('/purchases?per_page=100');
  } catch (e) {
    // No purchases or not enabled
  }

  return {
    total_subscribers: totalActive,
    new_subscribers_30d: newSubs30d,
    tag_count: tags.tags?.length || 0,
    form_count: forms.forms?.length || 0,
    sequence_count: sequences.sequences?.length || 0,
    broadcasts_total: broadcasts.broadcasts?.length || 0,

    // Stats (Pro plan only — null if unavailable)
    avg_open_rate: avgOpenRate,
    avg_click_rate: avgClickRate,
    total_unsubscribes_30d: totalUnsubscribes30d,

    // Purchases
    total_purchases: purchaseData?.purchases?.length || null,
  };
}

Key notes:
V4 uses cursor-based pagination (not page numbers) — use after cursor to paginate
API key goes in X-Kit-Api-Key header (not query param like V3)
Rate limit: 120 requests per rolling 60 seconds — be mindful when paginating large subscriber lists
Broadcast stats endpoint (/broadcasts/stats) requires Pro plan or developer authorization — code gracefully falls back to null
Kit counts bot clicks in click-through rates — numbers may appear inflated
Subscriber states: active, inactive, cancelled, complained
Syncs every 6 hours (subscriber data doesn't change minute-to-minute)

2.14 Partnerships Tracker (Manual Input)
API: None — fully manual. Data stored in MongoDB.
This is a simple CRUD tracker for paid partnership deals. You input each deal manually and the dashboard tracks totals, breakdowns by type, and a chronological log.
Data Model:
// MongoDB collection: partnerships
interface Partnership {
  _id: ObjectId;
  partner_name: string;           // "John Smith", "Acme Corp", etc.
  promotion_type: 'youtube_video' | 'skool_post' | 'instagram_reel' | 'email_list';
  amount: number;                 // USD — e.g. 500
  notes?: string;                 // Optional — brief description
  created_at: Date;               // Auto-set on insert (tracks "date of the month")
  updated_at: Date;               // Auto-set on update
}

MongoDB Index:
db.partnerships.createIndex({ created_at: -1 })   // For date-sorted listing
db.partnerships.createIndex({ promotion_type: 1 }) // For type breakdowns

API Route:
// src/app/api/partnerships/route.ts

// GET  /api/partnerships?month=2026-02&type=youtube_video
//   → Returns partnerships, optionally filtered by month and/or type
//   → Also returns aggregated totals

// POST /api/partnerships
//   → Body: { partner_name, promotion_type, amount, notes? }
//   → Creates new partnership entry with auto-generated created_at

// PUT  /api/partnerships
//   → Body: { id, partner_name?, promotion_type?, amount?, notes? }
//   → Updates an existing entry, sets updated_at

// DELETE /api/partnerships
//   → Body: { id }
//   → Deletes an entry

Implementation:
// src/app/api/partnerships/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

const PROMOTION_TYPES = ['youtube_video', 'skool_post', 'instagram_reel', 'email_list'] as const;

export async function GET(req: NextRequest) {
  const db = await getDb();
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');  // e.g. "2026-02"
  const type = searchParams.get('type');

  const filter: any = {};

  if (month) {
    const [year, m] = month.split('-').map(Number);
    filter.created_at = {
      $gte: new Date(year, m - 1, 1),
      $lt: new Date(year, m, 1),
    };
  }

  if (type && PROMOTION_TYPES.includes(type as any)) {
    filter.promotion_type = type;
  }

  const partnerships = await db
    .collection('partnerships')
    .find(filter)
    .sort({ created_at: -1 })
    .toArray();

  // Aggregated stats
  const totalRevenue = partnerships.reduce((s, p) => s + p.amount, 0);
  const byType = PROMOTION_TYPES.reduce((acc, t) => {
    const matches = partnerships.filter(p => p.promotion_type === t);
    acc[t] = {
      count: matches.length,
      total: matches.reduce((s, p) => s + p.amount, 0),
    };
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  return NextResponse.json({
    partnerships,
    stats: {
      total_deals: partnerships.length,
      total_revenue: totalRevenue,
      by_type: byType,
    },
  });
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const body = await req.json();

  const { partner_name, promotion_type, amount, notes } = body;

  if (!partner_name || !promotion_type || amount == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!PROMOTION_TYPES.includes(promotion_type)) {
    return NextResponse.json({ error: 'Invalid promotion type' }, { status: 400 });
  }

  const doc = {
    partner_name: partner_name.trim(),
    promotion_type,
    amount: Number(amount),
    notes: notes?.trim() || null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const result = await db.collection('partnerships').insertOne(doc);

  return NextResponse.json({ id: result.insertedId, ...doc }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const db = await getDb();
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const setFields: any = { updated_at: new Date() };
  if (updates.partner_name) setFields.partner_name = updates.partner_name.trim();
  if (updates.promotion_type) setFields.promotion_type = updates.promotion_type;
  if (updates.amount != null) setFields.amount = Number(updates.amount);
  if (updates.notes !== undefined) setFields.notes = updates.notes?.trim() || null;

  await db.collection('partnerships').updateOne(
    { _id: new ObjectId(id) },
    { $set: setFields }
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const db = await getDb();
  const { id } = await req.json();

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await db.collection('partnerships').deleteOne({ _id: new ObjectId(id) });

  return NextResponse.json({ success: true });
}

Page UI (/dashboard/partnerships):
The page has two sections:
Section 1 — Input Form (top)
┌─────────────────────────────────────────────────────────────┐
│  + New Partnership                                          │
│                                                             │
│  Partner Name        Promotion Type           Amount        │
│  ┌───────────────┐   ┌─────────────────┐   ┌──────────┐   │
│  │ e.g. Acme Co  │   │ ▼ YouTube Video │   │ $ 500    │   │
│  └───────────────┘   │   Skool Post    │   └──────────┘   │
│                      │   Instagram Reel│                   │
│                      │   Email List    │   [ Add Deal ]    │
│                      └─────────────────┘                   │
│                                                             │
│  Notes (optional)                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Shoutout in their weekly newsletter                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Promotion type is a dropdown with 4 options, each with an icon:
🎬 YouTube Video
💬 Skool Post
📸 Instagram Reel
✉️ Email List
Section 2 — KPI Cards + Table (below)
4 KPI cards across the top:
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ $4,250   │  │ 12       │  │ $354     │  │ 🎬 5     │
│ Total    │  │ Total    │  │ Avg deal │  │ Top type │
│ revenue  │  │ deals    │  │ size     │  │ this mo. │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

Month filter pills: Jan | Feb | Mar | ... | All Time
Data table showing all entries:
┌──────────┬─────────────────┬──────────────────┬──────────┬───────────┐
│ Date     │ Partner         │ Type             │ Amount   │ Actions   │
├──────────┼─────────────────┼──────────────────┼──────────┼───────────┤
│ Feb 24   │ Acme Corp       │ 🎬 YouTube Video │ $1,000   │ ✏️  🗑️    │
│ Feb 18   │ Jane Doe        │ ✉️ Email List    │ $500     │ ✏️  🗑️    │
│ Feb 12   │ Creator Studio  │ 📸 Insta Reel   │ $750     │ ✏️  🗑️    │
│ Feb 3    │ Growth Network  │ 💬 Skool Post    │ $200     │ ✏️  🗑️    │
└──────────┴─────────────────┴──────────────────┴──────────┴───────────┘

Date column auto-formatted from created_at (e.g. "Feb 24" or "Feb 24, 2026" if different year)
Edit (✏️) opens inline editing
Delete (🗑️) shows confirmation before removing
Table sorted newest first by default
Key notes:
No sync needed — data is written directly to MongoDB on form submit
created_at is set server-side (not client) so the date is reliable
The overview page shows a single KPI card: "Partnerships (this month)" with total revenue

2.15 AI Business Coach (Claude Opus 4.6 + Sonnet 4.5)
API: Anthropic Messages API — https://api.anthropic.com/v1/messages
This is the centerpiece intelligence layer of the dashboard. Unlike the ⌘K command bar (which answers ad-hoc questions), the AI Coach proactively analyzes ALL your business data and delivers structured coaching — daily briefs, weekly reviews, growth strategies, and deep dives on demand.
Two models, two jobs:
Model
Model String
Pricing (per MTok)
Role
Claude Sonnet 4.5
claude-sonnet-4-5-20250929
$3 input / $15 output
Daily briefs, quick insights, trend summaries. Fast + cheap.
Claude Opus 4.6
claude-opus-4-6
$5 input / $25 output
Deep strategic analysis, growth plans, cross-platform correlation. Uses extended thinking.

Why two models: Sonnet handles the high-frequency, lower-stakes analysis (daily morning briefs, quick metric explanations) at ~40% lower cost. Opus handles the heavy thinking — weekly strategy sessions, cross-platform pattern detection, and answering complex "how do I grow?" questions where extended thinking produces significantly better output.
Environment Variables:
ANTHROPIC_API_KEY=sk-ant-...


2.15.1 Context Assembly Engine
Before any coaching call, we assemble a comprehensive data snapshot from MongoDB. This is the "brain dump" the AI gets to work with.
// src/lib/coach/context.ts

interface BusinessSnapshot {
  generated_at: string;
  period: { start: string; end: string };

  revenue: {
    mrr: number;
    mrr_prev_month: number;
    mrr_change_pct: number;
    churn_rate: number;
    total_customers: number;
    arpu: number;
    failed_payments_30d: number;
  };

  audience: {
    youtube: { subscribers: number; change_30d: number; views_30d: number; videos_this_month: number };
    instagram: { followers: number; change_30d: number; posts_this_month: number; avg_likes: number };
    x: { followers: number; change_30d: number; posts_this_month: number };
  };

  ads: {
    spend_30d: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    roas: number;
    conversions: number;
  };

  email: {
    total_subscribers: number;
    new_subscribers_30d: number;
    avg_open_rate: number | null;
    avg_click_rate: number | null;
    unsubscribes_30d: number | null;
  };

  community: {
    skool_free: { members: number; change_30d: number };
    skool_paid: { members: number; revenue: number; change_30d: number };
  };

  support: {
    buildmyagent: { open: number; pending: number; closed_30d: number; avg_response_time: number | null };
    the1percent: { open: number; pending: number; closed_30d: number; avg_response_time: number | null };
  };

  tasks: {
    my_open: number;
    my_completed_30d: number;
    va_open: number;
    va_completed_30d: number;
    overdue: number;
  };

  finances: {
    mercury_balance: number;
    revolut_balances: Record<string, number>;
    income_30d: number;
    expenses_30d: number;
    net_cash_flow_30d: number;
  };

  health: {
    recovery_avg_7d: number;
    strain_avg_7d: number;
    sleep_avg_7d: number;
    hrv_avg_7d: number;
    recovery_today: number | null;
  };

  partnerships: {
    total_revenue_this_month: number;
    deals_this_month: number;
    avg_deal_size: number;
    by_type: Record<string, { count: number; total: number }>;
  };

  // Historical trends (last 90 days, weekly aggregates)
  trends: {
    mrr_weekly: Array<{ week: string; value: number }>;
    subscribers_weekly: Array<{ week: string; youtube: number; instagram: number; x: number; email: number }>;
    revenue_weekly: Array<{ week: string; income: number; expenses: number }>;
    ad_spend_weekly: Array<{ week: string; spend: number; roas: number }>;
    support_volume_weekly: Array<{ week: string; total_conversations: number }>;
  };
}

export async function assembleBusinessSnapshot(): Promise<BusinessSnapshot> {
  const db = await getDb();

  // Fetch latest metrics for each platform from the metrics collection
  // Fetch 90 days of weekly aggregates for trends
  // Fetch partnerships from partnerships collection
  // Combine into a single snapshot object

  // ... (queries MongoDB for latest values + trend data)
  // Returns the full BusinessSnapshot
}

// Convert snapshot to a compact text representation for the LLM
export function snapshotToContext(snapshot: BusinessSnapshot): string {
  return `
## BUSINESS DATA SNAPSHOT — ${snapshot.generated_at}
Period: ${snapshot.period.start} to ${snapshot.period.end}

### REVENUE (Stripe)
MRR: $${snapshot.revenue.mrr.toLocaleString()} (${snapshot.revenue.mrr_change_pct > 0 ? '+' : ''}${snapshot.revenue.mrr_change_pct}% vs last month)
Churn: ${snapshot.revenue.churn_rate}% | Customers: ${snapshot.revenue.total_customers} | ARPU: $${snapshot.revenue.arpu}
Failed payments (30d): ${snapshot.revenue.failed_payments_30d}

### AUDIENCE
YouTube: ${snapshot.audience.youtube.subscribers.toLocaleString()} subs (${snapshot.audience.youtube.change_30d > 0 ? '+' : ''}${snapshot.audience.youtube.change_30d} in 30d) | ${snapshot.audience.youtube.views_30d.toLocaleString()} views | ${snapshot.audience.youtube.videos_this_month} videos this month
Instagram: ${snapshot.audience.instagram.followers.toLocaleString()} followers (${snapshot.audience.instagram.change_30d > 0 ? '+' : ''}${snapshot.audience.instagram.change_30d} in 30d) | ${snapshot.audience.instagram.posts_this_month} posts | avg ${snapshot.audience.instagram.avg_likes} likes
X: ${snapshot.audience.x.followers.toLocaleString()} followers (${snapshot.audience.x.change_30d > 0 ? '+' : ''}${snapshot.audience.x.change_30d} in 30d)

### ADS (Meta)
Spend: $${snapshot.ads.spend_30d.toLocaleString()} | ROAS: ${snapshot.ads.roas}x | CPC: $${snapshot.ads.cpc} | CTR: ${snapshot.ads.ctr}%
Conversions: ${snapshot.ads.conversions}

### EMAIL (Kit)
Subscribers: ${snapshot.email.total_subscribers.toLocaleString()} (+${snapshot.email.new_subscribers_30d} in 30d)
Open rate: ${snapshot.email.avg_open_rate ?? 'N/A'}% | Click rate: ${snapshot.email.avg_click_rate ?? 'N/A'}%

### COMMUNITY (Skool)
Free group: ${snapshot.community.skool_free.members} members (${snapshot.community.skool_free.change_30d > 0 ? '+' : ''}${snapshot.community.skool_free.change_30d})
Paid group: ${snapshot.community.skool_paid.members} members | Revenue: $${snapshot.community.skool_paid.revenue}/mo

### SUPPORT (Help Scout)
BuildMyAgent: ${snapshot.support.buildmyagent.open} open, ${snapshot.support.buildmyagent.pending} pending, ${snapshot.support.buildmyagent.closed_30d} closed (30d)
The 1 Percent: ${snapshot.support.the1percent.open} open, ${snapshot.support.the1percent.pending} pending, ${snapshot.support.the1percent.closed_30d} closed (30d)

### TASKS (ClickUp)
My tasks: ${snapshot.tasks.my_open} open, ${snapshot.tasks.my_completed_30d} completed (30d)
VA tasks: ${snapshot.tasks.va_open} open, ${snapshot.tasks.va_completed_30d} completed (30d)
Overdue: ${snapshot.tasks.overdue}

### FINANCES
Mercury: $${snapshot.finances.mercury_balance.toLocaleString()}
Revolut: ${Object.entries(snapshot.finances.revolut_balances).map(([c, v]) => `${c} ${v.toLocaleString()}`).join(' | ')}
Income (30d): $${snapshot.finances.income_30d.toLocaleString()} | Expenses: $${snapshot.finances.expenses_30d.toLocaleString()} | Net: $${snapshot.finances.net_cash_flow_30d.toLocaleString()}

### HEALTH (Whoop — 7d averages)
Recovery: ${snapshot.health.recovery_avg_7d}% | Strain: ${snapshot.health.strain_avg_7d} | Sleep: ${snapshot.health.sleep_avg_7d}h | HRV: ${snapshot.health.hrv_avg_7d}ms
Today's recovery: ${snapshot.health.recovery_today ?? 'pending'}%

### PARTNERSHIPS (this month)
Revenue: $${snapshot.partnerships.total_revenue_this_month} | Deals: ${snapshot.partnerships.deals_this_month} | Avg: $${snapshot.partnerships.avg_deal_size}
${Object.entries(snapshot.partnerships.by_type).map(([t, d]) => `  ${t}: ${d.count} deals ($${d.total})`).join('\n')}

### 90-DAY TRENDS (weekly)
${JSON.stringify(snapshot.trends, null, 0)}
`.trim();
}

Token budget: A full business snapshot is roughly 1,500–2,500 tokens. With 90 days of weekly trends included, it's ~3,000–4,000 tokens. We use prompt caching to avoid re-sending the system prompt on every call.

2.15.2 Coaching Modes
The AI Coach operates in 4 distinct modes, each with its own system prompt, model, and UI:
Mode 1: Morning Brief (Sonnet — automatic)
Generated daily at 7:00 AM via Vercel Cron. Cached in MongoDB. Displayed on the dashboard overview page as a card.
System prompt: You are a concise business analyst for a solo entrepreneur
running BuildMyAgent and The 1 Percent. Generate a morning brief in
3-5 bullet points covering: (1) any metrics that changed significantly
overnight, (2) what needs attention today, (3) one opportunity spotted
in the data. Keep it under 150 words. Be direct, no fluff.

UI: A card at the top of the overview page titled "Morning Brief — {date}" with the bullet points. Subtle accent border. Refreshes daily.
Mode 2: Weekly Review (Opus with extended thinking — automatic)
Generated every Monday at 6:00 AM. Uses extended thinking for deeper analysis.
System prompt: You are a senior business strategist and growth advisor for
a solo entrepreneur running two businesses: BuildMyAgent (SaaS, ~2000
clients via GHL rebilling) and The 1 Percent (community/coaching).

Produce a weekly review covering:
1. WINS — What went well this week (metrics that improved)
2. WATCH — Metrics trending in the wrong direction
3. OPPORTUNITY — One cross-platform insight (e.g. "Your Instagram growth
   spiked but email signups didn't — you may be missing a CTA")
4. PRIORITY — The single most impactful thing to focus on next week
5. HEALTH CHECK — Brief note on recovery/strain trends and how they
   correlate with productivity

Use specific numbers. Compare to previous week. Be honest — flag problems
directly. Think step by step about what the data reveals.

API call uses extended thinking:
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-opus-4-6',
    max_tokens: 16000,
    thinking: {
      type: 'enabled',
      budget_tokens: 8000,
    },
    system: WEEKLY_REVIEW_SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: snapshotToContext(snapshot) },
    ],
  }),
});

UI: Dedicated page at /dashboard/coach/weekly. Shows the current week's review with previous weeks accessible via a date picker. Each section (Wins/Watch/Opportunity/Priority/Health) is a collapsible card.
Mode 3: Ask the Coach (Sonnet or Opus — on demand)
Interactive chat interface at /dashboard/coach. The user can type any business question. Model selection:
Default: Sonnet (fast, cheap)
Toggle: "Deep Think" switch → uses Opus with extended thinking for complex strategy questions
The full business snapshot is injected as context with every message. Conversation history is maintained within the session (up to 10 turns).
System prompt: You are an expert business growth coach for Albert, a solo
entrepreneur running:
- BuildMyAgent: SaaS business with ~2,000 clients, GHL rebilling via Stripe
- The 1 Percent: Community/coaching business on Skool

You have access to all of Albert's real-time business data below. When
coaching:
- Reference specific numbers from the data
- Give actionable, specific advice (not generic platitudes)
- Challenge assumptions when the data suggests a different story
- Consider cross-platform effects (e.g. content → leads → revenue)
- Factor in health/recovery data when discussing workload
- Be direct and honest — Albert values candor over comfort

If asked about strategy, think about the full funnel: content → audience →
email list → community → paid product → revenue.

Example interactions:
"How should I allocate my ad budget next month?"
"My churn is creeping up — what should I do?"
"I want to hit $20K MRR by Q3. What's the path?"
"Am I posting enough content? What's the optimal frequency?"
"Compare my two businesses — which one should I double down on?"
"My recovery has been low all week. Should I cut back on meetings?"
Mode 4: Growth Playbook Generator (Opus with extended thinking — on demand)
A special one-shot generation. The user clicks "Generate Growth Playbook" and Opus produces a comprehensive 30/60/90 day growth plan based on all current data.
System prompt: You are a world-class business strategist. Based on the
complete business data provided, generate a detailed 30/60/90 day growth
playbook for this solo entrepreneur.

Structure:
1. CURRENT STATE — Honest assessment of where the business stands
2. BIGGEST LEVERAGE POINTS — The 3 things that would move the needle most
3. 30-DAY SPRINT — Specific, actionable goals with metrics to hit
4. 60-DAY MILESTONES — Where things should be if the 30-day sprint worked
5. 90-DAY VISION — Realistic projection based on current trajectory
6. RISKS — What could go wrong and how to mitigate
7. RESOURCE ALLOCATION — How to split time between the two businesses

Use real numbers from the data. Include specific KPI targets.
Be ambitious but realistic.

UI: Full-page output rendered as a formatted document. Saved to MongoDB so you can compare playbooks over time. A "Regenerate" button lets you get a fresh perspective.

2.15.3 Implementation
// src/lib/coach/index.ts
import { assembleBusinessSnapshot, snapshotToContext } from './context';

type CoachMode = 'morning_brief' | 'weekly_review' | 'ask' | 'playbook';

interface CoachRequest {
  mode: CoachMode;
  message?: string;         // For 'ask' mode
  conversationHistory?: Array<{ role: string; content: string }>;
  useDeepThink?: boolean;   // Force Opus for 'ask' mode
}

const SYSTEM_PROMPTS: Record<CoachMode, string> = {
  morning_brief: `...`,    // As defined above
  weekly_review: `...`,
  ask: `...`,
  playbook: `...`,
};

// Model routing
function getModel(mode: CoachMode, useDeepThink: boolean): string {
  if (mode === 'weekly_review' || mode === 'playbook') return 'claude-opus-4-6';
  if (mode === 'ask' && useDeepThink) return 'claude-opus-4-6';
  return 'claude-sonnet-4-5-20250929';
}

// Extended thinking config
function getThinkingConfig(model: string): object | undefined {
  if (model === 'claude-opus-4-6') {
    return { type: 'enabled', budget_tokens: 8000 };
  }
  return undefined;
}

export async function runCoach(request: CoachRequest) {
  const snapshot = await assembleBusinessSnapshot();
  const dataContext = snapshotToContext(snapshot);
  const model = getModel(request.mode, request.useDeepThink ?? false);
  const thinking = getThinkingConfig(model);

  const messages: Array<{ role: string; content: string }> = [];

  if (request.mode === 'ask' && request.conversationHistory) {
    // Inject data context as the first user message
    messages.push({ role: 'user', content: `Here is my current business data:\n\n${dataContext}` });
    messages.push({ role: 'assistant', content: 'I have your full business data. What would you like to discuss?' });
    messages.push(...request.conversationHistory);
    if (request.message) {
      messages.push({ role: 'user', content: request.message });
    }
  } else {
    messages.push({ role: 'user', content: dataContext });
  }

  const body: any = {
    model,
    max_tokens: model === 'claude-opus-4-6' ? 16000 : 4000,
    system: SYSTEM_PROMPTS[request.mode],
    messages,
  };

  if (thinking) body.thinking = thinking;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  // Extract text from response (skip thinking blocks)
  const text = data.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('\n');

  // Save to MongoDB for history
  const db = await getDb();
  await db.collection('coach_sessions').insertOne({
    mode: request.mode,
    model,
    used_extended_thinking: !!thinking,
    input_tokens: data.usage?.input_tokens,
    output_tokens: data.usage?.output_tokens,
    response: text,
    snapshot_summary: {
      mrr: snapshot.revenue.mrr,
      total_customers: snapshot.revenue.total_customers,
      total_audience: snapshot.audience.youtube.subscribers +
        snapshot.audience.instagram.followers + snapshot.audience.x.followers,
    },
    created_at: new Date(),
  });

  return {
    text,
    model,
    tokens: {
      input: data.usage?.input_tokens,
      output: data.usage?.output_tokens,
    },
  };
}

API Routes:
// src/app/api/coach/brief/route.ts     → GET  (returns cached daily brief)
// src/app/api/coach/weekly/route.ts    → GET  (returns cached weekly review)
// src/app/api/coach/ask/route.ts       → POST (interactive chat)
// src/app/api/coach/playbook/route.ts  → POST (generate growth playbook)
// src/app/api/coach/history/route.ts   → GET  (past sessions)

Cron Schedule:
// Added to vercel.json
{
  "crons": [
    { "path": "/api/coach/brief", "schedule": "0 7 * * *" },
    { "path": "/api/coach/weekly", "schedule": "0 6 * * 1" },
    { "path": "/api/sync", "schedule": "0 */2 * * *" }
  ]
}


2.15.4 Coach Page UI (/dashboard/coach)
The coach page has 3 tabs:
Tab 1: Chat (default)
┌─────────────────────────────────────────────────────────────┐
│  🧠 AI Business Coach                    [Sonnet ▼] [⚡ Deep Think]  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Based on your data, your MRR grew 4.2% this month │   │
│  │  but churn ticked up from 3.1% to 3.8%. The net    │   │
│  │  effect is still positive, but if churn continues   │   │
│  │  at this rate, it will offset growth by April.      │   │
│  │                                                      │   │
│  │  I'd recommend: ...                                  │   │
│  │                                                 Opus │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Type your question...                      [Send →] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Suggested questions:                                       │
│  ┌────────────────────┐ ┌────────────────────┐            │
│  │ How do I reduce    │ │ What content is    │            │
│  │ churn?             │ │ driving signups?   │            │
│  └────────────────────┘ └────────────────────┘            │
│  ┌────────────────────┐ ┌────────────────────┐            │
│  │ Compare my two     │ │ Where should I     │            │
│  │ businesses         │ │ invest next?       │            │
│  └────────────────────┘ └────────────────────┘            │
└─────────────────────────────────────────────────────────────┘

Model selector dropdown: Sonnet (default) or Opus
"Deep Think" toggle: When ON, forces Opus with extended thinking (shows a brain icon + "Thinking deeply..." loading state)
Each AI response shows the model used as a subtle badge (Sonnet/Opus)
Suggested questions update dynamically based on current data anomalies
Markdown rendering for responses (headers, bold, lists, code blocks)
Tab 2: Weekly Reviews
┌─────────────────────────────────────────────────────────────┐
│  📊 Weekly Reviews                                         │
│                                                             │
│  ◀ Feb 17–23, 2026 ▶                                      │
│                                                             │
│  🏆 WINS                                          [expand] │
│  MRR crossed $15K for the first time...                    │
│                                                             │
│  ⚠️ WATCH                                          [expand] │
│  Support ticket volume up 23% — mostly billing...          │
│                                                             │
│  💡 OPPORTUNITY                                    [expand] │
│  Instagram reel from Feb 19 got 3x avg engagement...       │
│                                                             │
│  🎯 PRIORITY                                       [expand] │
│  Focus on reducing churn by improving onboarding...        │
│                                                             │
│  💚 HEALTH CHECK                                   [expand] │
│  Recovery averaged 72% — solid. Strain was moderate...     │
└─────────────────────────────────────────────────────────────┘

Tab 3: Growth Playbook
┌─────────────────────────────────────────────────────────────┐
│  🚀 Growth Playbook                                        │
│                                                             │
│  Latest: Generated Feb 24, 2026          [🔄 Regenerate]   │
│                                                             │
│  Full formatted playbook renders here as a rich document   │
│  with sections, KPI targets, timelines, and risk notes.    │
│                                                             │
│  Previous playbooks:                                        │
│  • Jan 27, 2026                                            │
│  • Dec 30, 2025                                            │
└─────────────────────────────────────────────────────────────┘


2.15.5 Coach in the Overview Page
The overview page gets a "Morning Brief" card at the very top (before Revenue):
┌──────────────────────────────────────────────────────────────────┐
│  ☀️ Morning Brief — Feb 28, 2026                                │
│                                                                  │
│  • MRR holding steady at $15,240 — 3 new customers overnight   │
│  • 2 overdue ClickUp tasks — both are VA assignments            │
│  • Instagram reel from yesterday is outperforming — consider    │
│    repurposing as a YouTube Short                                │
│                                                                  │
│                                        [View Coach →]           │
└──────────────────────────────────────────────────────────────────┘


2.15.6 Cost Estimation
Mode
Model
Frequency
Est. Input Tokens
Est. Output Tokens
Est. Monthly Cost
Morning Brief
Sonnet
Daily (30x)
~3,500 × 30 = 105K
~300 × 30 = 9K
$0.45
Weekly Review
Opus
Weekly (4x)
~4,000 × 4 = 16K
~2,000 × 4 = 8K (+ ~8K thinking)
$0.48
Ask the Coach (Sonnet)
Sonnet
~50 queries/mo
~4,000 × 50 = 200K
~500 × 50 = 25K
$0.98
Ask the Coach (Opus)
Opus
~10 deep thinks/mo
~4,000 × 10 = 40K
~2,000 × 10 = 20K (+ ~8K thinking)
$0.90
Growth Playbook
Opus
~2x/month
~4,000 × 2 = 8K
~4,000 × 2 = 8K (+ ~16K thinking)
$0.64
Total estimated








~$3.45/month

With prompt caching (caching the system prompt + business context), costs drop further — cache reads are 90% cheaper than fresh input tokens.
Key notes:
Opus 4.6 extended thinking tokens are billed as output tokens ($25/MTok) — budget carefully
Prompt caching: Cache the system prompt (5-min TTL default, or 1-hour for $2× write cost). Since the business snapshot changes every 2 hours, the 5-min cache is fine for interactive sessions
The morning brief and weekly review are generated once and cached in MongoDB — not re-generated on every page load
All coaching responses and token usage are logged to coach_sessions collection for cost tracking
A "Coach Usage" card in Settings shows monthly token consumption and estimated cost

2.15.7 MongoDB Collections
// coach_sessions — stores all AI coaching outputs
{
  mode: "weekly_review",
  model: "claude-opus-4-6",
  used_extended_thinking: true,
  input_tokens: 4200,
  output_tokens: 9800,
  response: "## WINS\n...",
  snapshot_summary: { mrr: 15240, total_customers: 2012, total_audience: 18400 },
  created_at: ISODate("2026-02-24T06:00:00Z")
}

// Index: { mode: 1, created_at: -1 }


Phase 3: Dashboard Pages (Days 5–8)
3.1 Overview Page (/dashboard)
The main page shows the bird's-eye view of everything:
┌──────────────────────────────────────────────────┐
│  Overview                           Sync Now ↻   │
│  Last synced: 3 minutes ago                       │
│                                                   │
│  REVENUE                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ $4,200   │  │ 2.1%     │  │ 142      │        │
│  │ MRR      │  │ Churn    │  │ Customers │        │
│  │ +12% ▲   │  │ -0.3% ▼  │  │ +8 ▲     │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                   │
│  AUDIENCE                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──┐  │
│  │ 12.4K    │  │ 3,201    │  │ 8,442    │  │  │  │
│  │ YouTube  │  │ Instagram│  │ X        │  │..│  │
│  │ subs     │  │ followers│  │ followers│  │  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──┘  │
│                                                   │
│  CONTENT VELOCITY (this month)                    │
│  YouTube: 4 videos  │  IG: 12 posts  │  X: 31    │
│                                                   │
│  ADS                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ $1,240   │  │ 3.2x     │  │ $12.40   │        │
│  │ Spend    │  │ ROAS     │  │ CPA      │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                   │
│  COMMUNITY                    TASKS               │
│  Free Skool: 2,340 members    My Open: 12         │
│  Paid Skool: 186 members      VA Open: 8          │
│                                Overdue: 3 ⚠️       │
│                                                   │
│  FINANCES                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ $24,180  │  │ $18,420  │  │ $12,840  │  │ $29,760  │  │
│  │ Mercury  │  │ Revolut  │  │ Expenses │  │ Income   │  │
│  │ balance  │  │ balance  │  │ (30d)    │  │ (30d)    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                   │
│  HEALTH                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 78%      │  │ 14.2     │  │ 7.4 hrs  │  │ 52ms     │  │
│  │ Recovery │  │ Strain   │  │ Sleep    │  │ HRV      │  │
│  │ 🟢 green │  │ today    │  │ last nite│  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                   │
│  SUPPORT                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ 8        │  │ 3        │  │ 142      │        │
│  │ Open     │  │ Pending  │  │ Closed   │        │
│  │ tickets  │  │ tickets  │  │ (30d)    │        │
│  │ combined │  │ combined │  │ combined │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                   │
│  EMAIL MARKETING                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 12,482   │  │ +318     │  │ 42.1%    │  │ 3.8%     │  │
│  │ Subscri- │  │ New subs │  │ Avg open │  │ Avg click│  │
│  │ bers     │  │ (30d)    │  │ rate     │  │ rate     │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                   │
│  PARTNERSHIPS                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ $2,450   │  │ 6        │  │ $408     │        │
│  │ Revenue  │  │ Deals    │  │ Avg deal │        │
│  │ this mo. │  │ this mo. │  │ size     │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                   │
│  TODAY'S SCHEDULE                                  │
│  ┌─────────────────────────────────────────────┐  │
│  │  9:00 AM   Team standup           30 min    │  │
│  │  11:00 AM  Client call — Acme     60 min    │  │
│  │  2:00 PM   Content review         45 min    │  │
│  │  4:30 PM   Investor prep          30 min    │  │
│  │                                              │  │
│  │  4 events today · 2h 45m booked              │  │
│  │                          View full calendar → │  │
│  └─────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘

3.2 Calendar Page (/dashboard/calendar)
A dedicated calendar view showing your Google Calendar events.
┌─────────────────────────────────────────────────────────────────┐
│  📅 Calendar                                                     │
│  Google Calendar · your@email.com                                │
│                                                                  │
│  ┌──── Week View (span 8) ──────────┐  ┌── Today (span 4) ──┐  │
│  │                                   │  │                     │  │
│  │  Mon  Tue  Wed  Thu  Fri  Sat Sun │  │  Thursday, Feb 26   │  │
│  │  ┌──┐┌──┐┌──┐┌──┐┌──┐           │  │                     │  │
│  │  │  ││  ││  ││██││  │           │  │  9:00 AM             │  │
│  │  │  ││  ││  ││██││  │           │  │  ● Team standup      │  │
│  │  │  ││  ││  ││██││  │           │  │    30 min · Meet     │  │
│  │  │  ││██││  ││  ││  │           │  │                     │  │
│  │  │  ││██││  ││  ││  │           │  │  11:00 AM            │  │
│  │  │  ││  ││  ││  ││  │           │  │  ● Client call       │  │
│  │  │  ││  ││██││  ││  │           │  │    60 min · Zoom     │  │
│  │  └──┘└──┘└──┘└──┘└──┘           │  │                     │  │
│  │                                   │  │  2:00 PM             │  │
│  │  ■ = busy block (colored by       │  │  ● Content review   │  │
│  │       calendar color)             │  │    45 min            │  │
│  │                                   │  │                     │  │
│  │  ← prev week    today   next →    │  │  4:30 PM             │  │
│  └───────────────────────────────────┘  │  ● Investor prep    │  │
│                                          │    30 min · Meet    │  │
│  ┌──── Upcoming (next 7 days) ──────────┘                     │  │
│  │                                                             │  │
│  │  Tomorrow — Fri, Feb 27                                     │  │
│  │  10:00 AM  Weekly team sync       60 min                    │  │
│  │  3:00 PM   Sales pipeline review  45 min                    │  │
│  │                                                             │  │
│  │  Saturday — Feb 28                                          │  │
│  │  No events                                                  │  │
│  │                                                             │  │
│  │  Monday — Mar 2                                             │  │
│  │  9:00 AM   Sprint planning        90 min                    │  │
│  │  1:00 PM   1:1 with VA            30 min                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

3.3 Individual Platform Pages
Each platform gets its own detail page with:
KPI cards (current values + trend vs. last period)
Time-series chart (line/area chart via Recharts)
Data table showing historical snapshots
Platform-specific deep dives
3.4 Shared Component Library
src/components/
├── layout/
│   ├── Sidebar.tsx
│   ├── PageHeader.tsx
│   └── Shell.tsx
├── cards/
│   ├── MetricCard.tsx        # KPI card with trend indicator
│   ├── SparklineCard.tsx     # KPI + inline sparkline
│   └── PlatformStatus.tsx    # Sync status indicator
├── charts/
│   ├── TimeSeriesChart.tsx   # Reusable Recharts wrapper
│   ├── BarChart.tsx
│   └── DonutChart.tsx
├── tables/
│   └── DataTable.tsx         # Sortable, filterable table
├── forms/
│   └── SkoolEntryForm.tsx    # Manual Skool data input
└── query/
    └── CommandBar.tsx        # ⌘K natural language query

3.5 MetricCard Component Pattern
interface MetricCardProps {
  label: string;
  value: string | number;
  format?: 'currency' | 'number' | 'percent';
  trend?: {
    value: number;      // e.g. 12.5 for +12.5%
    direction: 'up' | 'down' | 'flat';
    isPositive: boolean; // up might be bad (churn) or good (revenue)
  };
  icon?: React.ReactNode;
  sparklineData?: number[];
}


Phase 4: Natural Language Query System (Days 8–9)
4.1 Command Bar (⌘K)
A modal triggered by Cmd+K (or a sidebar button) that lets you type natural language questions about your data.
Flow:
User types: "What was my revenue growth last quarter?"
Frontend sends to /api/query
API route fetches relevant metrics from MongoDB (last 6 months of all data)
Sends context + question to Claude API
Claude responds with analysis
Display answer in the command bar with optional chart
4.2 API Route Implementation
// src/app/api/query/route.ts
export async function POST(request: Request) {
  const { question } = await request.json();

  // 1. Fetch recent metrics from MongoDB (last 90 days)
  const metrics = await db.collection('metrics').find({
    recorded_at: { $gte: ninetyDaysAgo }
  }).toArray();

  // 2. Format context
  const context = formatMetricsForContext(metrics);

  // 3. Send to Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are a business analytics assistant for albertolgaard.com.
             You have access to the following business metrics data.
             Answer questions concisely with specific numbers.
             If you can identify a trend, mention it.
             Format currency as USD. Format percentages to 1 decimal.
             Data: ${context}`,
    messages: [{ role: 'user', content: question }],
  });

  return Response.json({
    answer: response.content[0].text,
  });
}

4.3 Example Queries
"What's my total revenue this month across all sources?"
"How many posts did I publish across all platforms this week?"
"What's my best performing platform by growth rate?"
"Am I on track for my content goals this month?"
"What's my customer acquisition cost based on ad spend vs new customers?"

Phase 5: Sync Engine & Cron (Day 9)
5.1 Unified Sync Orchestrator
// src/lib/sync/index.ts
import { syncStripeMetrics } from '../services/stripe';
import { syncYouTubeMetrics } from '../services/youtube';
// ... all services

const SYNC_CONFIG = [
  { platform: 'stripe', fn: syncStripeMetrics, interval: 'hourly' },
  { platform: 'youtube', fn: syncYouTubeMetrics, interval: '6h' },
  { platform: 'instagram', fn: syncInstagramMetrics, interval: '6h' },
  { platform: 'x', fn: syncXMetrics, interval: '8h' },              // Puppeteer — keep infrequent
  { platform: 'facebook_ads', fn: syncFacebookAdsMetrics, interval: '3h' },
  { platform: 'clickup', fn: syncClickUpMetrics, interval: '2h' },
  { platform: 'skool_free', fn: () => syncSkoolMetrics('free'), interval: '12h' },  // Puppeteer
  { platform: 'skool_paid', fn: () => syncSkoolMetrics('paid'), interval: '12h' },  // Puppeteer
  { platform: 'mercury', fn: syncMercuryMetrics, interval: '3h' },
  { platform: 'revolut', fn: syncRevolutMetrics, interval: '3h' },
  { platform: 'whoop', fn: syncWhoopMetrics, interval: '6h' },
  { platform: 'helpscout', fn: syncAllHelpScout, interval: '2h' },
  { platform: 'kit', fn: syncKitMetrics, interval: '6h' },
];

export async function runFullSync() {
  const results = [];
  for (const config of SYNC_CONFIG) {
    const start = Date.now();
    try {
      const metrics = await config.fn();
      // Write each metric to MongoDB
      for (const [key, value] of Object.entries(metrics)) {
        await db.collection('metrics').insertOne({
          platform: config.platform,
          metric_type: key,
          value: value as number,
          recorded_at: new Date(),
          created_at: new Date(),
        });
      }
      results.push({ platform: config.platform, status: 'success', duration: Date.now() - start });
    } catch (error) {
      results.push({ platform: config.platform, status: 'error', error: error.message });
    }
  }
  // Log sync results
  await db.collection('sync_logs').insertMany(results.map(r => ({ ...r, synced_at: new Date() })));
  return results;
}

5.2 Cron Trigger
Use Vercel Cron to trigger syncs automatically:
// vercel.json
{
  "crons": [
    { "path": "/api/sync", "schedule": "0 */2 * * *" }
  ]
}

Protect the sync endpoint with a secret key header (CRON_SECRET env var) so it can't be triggered externally.

Phase 6: Polish & Enhancements (Days 10–12)
6.1 Animations
Page transitions: fade + slight slide up
Metric cards: count-up animation on load
Charts: draw-in animation
Skeleton loaders while data fetches
6.2 Keyboard Shortcuts
⌘K — Open query bar
⌘S — Trigger sync
1-9 — Navigate to pages
Esc — Close modals
6.3 Notifications (Optional v2)
Weekly digest email via Resend
Alerts: churn spike, ad spend anomaly, sync failure
Slack webhook for critical alerts

File Structure (Final)
buildmyagent-dash/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Redirect to /dashboard
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # Overview
│   │   │   ├── revenue/
│   │   │   │   └── page.tsx            # Stripe detail
│   │   │   ├── youtube/
│   │   │   │   └── page.tsx
│   │   │   ├── instagram/
│   │   │   │   └── page.tsx
│   │   │   ├── x/
│   │   │   │   └── page.tsx
│   │   │   ├── ads/
│   │   │   │   └── page.tsx            # Facebook Ads
│   │   │   ├── community/
│   │   │   │   ├── page.tsx            # Skool overview
│   │   │   │   └── entry/
│   │   │   │       └── page.tsx        # Manual entry form
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx            # ClickUp
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx            # Google Calendar
│   │   │   ├── finances/
│   │   │   │   ├── page.tsx            # Combined finances overview
│   │   │   │   ├── mercury/
│   │   │   │   │   └── page.tsx        # Mercury detail
│   │   │   │   └── revolut/
│   │   │   │       └── page.tsx        # Revolut detail
│   │   │   ├── health/
│   │   │   │   └── page.tsx            # Whoop health/recovery
│   │   │   ├── support/
│   │   │   │   ├── page.tsx            # Combined support overview
│   │   │   │   ├── buildmyagent/
│   │   │   │   │   └── page.tsx        # BMA Help Scout detail
│   │   │   │   └── the1percent/
│   │   │   │       └── page.tsx        # T1P Help Scout detail
│   │   │   ├── email/
│   │   │   │   └── page.tsx            # Kit (ConvertKit), and a manual Partnerships tracker email marketing
│   │   │   ├── partnerships/
│   │   │   │   └── page.tsx            # Manual partnership tracker
│   │   │   ├── coach/
│   │   │   │   ├── page.tsx            # Chat + Weekly + Playbook tabs
│   │   │   │   └── weekly/page.tsx     # Dedicated weekly review archive
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       │   └── route.ts
│   │       ├── sync/
│   │       │   ├── route.ts            # Full sync
│   │       │   └── [platform]/
│   │       │       └── route.ts        # Per-platform sync
│   │       ├── metrics/
│   │       │   └── route.ts            # Read metrics from DB
│   │       ├── skool/
│   │       │   └── route.ts            # CRUD for manual entries
│   │       ├── partnerships/
│   │       │   └── route.ts            # CRUD for partnership deals
│   │       ├── coach/
│   │       │   ├── brief/route.ts      # Daily morning brief (cron + GET)
│   │       │   ├── weekly/route.ts     # Weekly review (cron + GET)
│   │       │   ├── ask/route.ts        # Interactive chat (POST)
│   │       │   ├── playbook/route.ts   # Growth playbook (POST)
│   │       │   └── history/route.ts    # Past sessions (GET)
│   │       ├── calendar/
│   │       │   └── route.ts            # Google Calendar events (live fetch)
│   │       └── query/
│   │           └── route.ts            # Claude-powered query
│   ├── lib/
│   │   ├── db.ts                       # MongoDB connection
│   │   ├── auth.ts                     # NextAuth config
│   │   ├── services/
│   │   │   ├── stripe.ts
│   │   │   ├── youtube.ts
│   │   │   ├── instagram.ts
│   │   │   ├── x.ts
│   │   │   ├── facebook-ads.ts
│   │   │   ├── clickup.ts
│   │   │   ├── google-calendar.ts
│   │   │   ├── mercury.ts
│   │   │   ├── revolut.ts
│   │   │   ├── whoop.ts
│   │   │   ├── helpscout.ts
│   │   │   └── kit.ts
│   │   ├── coach/
│   │   │   ├── context.ts              # Business snapshot assembly
│   │   │   ├── prompts.ts             # System prompts per mode
│   │   │   └── index.ts              # runCoach() orchestrator
│   │   └── sync/
│   │       └── index.ts                # Sync orchestrator
│   ├── components/
│   │   ├── layout/
│   │   ├── cards/
│   │   ├── charts/
│   │   ├── tables/
│   │   ├── forms/
│   │   ├── query/
│   │   └── calendar/
│   └── middleware.ts                   # IP firewall
├── .env.local
├── tailwind.config.ts
└── package.json


Build Priority Order
Priority
What
Why
Days
P0
Project setup, auth, layout shell, IP middleware
Foundation
1–2
P1
Stripe integration + Revenue page
Core business metric
2–3
P1
Overview page with all KPI cards
Highest daily value
3–4
P2
YouTube + Instagram + X integrations
Content tracking
4–5
P2
Facebook Ads integration
Ad performance
5–6
P2
ClickUp integration
Task visibility
6
P2
Google Calendar integration + Calendar page
Schedule visibility
6–7
P2
Mercury + Revolut integrations + Finances page
Cash flow visibility
7–8
P2
Whoop integration + Health page
Recovery/strain tracking
8
P2
Help Scout (×2) integration + Support page
Ticket visibility
8–9
P2
Kit (ConvertKit), and a manual Partnerships tracker integration + Email page
Email marketing stats
9
P2
Partnerships tracker page
Manual deal logging
9
P3
AI Coach — context engine + morning brief
Core coaching infra
10
P3
AI Coach — weekly review + ask chat
Interactive coaching
10–11
P4
AI Coach — growth playbook + history
Deep strategy
11–12
P3
Skool manual entry system
No API workaround
7
P3
Sync engine + cron
Automate everything
7–8
P4
Command bar (⌘K) + Claude query
Power feature
8–9
P4
Charts + historical trends
Visual polish
9–10
P5
Animations + keyboard shortcuts
Polish
10–12


API Keys & Setup Checklist
Before building, you'll need to obtain:
[ ] Stripe: Dashboard → Developers → API Keys (secret key)
[ ] YouTube: Google Cloud Console → Enable YouTube Data API v3 → Create API key
[ ] Instagram: Meta Developer Portal → Create App → Add Instagram Graph API → Generate long-lived token
[ ] Facebook Ads: Same Meta app → Add Marketing API → Get ad account ID
[ ] X: No API key needed — uses Puppeteer scraping of public profile. Just set your username in env.
[ ] ClickUp: Settings → Apps → Generate API Token
[ ] Google Calendar: Google Cloud Console → Enable Calendar API → Create OAuth 2.0 credentials (Client ID + Secret) → Add to NextAuth Google provider
[ ] Mercury: Mercury Dashboard → Settings → API → Generate API Token (Bearer token)
[ ] Revolut Business: Revolut Dashboard → Settings → APIs → Business API → Generate certificate → Download private key → Complete initial OAuth consent flow → Store access + refresh tokens
[ ] Whoop: developer-dashboard.whoop.com → Create App → Set redirect URI → Complete OAuth flow → Store access + refresh tokens
[ ] Help Scout (BuildMyAgent): Help Scout → Profile → My Apps → Create OAuth App → Copy App ID + Secret
[ ] Help Scout (The 1 Percent): Same steps on your second Help Scout account → Copy App ID + Secret
[ ] Kit (ConvertKit), and a manual Partnerships tracker: Kit → Settings → Advanced → API → Generate V4 API key → Copy key
[ ] Skool: No API key needed — uses Puppeteer scraping. Store your Skool login credentials in env.
[ ] MongoDB: Atlas → Create Free Cluster → Get connection string
[ ] Claude: Anthropic Console → Generate API key

