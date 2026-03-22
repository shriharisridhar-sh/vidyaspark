'use strict';

/**
 * SIMULATE CONVERSATION — Single Conversation Engine
 *
 * Runs one simulated conversation between a manager agent and the customer agent.
 * The manager agent's skill level determines their questioning quality.
 * The customer agent uses the real customerAgent.stream() function.
 *
 * K(t) is tracked via keyword matching (same as SessionStore.updateKnowledgeState).
 */

const Anthropic = require('@anthropic-ai/sdk');
const customerAgent = require('../agents/customerAgent');
const { buildManagerPrompt } = require('./managerPrompts');
const {
  CONTEXT_FUNCTION, DIMENSION_KEYWORDS,
  generateRandomWeights, initializeKnowledgeState,
} = require('../prompts/systemPrompts');

const client = new Anthropic();

/**
 * Update knowledge state K(t) from transcript exchange
 * (Replicates SessionStore.updateKnowledgeState logic without side effects)
 */
function updateKnowledge(K, managerMessage, customerResponse) {
  const combinedText = (managerMessage + ' ' + customerResponse).toLowerCase();
  const previousK = { ...K };

  Object.keys(DIMENSION_KEYWORDS).forEach(dim => {
    const keywords = DIMENSION_KEYWORDS[dim];
    const hits = keywords.filter(kw => combinedText.includes(kw)).length;

    if (hits > 0) {
      const informationSignal = Math.min(hits / keywords.length, 1.0);
      const learningRate = 0.08 * informationSignal;
      const knowledgeGap = 1.0 - K[dim];
      K[dim] += learningRate * knowledgeGap;
      K[dim] = Math.min(K[dim], 1.0);
    }
  });

  // Compute dK/dt
  const dims = Object.keys(K);
  const totalDelta = dims.reduce((sum, dim) => sum + (K[dim] - previousK[dim]), 0);
  const dKdt = totalDelta / dims.length;

  return { K: { ...K }, dKdt };
}

/**
 * Compute objective score from K(t)
 */
function computeObjectiveScore(K) {
  // Weighted average: infoAsymmetry 35%, dimensionPrioritization 35%, competitiveMapping 30%
  // For simplicity, use dimension-based proxy:
  // infoAsymmetry = awareness of hidden vs obvious (did they look beyond price?)
  // dimensionPrioritization = coverage of top dimensions
  // competitiveMapping = depth of non-price exploration

  const priceK = K.price || 0;
  const nonPriceAvg = (['reliability', 'hse', 'technical', 'service']
    .reduce((sum, d) => sum + (K[d] || 0), 0)) / 4;

  // Info asymmetry: did they go beyond price?
  const infoAsymmetry = Math.min(1, nonPriceAvg * 1.5) * 100;

  // Dimension prioritization: coverage of all dimensions
  const explored = Object.values(K).filter(v => v > 0.15).length;
  const dimPrioritization = (explored / 5) * 100;

  // Competitive mapping: depth on high-importance dimensions
  const topDims = ['reliability', 'hse'];
  const topAvg = topDims.reduce((sum, d) => sum + (K[d] || 0), 0) / topDims.length;
  const compMapping = topAvg * 100;

  return Math.round(infoAsymmetry * 0.35 + dimPrioritization * 0.35 + compMapping * 0.30);
}

/**
 * Sleep helper
 */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Call the simulated manager agent with retry logic for rate limits
 */
async function getManagerResponse(systemPrompt, conversationHistory) {
  // For the manager agent, roles are FLIPPED:
  // VP messages (assistant in history) -> user (input to manager)
  // Manager's previous messages (user in history) -> assistant (manager's own outputs)
  const messages = conversationHistory.map(m => ({
    role: (m.role === 'assistant' || m.role === 'customer') ? 'user' : 'assistant',
    content: m.content,
  }));

  // Ensure first message is role: 'user' (Anthropic API requirement)
  if (messages.length > 0 && messages[0].role !== 'user') {
    console.warn('    Warning: First message is not user, adjusting...');
    messages[0].role = 'user';
  }

  // Retry with exponential backoff for rate limits
  const maxRetries = 3;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        system: systemPrompt,
        messages: messages,
      });

      if (!response.content || response.content.length === 0) {
        throw new Error('Empty response from manager agent');
      }
      return response.content[0].text;
    } catch (err) {
      if (err.status === 429 && attempt < maxRetries) {
        const waitMs = Math.pow(2, attempt + 1) * 15000; // 30s, 60s, 120s
        console.warn('    Rate limited (attempt ' + (attempt + 1) + '), waiting ' + (waitMs / 1000) + 's...');
        await sleep(waitMs);
        continue;
      }
      throw new Error('Manager agent failed: ' + err.message);
    }
  }
}

