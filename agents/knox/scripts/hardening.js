import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const ALLOWED_PORTS = [22, 80, 443, 3000, 3001, 3002, 8080, 41641, 53, 25, 2019, 5355, 51567, 18789, 18791, 56717];

const sendTelegram = async (message) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
  });
};

const run = (cmd) => {
  try { return execSync(cmd, { encoding: 'utf8', timeout: 10000 }).trim(); }
  catch { return null; }
};

const check = (name, passed, detail = '') => ({
  name, passed, detail, points: passed ? 10 : 0
});

const runHardening = async () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const checks = [];

  // 1. SSH root login disabled
  const sshConfig = run('cat /etc/ssh/sshd_config');
  const rootLogin = sshConfig?.includes('PermitRootLogin no') || sshConfig?.includes('PermitRootLogin prohibit-password');
  checks.push(check('SSH root login disabled', rootLogin, rootLogin ? 'PermitRootLogin disabled' : 'Root login may be enabled'));

  // 2. SSH password auth disabled
  const passAuth = sshConfig?.includes('PasswordAuthentication no');
  checks.push(check('SSH password auth disabled', passAuth, passAuth ? 'Key-only auth enforced' : 'Password auth may be enabled'));

  // 3. Fail2ban running
  const f2b = run('systemctl is-active fail2ban');
  checks.push(check('Fail2ban active', f2b === 'active', `Status: ${f2b || 'unknown'}`));

  // 4. Firewall (ufw or iptables)
  const ufw = run('sudo ufw status 2>/dev/null');
  const ufwActive = ufw?.toLowerCase().includes('status: active');
  checks.push(check('Firewall active', ufwActive, ufwActive ? 'UFW active' : 'No firewall detected'));

  // 5. Open ports check
  const ports = run('ss -tlnp | grep LISTEN');
  const openPorts = (ports || '').split('\n')
    .map(l => parseInt(l.match(/:(\d+)\s/)?.[1]))
    .filter(p => p && !isNaN(p));
  const unexpectedPorts = openPorts.filter(p => !ALLOWED_PORTS.includes(p));
  checks.push(check('No unexpected open ports', unexpectedPorts.length === 0,
    unexpectedPorts.length ? `Unexpected: ${unexpectedPorts.join(', ')}` : 'All ports accounted for'));

  // 6. Swap configured
  const swap = run('/sbin/swapon --show');
  checks.push(check('Swap configured', !!swap && swap.length > 0, swap ? 'Swap active' : 'No swap — OOM risk'));

  // 7. Automatic updates
  const autoUpdates = run('cat /etc/apt/apt.conf.d/20auto-upgrades 2>/dev/null');
  const autoEnabled = autoUpdates?.includes('1');
  checks.push(check('Auto updates enabled', autoEnabled, autoEnabled ? 'Unattended upgrades active' : 'Manual updates only'));

  // 8. Tailscale running
  const tailscale = run('systemctl is-active tailscaled');
  checks.push(check('Tailscale active', tailscale === 'active', `Status: ${tailscale || 'unknown'}`));

  // 9. Pending updates
  const updates = run('apt list --upgradable 2>/dev/null | wc -l');
  const pendingCount = parseInt(updates) - 1;
  checks.push(check('System up to date', pendingCount <= 5, `${pendingCount} updates pending`));

  // 10. No world-writable files in openclaw
  const worldWritable = run('find /home/saint/.openclaw -perm -o+w -type f 2>/dev/null | wc -l');
  const wwCount = parseInt(worldWritable) || 0;
  checks.push(check('No world-writable files', wwCount === 0, `${wwCount} world-writable files found`));

  // Calculate score
  const score = checks.reduce((sum, c) => sum + c.points, 0);
  const maxScore = checks.length * 10;
  const pct = Math.round((score / maxScore) * 100);

  const passed = checks.filter(c => c.passed).length;
  const failed = checks.filter(c => !c.passed);

  // Build report
  let report = `🔐 Knox Hardening — ${dateStr}\n\n`;
  report += `SCORE: ${pct}/100\n`;
  report += `CHECKS: ${passed}/${checks.length} passed\n`;

  if (failed.length > 0) {
    report += `\nFAILED CHECKS\n`;
    failed.forEach(c => report += `• ${c.name}: ${c.detail}\n`);
  } else {
    report += `\nAll checks passed ✅\n`;
  }

  report += `\n— Knox`;

  console.log(report);
  await sendTelegram(report);

  // Save to Supabase
  await supabase.from('activity_log').insert({
    agent_id: 'knox',
    action_type: 'hardening_audit',
    title: `Hardening audit — ${pct}/100`,
    description: report,
    metadata: { score: pct, passed, failed: failed.length, checks: checks.map(c => ({ name: c.name, passed: c.passed })) }
  });

  if (pct < 70) {
    await sendTelegram(`🚨 KNOX — Hardening score dropped to ${pct}/100. Immediate review required.`);
  }

  console.log('Knox hardening audit complete.');
};

runHardening();
