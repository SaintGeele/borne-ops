/**
 * QuoteHook State Machine
 * Handles quote follow-up sequencing: Day 1 → Day 3 → Day 7 → Day 14
 * 
 * Stages:
 *   pending    - Initial state, waiting for first touch
 *   day1       - Day 1 follow-up sent
 *   day3       - Day 3 follow-up sent
 *   day7       - Day 7 follow-up sent
 *   day14      - Day 14 follow-up sent (final)
 *   closed     - Quote closed (won or human escalation)
 *   expired    - Quote expired after final touch
 */

const { createClient } = require('@supabase/supabase-js');

const STAGES = {
  PENDING:  'pending',
  DAY1:     'day1',
  DAY3:     'day3',
  DAY7:     'day7',
  DAY14:    'day14',
  CLOSED:   'closed',
  EXPIRED:  'expired',
};

// Touch day → next stage mapping
const NEXT_STAGE = {
  [STAGES.PENDING]: STAGES.DAY1,
  [STAGES.DAY1]:    STAGES.DAY3,
  [STAGES.DAY3]:    STAGES.DAY7,
  [STAGES.DAY7]:    STAGES.DAY14,
  [STAGES.DAY14]:   STAGES.EXPIRED,
};

// Days to wait after each stage
const TOUCH_INTERVALS = {
  [STAGES.PENDING]: 1,
  [STAGES.DAY1]:    2,
  [STAGES.DAY3]:    4,
  [STAGES.DAY7]:    7,
};

class QuoteHookStateMachine {
  constructor(supabaseUrl, supabaseKey) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create a new quote in the system
   */
  async createQuote({ clientName, clientEmail, clientPhone, quoteValue, source }) {
    const { data, error } = await this.supabase
      .from('quotes')
      .insert({
        client_name:      clientName,
        client_email:    clientEmail,
        client_phone:    clientPhone,
        quote_value:     quoteValue,
        source,
        stage:           STAGES.PENDING,
        touch_count:     0,
        next_touch_date: this._calculateNextTouch(new Date(), 1),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create quote: ${error.message}`);
    return data;
  }

  /**
   * Process a reply from a client
   * Returns: { action: 'escalate' | 'stop' | 'continue', quote }
   */
  async processReply(quoteId, replyText) {
    const normalized = replyText.trim().toLowerCase();

    if (['interested', 'yes', 'yeah', 'yep', 'sure', 'let's go', 'lets go'].includes(normalized)) {
      await this.closeQuote(quoteId, 'won');
      return { action: 'escalate', reason: 'client_interested', quoteId };
    }

    if (['stop', 'unsubscribe', 'no', 'not interested', 'not interested', 'remove', 'leave me alone'].includes(normalized)) {
      await this.closeQuote(quoteId, 'stopped');
      return { action: 'stop', reason: 'client_opt_out', quoteId };
    }

    return { action: 'continue' };
  }

  /**
   * Advance a quote to the next stage after a successful touch
   */
  async advanceStage(quoteId, touchDay) {
    const { data: quote, error: fetchError } = await this.supabase
      .from('quotes')
      .select('stage, touch_count')
      .eq('id', quoteId)
      .single();

    if (fetchError) throw new Error(`Quote not found: ${quoteId}`);

    const currentStage = quote.stage;
    const nextStage    = NEXT_STAGE[currentStage];

    if (!nextStage) {
      // Already at terminal state
      return { quote, alreadyTerminal: true };
    }

    const touchCount   = quote.touch_count + 1;
    const daysToWait   = TOUCH_INTERVALS[currentStage] || 0;
    const nextTouchDate = this._calculateNextTouch(new Date(), daysToWait);

    const { data: updated, error: updateError } = await this.supabase
      .from('quotes')
      .update({
        stage:           nextStage,
        touch_count:     touchCount,
        next_touch_date: nextTouchDate,
        updated_at:      new Date().toISOString(),
      })
      .eq('id', quoteId)
      .select()
      .single();

    if (updateError) throw new Error(`Failed to advance stage: ${updateError.message}`);

    return { quote: updated, fromStage: currentStage, toStage: nextStage };
  }

  /**
   * Close a quote manually
   */
  async closeQuote(quoteId, reason = 'closed') {
    const { data, error } = await this.supabase
      .from('quotes')
      .update({
        stage:      STAGES.CLOSED,
        close_reason: reason,
        closed_at:  new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', quoteId)
      .select()
      .single();

    if (error) throw new Error(`Failed to close quote: ${error.message}`);
    return data;
  }

  /**
   * Get all quotes that need a touch today
   */
  async getQuotesNeedingTouch() {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('quotes')
      .select('*, quote_touches(*)')
      .neq('stage', STAGES.CLOSED)
      .neq('stage', STAGES.EXPIRED)
      .lte('next_touch_date', today);

    if (error) throw new Error(`Failed to fetch quotes: ${error.message}`);
    return data;
  }

  /**
   * Get quotes that need a specific day's touch
   */
  async getQuotesForTouchDay(touchDay) {
    const today = new Date().toISOString().split('T')[0];

    // Map touch day to stage
    const stageMap = {
      1:  STAGES.PENDING,
      3:  STAGES.DAY1,
      7:  STAGES.DAY3,
      14: STAGES.DAY7,
    };

    const stage = stageMap[touchDay];
    if (!stage) return [];

    const { data, error } = await this.supabase
      .from('quotes')
      .select('*, quote_touches(*)')
      .eq('stage', stage)
      .lte('next_touch_date', today);

    if (error) throw new Error(`Failed to fetch quotes for touch day ${touchDay}: ${error.message}`);
    return data;
  }

  /**
   * Log a touch to the audit trail
   */
  async logTouch({ quoteId, touchDay, channel, message, messageId }) {
    const { data, error } = await this.supabase
      .from('quote_touches')
      .insert({
        quote_id:   quoteId,
        touch_day:  touchDay,
        channel,
        message,
        message_id: messageId,
        sent_at:    new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to log touch: ${error.message}`);
    return data;
  }

  /**
   * Check if a touch was already sent today on a specific channel
   */
  async touchSentToday(quoteId, touchDay, channel) {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('quote_touches')
      .select('id')
      .eq('quote_id', quoteId)
      .eq('touch_day', touchDay)
      .eq('channel', channel)
      .gte('sent_at', today);

    if (error) throw new Error(`Failed to check existing touch: ${error.message}`);
    return data.length > 0;
  }

  /**
   * Get a quote by ID
   */
  async getQuote(quoteId) {
    const { data, error } = await this.supabase
      .from('quotes')
      .select('*, quote_touches(*)')
      .eq('id', quoteId)
      .single();

    if (error) throw new Error(`Quote not found: ${error.message}`);
    return data;
  }

  _calculateNextTouch(fromDate, daysToAdd) {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + daysToAdd);
    return d.toISOString().split('T')[0];
  }
}

module.exports = { QuoteHookStateMachine, STAGES };
