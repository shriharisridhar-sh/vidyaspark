'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const { buildCustomerPrompt } = require('../prompts/customerPrompts');

const client = new Anthropic();

/**
 * Streams a response from the Customer Agent (plays the B2B customer).
 *
 * Uses the same SSE streaming pattern as the original conversationAgent.
 *
 * @param {Object} opts
 * @param {Array}  opts.history    - [{role, content}, ...]
 * @param {string} opts.difficulty - 'easy' | 'medium' | 'hard'
 * @param {import('express').Response} [opts.res] - Express response for SSE
 * @returns {Promise<string>} full AI response text
 */
async function stream({ history, difficulty = 'medium', sessionWeights = null, evidenceContext = null, mindsetState = 0.15, moduleId = null, res }) {
  let systemPrompt = buildCustomerPrompt(difficulty, sessionWeights, moduleId);

  // Inject current mindset state into the system prompt (module-generic labels)
  const mindsetLabel = mindsetState < 0.3 ? 'guarded and skeptical'
    : mindsetState < 0.5 ? 'beginning to open up'
    : mindsetState < 0.7 ? 'engaged and responsive'
    : 'genuinely receptive';
  systemPrompt += '\n\nYOUR CURRENT STATE: You are currently ' + mindsetLabel + '. '
    + (mindsetState < 0.3
      ? 'You are holding your initial position firmly. The other person needs to demonstrate real understanding to shift your perspective.'
      : mindsetState < 0.5
      ? 'You are starting to see that the other person understands your situation. But you are not fully convinced yet.'
      : mindsetState < 0.7
      ? 'The other person is handling this well. You are becoming more open and willing to engage constructively.'
      : 'You feel genuinely heard and respected. You are now ready to engage constructively and move forward.');

  // If evidence/information was presented, add it to the prompt
  if (evidenceContext) {
    systemPrompt += '\n\nINFORMATION JUST SHARED:\n'
      + 'The other person just shared: "' + evidenceContext + '"\n'
      + 'React to this information authentically. Consider whether it addresses your real concerns or is just surface-level.';
  }
  let fullText = '';

  const messageStream = await client.messages.stream({
    model: 'claude-3-haiku-20240307',
    max_tokens: 500,
    system: systemPrompt,
    messages: history.map((m) => ({
      // Map 'manager' -> 'user' and 'customer' -> 'assistant' for the API
      role: m.role === 'assistant' || m.role === 'customer' ? 'assistant' : 'user',
      content: m.content,
    })),
  });

  for await (const event of messageStream) {
    if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
      const token = event.delta.text;
      fullText += token;
      if (res) {
        res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
      }
    }
  }

  return fullText;
}

module.exports = { stream };
