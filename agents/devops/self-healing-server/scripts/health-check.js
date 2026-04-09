#!/usr/bin/env node
/**
 * health-check.js — Self-Healing Server Health Monitor
 * Checks system health metrics, auto-remediates common issues,
 * logs incidents to Supabase, and reports to Telegram.
 * 
 * Usage: node health-check.js [--action check|cleanup|report]
 */

import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendTelegram = async (msg) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg, parse_mode: 'HTML' })
  });
};

const runCmd = (cmd) => {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 15000 }).trim();
  } catch (e) {
    return null;
  }
};

// Thresholds
const THRESHOLDS = {
  cpu_warning: 80,
  cpu_critical: 95,
  memory_warning: 85,
  memory_critical: 95,
  disk_warning: 80,
  disk_critical: 90,
  container_restart_limit: 3
};

const getCpuUsage = () => {
  const out = runCmd("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1");
  return out ? parseFloat(out) : 0;
};

const getMemoryUsage = () => {
  const out = runCmd("free -m | awk 'NR==2{printf \"%.0f\", $3*100/$2}'");
  return out ? parseFloat(out) : 0;
};

const getDiskUsage = () => {
  const out = runCmd("df -h / | awk 'NR==2{print $5}' | tr -d '%'");
  return out ? parseFloat(out) : 0;
};

const getContainerStatus = () => {
  const out = runCmd('docker ps --format "{{.Names}}|{{.Status}}" 2>/dev/null');
  if (!out) return [];
  return out.split('\n').filter(Boolean).map(line => {
    const [name, status] = line.split('|');
    const restarting = status && status.includes('Restarting');
    return { name, status: status || 'unknown', restarting };
  });
};

const getServiceStatus = (service) => {
  const out = runCmd(`systemctl is-active ${service} 2>/dev/null`);
  return out === 'active';
};

const restartContainer = async (name, attempt = 1) => {
  console.log(`[Self-Healing] Restarting container ${name} (attempt ${attempt}/3)`);
  runCmd(`docker restart ${name}`);
  
  await supabase.from('incidents').insert({
    agent_id: 'self-healing-server',
    severity: 'high',
    issue_type: 'container_exit',
    service_name: name,
    action_taken: `docker restart (attempt ${attempt}/3)`,
    before_state: { container: name, action: 'restart' },
    after_state: { container: name, action: 'restarted' },
  });
};

const cleanupDisk = async () => {
  console.log('[Self-Healing] Running disk cleanup...');
  
  const before = getDiskUsage();
  
  // Docker cleanup
  runCmd('docker system prune -af --filter "until=168h" 2>/dev/null');
  
  // Old logs
  runCmd('find /var/log -name "*.log" -mtime +7 -delete 2>/dev/null');
  
  // Temp files
  runCmd('rm -rf /tmp/* 2>/dev/null');
  
  // Package cache
  runCmd('apt-get clean 2>/dev/null');
  
  const after = getDiskUsage();
  const freed = before - after;
  
  await supabase.from('incidents').insert({
    agent_id: 'self-healing-server',
    severity: 'medium',
    issue_type: 'disk_cleanup',
    service_name: 'disk',
    action_taken: `Freed ${freed.toFixed(1)}% disk space`,
    before_state: { disk_pct: before },
    after_state: { disk_pct: after },
  });
  
  console.log(`[Self-Healing] Disk cleanup: ${before}% → ${after}% (freed ${freed.toFixed(1)}%)`);
  return { before, after, freed };
};

