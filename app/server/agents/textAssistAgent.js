'use strict';

/**
 * TEXT ASSIST AGENT — Polishes Manager's Rough Input
 *
 * Takes bullet points/key ideas and generates a natural negotiation message.
 * Non-streaming (fast, single response). Uses Haiku for speed.
 */

const Anthropic = require('@anthropic-ai/sdk');
const { buildTextAssistPrompt } = require('../prompts/textAssistPrompts');

const client = new Anthropic();

/**
 * Polish the manager's rough input into a natural message
 *
 * @param {Object} options
 * @param {string} options.rawInput - Manager's bullet points / rough text
 * @param {Array} options.conversationHistory - Full history [{role, content}]
 * @param {number} options.exchangeNumber - Current exchange number
 * @param {string[]} [options.coachingHints] - Latest coaching suggestions
 * @param {string} [options.difficulty] - Session difficulty level
 * @returns {Promise<{polished: string, preservedIntent: boolean}>}
 */
async function polishMessage({
  rawInput,
  conversationHistory = [],
  exchangeNumber = 1,
  coachingHints = [],
  difficulty = 'medium',
}) {
  const systemPrompt = buildTextAssistPrompt(conversationHistory, exchangeNumber, coachingHints);

  const response = await client.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 300,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Polish the following key points/notes into a natural negotiation message:\n\n${rawInput}`,
    }],
  });

  const polished = response.content[0].text.trim();

  return {
    polished,
    preservedIntent: true, // Could add intent verification later
  };
}

module.exports = { polishMessage };
