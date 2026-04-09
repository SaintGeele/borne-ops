/**
 * Patch Guidance Generator
 * Generates fix commands and remediation guidance for CVEs
 */

export const PACKAGE_MAP = {
  'node.js': { type: 'apt', command: 'apt update && apt install -y nodejs', restart: true, service: 'node' },
  'nodejs': { type: 'apt', command: 'apt update && apt install -y nodejs', restart: true, service: 'node' },
  'openssl': { type: 'apt', command: 'apt update && apt install -y openssl', restart: true, service: 'ssl' },
  'linux kernel': { type: 'apt', command: 'apt update && apt upgrade -y linux-image-*', restart: true, service: 'kernel' },
  'debian': { type: 'apt', command: 'apt update && apt full-upgrade -y', restart: true, service: 'system' },
  'npm': { type: 'npm', command: 'npm audit fix', restart: false, service: 'npm' },
  'caddy': { type: 'apt', command: 'apt update && apt install -y caddy', restart: true, service: 'caddy' },
  'tailscale': { type: 'apt', command: 'curl -fsSL https://tailscale.com/install.sh | sh', restart: true, service: 'tailscale' },
  'supabase': { type: 'npm', command: 'npm audit fix --prefix /path/to/supabase', restart: true, service: 'supabase' },
  'express': { type: 'npm', command: 'npm audit fix', restart: true, service: 'express' },
  'ssh': { type: 'apt', command: 'apt update && apt install -y openssh-server', restart: true, service: 'ssh' },
  'firefox': { type: 'apt', command: 'apt update && apt install -y firefox-esr', restart: true, service: 'firefox' },
  'curl': { type: 'apt', command: 'apt update && apt install -y curl', restart: false, service: 'curl' },
  'git': { type: 'apt', command: 'apt update && apt install -y git', restart: false, service: 'git' },
  'docker': { type: 'shell', command: 'docker-compose down && docker-compose pull && docker-compose up -d', restart: true, service: 'docker' },
  'python': { type: 'apt', command: 'apt update && apt install -y python3 python3-pip', restart: false, service: 'python' },
  'postgresql': { type: 'apt', command: 'apt update && apt install -y postgresql', restart: true, service: 'postgres' },
  'nginx': { type: 'apt', command: 'apt update && apt install -y nginx', restart: true, service: 'nginx' },
  'redis': { type: 'apt', command: 'apt update && apt install -y redis-server', restart: true, service: 'redis' },
};

export const SLA = {
  EMERGENCY: { hours: 4, label: '4 hours', priority: 0 },
  CRITICAL: { hours: 24, label: '24 hours', priority: 1 },
  HIGH: { hours: 168, label: '7 days', priority: 2 },
  MEDIUM: { hours: 720, label: '30 days', priority: 3 },
  LOW: { hours: 2160, label: '90 days', priority: 4 },
};

/**
 * Get SLA tier based on priority signals
 */
export function getSLATier(cve) {
  const { cvssScore, epssScore, isKEV, isRansomware, isActivelyExploited } = cve;
  
  if (isKEV || isRansomware || isActivelyExploited) {
    return { ...SLA.EMERGENCY, reason: 'Actively exploited / KEV listed' };
  }
  if (cvssScore >= 9.0 || (cvssScore >= 7.0 && epssScore > 0.1)) {
    return { ...SLA.CRITICAL, reason: 'Critical CVSS and high exploitation probability' };
  }
  if (cvssScore >= 7.0) {
    return { ...SLA.HIGH, reason: 'High CVSS score' };
  }
  if (cvssScore >= 4.0) {
    return { ...SLA.MEDIUM, reason: 'Medium CVSS score' };
  }
  return { ...SLA.LOW, reason: 'Low CVSS score' };
}

/**
 * Detect affected packages from CVE description
 */
export function detectAffectedPackages(description) {
  const desc = description.toLowerCase();
  const found = [];
  
  for (const [pkg, info] of Object.entries(PACKAGE_MAP)) {
    if (desc.includes(pkg)) {
      found.push({ package: pkg, ...info });
    }
  }
  
  return found.length > 0 ? found : null;
}

/**
 * Generate patch guidance for a CVE
 */
export function generatePatchGuidance(cve) {
  const packages = detectAffectedPackages(cve.description || cve.desc || '');
  const sla = getSLATier(cve);
  
  const guidance = {
    cveId: cve.id,
    cvssScore: cve.score || cve.cvssScore,
    epssScore: cve.epssScore,
    isKEV: cve.isKEV || false,
    sla: sla.label,
    slaDeadline: calculateDeadline(sla.hours),
    packages: packages || [],
    fixCommands: [],
    restartRequired: false,
    priority: sla.priority,
    summary: '',
  };
  
  if (packages && packages.length > 0) {
    guidance.fixCommands = packages.map(p => ({
      package: p.package,
      command: p.command,
      type: p.type,
    }));
    guidance.restartRequired = packages.some(p => p.restart);
    guidance.summary = `Affecting: ${packages.map(p => p.package).join(', ')}. Fix: ${packages[0].command}`;
  } else {
    // Generic fallback
    guidance.fixCommands = [{ package: 'system', command: 'apt update && apt full-upgrade -y', type: 'apt' }];
    guidance.summary = `General system update recommended. Run: apt update && apt full-upgrade -y`;
    guidance.restartRequired = true;
  }
  
  return guidance;
}

function calculateDeadline(hours) {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

/**
 * Format patch guidance for Telegram
 */
export function formatPatchGuidance(guidance) {
  let msg = '';
  
  if (guidance.packages.length > 0) {
    msg += `📦 Affected: ${guidance.packages.map(p => p.package).join(', ')}\n`;
  }
  
  if (guidance.fixCommands.length > 0) {
    msg += `🔧 Fix:\n`;
    guidance.fixCommands.forEach(fc => {
      msg += `   ${fc.command}\n`;
    });
  }
  
  msg += `⏱️ SLA: ${guidance.sla}`;
  if (guidance.restartRequired) {
    msg += ` | 🔄 Restart required`;
  }
  
  return msg;
}

/**
 * Generate executive summary for a CVE
 */
export function formatExecutiveSummary(cve) {
  const sla = getSLATier(cve);
  return `${cve.id} — CVSS ${cve.score || cve.cvssScore}/10 | EPSS ${((cve.epssScore || 0) * 100).toFixed(1)}% | ${sla.label} SLA${cve.isKEV ? ' | 🚨 KEV (actively exploited)' : ''}`;
}
