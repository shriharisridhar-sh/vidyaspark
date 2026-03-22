'use strict';

/**
 * SCENARIO DESIGN AGENT — Socratic AI for building custom scenarios.
 *
 * Uses SSE streaming to provide a real-time conversational experience
 * as the professor designs a new simulation scenario.
 */

const Anthropic = require('@anthropic-ai/sdk');
const { buildScenarioDesignPrompt } = require('../prompts/scenarioDesignPrompts');

const client = new Anthropic();

/**
 * Stream a design conversation response.
 *
 * @param {Array} conversationHistory - Previous messages
 * @param {Object} res - Express response object (SSE)
 */
async function streamDesignResponse(conversationHistory, res) {
  const systemPrompt = buildScenarioDesignPrompt();

  try {
    const stream = await client.messages.stream({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      system: systemPrompt,
      messages: conversationHistory.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    let fullResponse = '';

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.text) {
        const token = event.delta.text;
        fullResponse += token;
        res.write('data: ' + JSON.stringify({ type: 'token', text: token }) + '\n\n');
      }
    }

    // Check if the response contains a JSON scenario
    const jsonMatch = fullResponse.match(/\`\`\`json\s*([\s\S]*?)\`\`\`/);
    if (jsonMatch) {
      try {
        const scenario = JSON.parse(jsonMatch[1]);
        res.write('data: ' + JSON.stringify({ type: 'scenario', data: scenario }) + '\n\n');
      } catch (e) {
        // JSON parse failed — not a complete scenario yet
      }
    }

    res.write('data: ' + JSON.stringify({ type: 'done' }) + '\n\n');
    res.end();
  } catch (err) {
    console.error('[ScenarioDesignAgent] Error:', err.message);
    res.write('data: ' + JSON.stringify({ type: 'error', message: err.message }) + '\n\n');
    res.end();
  }
}

module.exports = { streamDesignResponse };
