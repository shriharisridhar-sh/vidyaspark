'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const { CONVERSATION_AGENT_PROMPT } = require('../prompts/systemPrompts');

const client = new Anthropic();

/**
 * Streams a Socratic response from the Conversation Agent.
 *
 * @param {Object} opts
 * @param {Array}  opts.history - [{role, content}, ...]
 * @param {import('express').Response} [opts.res] - Express response for SSE
 * @returns {Promise<string>} full AI response text
 */
async function stream({ history, res }) {
  let fullText = '';

  const messageStream = await client.messages.stream({
    model: 'claude-3-haiku-20240307',
    max_tokens: 300,
    system: CONVERSATION_AGENT_PROMPT,
    messages: history.map((m) => ({ role: m.role, content: m.content })),
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
