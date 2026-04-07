#!/usr/bin/env node
/**
 * n8n-trigger.js
 * Trigger n8n workflows from events (VAPI, form submissions, etc.)
 * Can be used standalone or imported as a module.
 */

const https = require('https');

// ─── Config ───────────────────────────────────────────────────────────────────
const N8N_BASE = process.env.N8N_BASE_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// ─── Logging ──────────────────────────────────────────────────────────────────
function log(level, message, data = {}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    script: 'n8n-trigger',
    message,
    ...data
  }));
}

// ─── HTTP request helper ──────────────────────────────────────────────────────
function n8nRequest(method, path, body = null, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_API_KEY ? { 'X-N8N-API-KEY': N8N_API_KEY } : {})
      },
      timeout
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: parsed });
          } else {
            reject(new Error(`n8n returned ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch {
          resolve({ status: res.statusCode, data: data || '' });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`n8n request timed out after ${timeout}ms`));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// ─── Workflow Triggers ─────────────────────────────────────────────────────────

/**
 * Trigger onboarding workflow for a new lead
 * @param {Object} leadData - { leadId, name, email, phone, source }
 * @param {string} workflowId - n8n workflow ID (defaults to env N8N_ONBOARDING_WORKFLOW_ID)
 */
async function triggerOnboarding(leadData, workflowId = null) {
  const id = workflowId || process.env.N8N_ONBOARDING_WORKFLOW_ID;
  if (!id) {
    throw new Error('No onboarding workflow ID provided or configured');
  }
  log('info', 'Triggering onboarding workflow', { workflowId: id, leadId: leadData.leadId });
  return n8nRequest('POST', `/webhook/${id}`, {
    event: 'lead.onboarding',
    ...leadData,
    triggered_at: new Date().toISOString()
  });
}

/**
 * Trigger outreach workflow for Chase
 * @param {Object} leadData - { leadId, phone, score, source, priority }
 * @param {string} workflowId - n8n workflow ID
 */
async function triggerOutreach(leadData, workflowId = null) {
  const id = workflowId || process.env.N8N_OUTREACH_WORKFLOW_ID;
  if (!id) {
    throw new Error('No outreach workflow ID provided or configured');
  }
  log('info', 'Triggering outreach workflow', { workflowId: id, leadId: leadData.leadId });
  return n8nRequest('POST', `/webhook/${id}`, {
    event: 'lead.outreach',
    ...leadData,
    triggered_at: new Date().toISOString()
  });
}

/**
 * Trigger VAPI call end processing workflow
 * @param {Object} callData - { callId, phone, duration, transcript, disposition }
 * @param {string} workflowId - n8n workflow ID
 */
async function triggerVAPICallEnd(callData, workflowId = null) {
  const id = workflowId || process.env.N8N_VAPI_WORKFLOW_ID;
  if (!id) {
    throw new Error('No VAPI workflow ID provided or configured');
  }
  log('info', 'Triggering VAPI workflow', { workflowId: id, callId: callData.call_id });
  return n8nRequest('POST', `/webhook/${id}`, {
    event: 'vapi.call_end',
    ...callData,
    triggered_at: new Date().toISOString()
  });
}

/**
 * Trigger custom workflow by ID
 * @param {string} workflowId - n8n workflow ID
 * @param {Object} payload - Custom payload to send
 */
async function triggerCustom(workflowId, payload) {
  if (!workflowId) {
    throw new Error('Workflow ID is required');
  }
  log('info', 'Triggering custom workflow', { workflowId });
  return n8nRequest('POST', `/webhook/${workflowId}`, {
    event: payload.event || 'custom.trigger',
    ...payload,
    triggered_at: new Date().toISOString()
  });
}

/**
 * List active n8n workflows (requires API key)
 */
async function listWorkflows() {
  if (!N8N_API_KEY) {
    throw new Error('N8N_API_KEY required for listing workflows');
  }
  log('info', 'Fetching n8n workflows');
  return n8nRequest('GET', '/rest/workflows');
}

/**
 * Get workflow status
 * @param {string} workflowId - n8n workflow ID
 */
async function getWorkflowStatus(workflowId) {
  if (!N8N_API_KEY) {
    throw new Error('N8N_API_KEY required for workflow status');
  }
  log('info', 'Fetching workflow status', { workflowId });
  return n8nRequest('GET', `/rest/workflows/${workflowId}`);
}

// ─── CLI Interface ────────────────────────────────────────────────────────────
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  async function run() {
    try {
      switch (command) {
        case 'onboarding':
        case 'onboard': {
          const [leadId, name, email, phone, source] = args.slice(1);
          const result = await triggerOnboarding({ leadId, name, email, phone, source });
          console.log('Success:', JSON.stringify(result));
          break;
        }
        case 'outreach': {
          const [leadId, phone, score, source, priority] = args.slice(1);
          const result = await triggerOutreach({ leadId, phone, score: parseInt(score), source, priority });
          console.log('Success:', JSON.stringify(result));
          break;
        }
        case 'vapi': {
          const [callId, phone, duration, transcript, disposition] = args.slice(1);
          const result = await triggerVAPICallEnd({ call_id: callId, phone, duration: parseInt(duration), transcript, disposition });
          console.log('Success:', JSON.stringify(result));
          break;
        }
        case 'custom': {
          const [workflowId, ...rest] = args.slice(1);
          const payload = rest.length > 0 ? JSON.parse(rest.join(' ')) : {};
          const result = await triggerCustom(workflowId, payload);
          console.log('Success:', JSON.stringify(result));
          break;
        }
        case 'list':
        case 'ls': {
          const result = await listWorkflows();
          console.log(JSON.stringify(result, null, 2));
          break;
        }
        case 'status': {
          const workflowId = args[1];
          const result = await getWorkflowStatus(workflowId);
          console.log(JSON.stringify(result, null, 2));
          break;
        }
        default:
          console.log(`Usage:
  n8n-trigger.js onboarding <leadId> [name] [email] [phone] [source]
  n8n-trigger.js outreach <leadId> [phone] [score] [source] [priority]
  n8n-trigger.js vapi <callId> [phone] [duration] [transcript] [disposition]
  n8n-trigger.js custom <workflowId> [payloadJson]
  n8n-trigger.js list
  n8n-trigger.js status <workflowId>
`);
          process.exit(1);
      }
    } catch (err) {
      log('error', 'Trigger failed', { error: err.message });
      console.error('Error:', err.message);
      process.exit(1);
    }
  }

  run();
}

module.exports = {
  triggerOnboarding,
  triggerOutreach,
  triggerVAPICallEnd,
  triggerCustom,
  listWorkflows,
  getWorkflowStatus
};