/**
 * Run a single simulated conversation
 *
 * @param {Object} options
 * @param {string} options.skillLevel - 'novice' | 'intermediate' | 'expert'
 * @param {string} options.difficulty - 'easy' | 'medium' | 'hard'
 * @param {number} options.numExchanges - number of exchange pairs (8-12)
 * @param {Object} [options.sessionWeights] - pre-generated weights (optional)
 * @param {number} [options.delayMs=200] - delay between API calls to avoid rate limits
 * @returns {Promise<Object>} ConversationResult
 */
async function simulateConversation({
  skillLevel = 'intermediate',
  difficulty = 'medium',
  numExchanges = 10,
  sessionWeights = null,
  delayMs = 200,
}) {
  const id = 'sim-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  const startTime = Date.now();

  // Generate or use provided weights
  const weights = sessionWeights || generateRandomWeights();

  // Initialize K(t)
  const K = initializeKnowledgeState();

  // Start with the VP's opening line
  const openingLine = CONTEXT_FUNCTION.openingLine;
  const transcript = [
    { role: 'customer', content: openingLine, exchange: 0, timestamp: new Date().toISOString() },
  ];

  // Conversation history for API calls (uses user/assistant roles)
  const history = [
    { role: 'assistant', content: openingLine },
  ];

  const knowledgeTrajectory = [];

  console.log('  [' + id.slice(4, 12) + '] Starting ' + skillLevel + '/' + difficulty + ' conversation (' + numExchanges + ' exchanges)');

  for (let i = 1; i <= numExchanges; i++) {
    try {
      // 1. Get manager response
      const managerPrompt = buildManagerPrompt(skillLevel, i);
      const managerMessage = await getManagerResponse(managerPrompt, history);

      transcript.push({
        role: 'manager', content: managerMessage,
        exchange: i, timestamp: new Date().toISOString(),
      });
      history.push({ role: 'user', content: managerMessage });

      // Small delay to avoid rate limits
      if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));

      // 2. Get customer response (using the real customer agent) with retry
      let customerResponse;
      for (let retry = 0; retry <= 3; retry++) {
        try {
          customerResponse = await customerAgent.stream({
            history: history,
            difficulty: difficulty,
            sessionWeights: weights,
            res: null,  // No SSE streaming, just return text
          });
          break;
        } catch (retryErr) {
          if (retryErr.status === 429 && retry < 3) {
            const waitMs = Math.pow(2, retry + 1) * 15000;
            console.warn('    Customer agent rate limited (attempt ' + (retry + 1) + '), waiting ' + (waitMs / 1000) + 's...');
            await sleep(waitMs);
            continue;
          }
          throw retryErr;
        }
      }

      transcript.push({
        role: 'customer', content: customerResponse,
        exchange: i, timestamp: new Date().toISOString(),
      });
      history.push({ role: 'assistant', content: customerResponse });

      // 3. Update K(t)
      const kUpdate = updateKnowledge(K, managerMessage, customerResponse);
      knowledgeTrajectory.push({
        exchange: i,
        K: kUpdate.K,
        dKdt: kUpdate.dKdt,
      });

      // Small delay
      if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));

    } catch (err) {
      console.warn('  [' + id.slice(4, 12) + '] Exchange ' + i + ' failed:', err.message);
      // Continue with remaining exchanges
      knowledgeTrajectory.push({
        exchange: i,
        K: { ...K },
        dKdt: 0,
        error: err.message,
      });
    }
  }

  const finalScore = computeObjectiveScore(K);
  const endTime = Date.now();

  // Compute dimension engagement
  const dimensionEngagement = {};
  Object.keys(DIMENSION_KEYWORDS).forEach(dim => {
    const managerMsgs = transcript.filter(t => t.role === 'manager');
    let count = 0;
    managerMsgs.forEach(msg => {
      const text = msg.content.toLowerCase();
      DIMENSION_KEYWORDS[dim].forEach(kw => {
        if (text.includes(kw)) count++;
      });
    });
    dimensionEngagement[dim] = count;
  });

  console.log('  [' + id.slice(4, 12) + '] Done. Score: ' + finalScore + ', K: ' +
    Object.entries(K).map(([d, v]) => d.slice(0, 3) + '=' + v.toFixed(2)).join(' '));

  return {
    id,
    skillLevel,
    difficulty,
    numExchanges,
    sessionWeights: weights,
    transcript,
    knowledgeTrajectory,
    finalKnowledgeState: { ...K },
    finalObjectiveScore: finalScore,
    dimensionEngagement,
    metadata: {
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      durationMs: endTime - startTime,
    },
  };
}

module.exports = { simulateConversation, updateKnowledge, computeObjectiveScore };