const runHealthCheck = async () => {
  console.log('[Self-Healing] Running health check...');
  
  const cpu = getCpuUsage();
  const memory = getMemoryUsage();
  const disk = getDiskUsage();
  const containers = getContainerStatus();
  
  const alerts = [];
  const actions = [];

  // CPU check
  if (cpu > THRESHOLDS.cpu_critical) {
    alerts.push(`🚨 CPU critical: ${cpu.toFixed(1)}%`);
  } else if (cpu > THRESHOLDS.cpu_warning) {
    alerts.push(`⚠️ CPU high: ${cpu.toFixed(1)}%`);
  }

  // Memory check
  if (memory > THRESHOLDS.memory_critical) {
    alerts.push(`🚨 Memory critical: ${memory.toFixed(1)}%`);
  } else if (memory > THRESHOLDS.memory_warning) {
    alerts.push(`⚠️ Memory high: ${memory.toFixed(1)}%`);
  }

  // Disk check
  if (disk > THRESHOLDS.disk_critical) {
    alerts.push(`🚨 Disk critical: ${disk.toFixed(1)}% — running cleanup`);
    await cleanupDisk();
    actions.push('Disk cleanup triggered');
  } else if (disk > THRESHOLDS.disk_warning) {
    alerts.push(`⚠️ Disk elevated: ${disk.toFixed(1)}%`);
  }

  // Container checks
  for (const c of containers) {
    if (c.restarting) {
      alerts.push(`🔄 Container ${c.name} restarting: ${c.status}`);
      // Check restart count from docker inspect
      const restartCount = runCmd(`docker inspect ${c.name} --format '{{.RestartCount}}' 2>/dev/null`);
      if (restartCount && parseInt(restartCount) >= THRESHOLDS.container_restart_limit) {
        alerts.push(`🚨 ${c.name} exceeded restart limit (${restartCount}) — needs human`);
        await supabase.from('incidents').insert({
          agent_id: 'self-healing-server',
          severity: 'high',
          issue_type: 'container_repeated_failure',
          service_name: c.name,
          action_taken: 'Escalated to human — exceeded restart limit',
          before_state: { restart_count: restartCount },
          after_state: { escalated: true },
          escalated: true,
        });
      }
    }
  }

  const status = alerts.some(a => a.startsWith('🚨')) ? 'ISSUE' : 
                 alerts.some(a => a.startsWith('⚠️')) ? 'WATCH' : 'OK';

  await supabase.from('activity_log').insert({
    agent_id: 'self-healing-server',
    action_type: 'health_check',
    title: `Health check: ${status} — CPU ${cpu.toFixed(0)}%, Mem ${memory.toFixed(0)}%, Disk ${disk.toFixed(0)}%`,
    description: `${containers.length} containers, ${alerts.length} alerts`,
    metadata: { cpu, memory, disk, containers: containers.length, alerts, status }
  });

  const msg = [
    `🔧 <b>Self-Healing Server — Health Check</b>`,
    ``,
    `Status: <b>${status}</b>`,
    ``,
    `CPU: ${cpu.toFixed(1)}% ${cpu > THRESHOLDS.cpu_warning ? '⚠️' : '✅'}`,
    `Memory: ${memory.toFixed(1)}% ${memory > THRESHOLDS.memory_warning ? '⚠️' : '✅'}`,
    `Disk: ${disk.toFixed(1)}% ${disk > THRESHOLDS.disk_warning ? '⚠️' : '✅'}`,
    ``,
    ...(alerts.length > 0 ? [`<b>Alerts:</b>\n${alerts.join('\n')}`] : ['No alerts']),
  ].join('\n');

  await sendTelegram(msg);
  console.log(`[Self-Healing] Health check complete: ${status}`);
};

// CLI action dispatch
const action = process.argv[2] || '--action';
if (action === 'cleanup') {
  cleanupDisk().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
} else if (action === 'report') {
  // Weekly report
  const cpu = getCpuUsage();
  const memory = getMemoryUsage();
  const disk = getDiskUsage();
  const containers = getContainerStatus();
  sendTelegram(`📊 <b>Weekly Report</b>\nCPU: ${cpu.toFixed(1)}%\nMemory: ${memory.toFixed(1)}%\nDisk: ${disk.toFixed(1)}%\nContainers: ${containers.length}`).then(() => process.exit(0));
} else {
  runHealthCheck().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
