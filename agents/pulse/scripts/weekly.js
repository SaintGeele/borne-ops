import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendTelegram = async (message) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
  });
};

const logToSupabase = async (title, description, metadata = {}) => {
  await supabase.from('activity_log').insert({
    agent_id: 'pulse',
    action_type: 'weekly_pulse',
    title,
    description,
    metadata
  });
};

const runWeeklyPulse = async () => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  weekStart.setHours(0,0,0,0);

  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(weekStart.getDate() - 7);

  const dateRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // 1. Agent activity this week vs last week
  const { data: thisWeekLogs } = await supabase
    .from('activity_log')
    .select()
    .gte('created_at', weekStart.toISOString())
    .lte('created_at', now.toISOString());

  const { data: lastWeekLogs } = await supabase
    .from('activity_log')
    .select()
    .gte('created_at', prevWeekStart.toISOString())
    .lt('created_at', weekStart.toISOString());

  // Group by agent this week
  const thisWeekByAgent = {};
  (thisWeekLogs || []).forEach(l => {
    thisWeekByAgent[l.agent_id] = (thisWeekByAgent[l.agent_id] || 0) + 1;
  });

  const lastWeekTotal = (lastWeekLogs || []).length;
  const thisWeekTotal = (thisWeekLogs || []).length;
  const activityChange = lastWeekTotal > 0
    ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
    : 0;

  // 2. Email metrics this week
  const { data: emailEvents } = await supabase
    .from('email_events')
    .select()
    .gte('ts', weekStart.toISOString());

  const emailStats = { sent: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, replied: 0 };
  (emailEvents || []).forEach(e => {
    if (e.event_type === 'email.sent') emailStats.sent++;
    if (e.event_type === 'email.opened') emailStats.opened++;
    if (e.event_type === 'email.clicked') emailStats.clicked++;
    if (e.event_type === 'email.bounced') emailStats.bounced++;
    if (e.event_type === 'email.unsubscribed') emailStats.unsubscribed++;
    if (e.event_type === 'email.replied') emailStats.replied++;
  });

  const openRate = emailStats.sent > 0 ? Math.round(emailStats.opened / emailStats.sent * 100) : 0;
  const replyRate = emailStats.sent > 0 ? Math.round(emailStats.replied / emailStats.sent * 100) : 0;

  // 3. Lead pipeline
  const { data: leads } = await supabase
    .from('leads')
    .select('status');

  const pipeline = {};
  (leads || []).forEach(l => {
    pipeline[l.status] = (pipeline[l.status] || 0) + 1;
  });

  const { data: newLeads } = await supabase
    .from('leads')
    .select()
    .gte('created_at', weekStart.toISOString());

  // 4. Financial snapshot
  const { data: allExpenses } = await supabase.from('expenses').select();
  const fixedTotal = (allExpenses || [])
    .filter(e => e.billing === 'monthly')
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const mtdVariable = (allExpenses || [])
    .filter(e => e.billing === 'daily' && new Date(e.ts) >= mtdStart)
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  // 5. QA summary
  const { data: qaLogs } = await supabase
    .from('activity_log')
    .select()
    .eq('agent_id', 'inspector')
    .gte('created_at', weekStart.toISOString());

  const totalIssues = (qaLogs || []).reduce((sum, l) => sum + (l.metadata?.issues?.length || 0), 0);
  const criticals = (qaLogs || []).reduce((sum, l) => sum + (l.metadata?.criticals || 0), 0);

  // 6. Open alerts
  const { data: openAlerts } = await supabase
    .from('pulse_alerts')
    .select()
    .eq('resolved', false)
    .eq('action_required', true);

  // Build report
  let report = `📊 Pulse Weekly Report — ${dateRange}\n\n`;

  // Agent activity
  report += `AGENT ACTIVITY\n`;
  report += `• Total actions: ${thisWeekTotal} (${activityChange >= 0 ? '+' : ''}${activityChange}% vs last week)\n`;
  const topAgent = Object.entries(thisWeekByAgent).sort((a,b) => b[1]-a[1])[0];
  if (topAgent) report += `• Most active: ${topAgent[0]} (${topAgent[1]} actions)\n`;

  // Email performance
  report += `\nEMAIL PERFORMANCE\n`;
  report += `• Sent: ${emailStats.sent}\n`;
  report += `• Open rate: ${openRate}%\n`;
  report += `• Reply rate: ${replyRate}%\n`;
  report += `• Bounces: ${emailStats.bounced}\n`;
  report += `• Unsubscribes: ${emailStats.unsubscribed}\n`;

  // Pipeline
  report += `\nLEAD PIPELINE\n`;
  report += `• New leads this week: ${(newLeads || []).length}\n`;
  report += `• Total in pipeline: ${(leads || []).length}\n`;
  Object.entries(pipeline).forEach(([status, count]) => {
    report += `• ${status}: ${count}\n`;
  });

  // Financials
  report += `\nFINANCIALS (MTD)\n`;
  report += `• Fixed costs: $${fixedTotal.toFixed(2)}\n`;
  report += `• Variable spend: $${mtdVariable.toFixed(2)}\n`;
  report += `• Total: $${(fixedTotal + mtdVariable).toFixed(2)} / $600 budget\n`;

  // QA
  report += `\nQUALITY\n`;
  report += `• Inspector checks: ${(qaLogs || []).length}\n`;
  report += `• Issues found: ${totalIssues}\n`;
  report += `• Criticals: ${criticals}\n`;

  // Alerts
  if ((openAlerts || []).length > 0) {
    report += `\nOPEN ALERTS: ${openAlerts.length}\n`;
    openAlerts.slice(0, 3).forEach(a => report += `• ${a.event} — ${a.notes}\n`);
  } else {
    report += `\nNo open alerts ✅\n`;
  }

  // Content metrics
  const { data: contentDrafts } = await supabase.from("content_bank").select().eq("status","draft").gte("ts", weekStart.toISOString());
  const { data: contentApproved } = await supabase.from("content_bank").select().eq("status","approved").gte("ts", weekStart.toISOString());
  const { data: contentPublished } = await supabase.from("content_bank").select().eq("status","published").gte("ts", weekStart.toISOString());
  const linkedinPublished = (contentPublished||[]).filter(p => p.platform?.includes("linkedin")).length;
  const twitterPublished = (contentPublished||[]).filter(p => p.platform?.includes("twitter")).length;

  report += `\nCONTENT\n`;
  report += `• Drafted this week: ${(contentDrafts||[]).length}\n`;
  report += `• Approved: ${(contentApproved||[]).length}\n`;
  report += `• Published: ${(contentPublished||[]).length}\n`;
  report += `• LinkedIn posts: ${linkedinPublished}\n`;
  report += `• Twitter posts: ${twitterPublished}\n`;


  // Recommendation
  const rec = emailStats.sent === 0
    ? 'Chase outreach appears stalled — verify cron jobs are running'
    : openRate < 20
    ? 'Email open rate is low — review subject lines with MrX'
    : (openAlerts || []).length > 5
    ? 'Too many unresolved alerts — schedule a cleanup session'
    : 'Operations running smoothly — focus on increasing outreach volume';

  report += `\nRECOMMENDATION\n${rec}\n`;
  report += `\n— Pulse`;

  console.log(report);
  await sendTelegram(report);
  await logToSupabase(
    `Weekly pulse — ${dateRange}`,
    report,
    {
      total_actions: thisWeekTotal,
      activity_change: activityChange,
      email_sent: emailStats.sent,
      open_rate: openRate,
      reply_rate: replyRate,
      new_leads: (newLeads || []).length,
      mtd_spend: fixedTotal + mtdVariable,
      open_alerts: (openAlerts || []).length
    }
  );

  console.log('Pulse weekly complete.');
};

runWeeklyPulse();
