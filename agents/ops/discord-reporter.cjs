/**
 * Discord Reporter — CommonJS wrapper
 * Use this in CommonJS scripts (require() instead of import)
 *
 * const { report, reportError } = require('../../ops/discord-reporter.cjs');
 */
module.exports = {
  report: async (agentName, report) => {
    const { report: fn } = await import('../../ops/discord-reporter.js');
    return fn(agentName, report);
  },
  reportError: async (agentName, err, context) => {
    const { reportError: fn } = await import('../../ops/discord-reporter.js');
    return fn(agentName, err, context);
  },
  reportDailySummary: async (agentName, data) => {
    const { reportDailySummary: fn } = await import('../../ops/discord-reporter.js');
    return fn(agentName, data);
  },
};
