'use strict';

/**
 * COACH AGENT — Adaptive AI Coaching with K(t) and A(t)
 *
 * Implements the H2 (AI oversight) role from the COACH model:
 *   - Receives current K(t) knowledge state and A(t) intensity
 *   - Generates coaching calibrated to learner's trajectory
 *   - Returns knowledge assessment for K(t) refinement
 *   - Coaching intensity adapts via the adaptation dynamic
 */

const Anthropic = require('@anthropic-ai/sdk');
const { buildCoachPrompt } = require('../prompts/coachPrompts');

const client = new Anthropic();


async function generateCoaching(transcript, initialChoice, exchangeNumber, config = {}) {
  const {
    knowledgeState = {},
    coachingIntensity = 0.3,
    learningVelocity = 0,
  } = config;

  const moduleId = config?.moduleId || null;

  // Build adaptive prompt with current COACH model state
  const systemPrompt = buildCoachPrompt({
    knowledgeState,
    coachingIntensity,
    exchangeNumber,
    learningVelocity,
  }, moduleId);

  // Format transcript for the coaching context
  const messages = transcript.map(entry => ({
    role: entry.role === 'manager' ? 'user' : 'assistant',
    content: entry.content,
  }));

  // Add context about the learner's initial choice
  const contextMessage = `CONTEXT: The manager initially chose to "${initialChoice?.choice || 'unknown'}".
Their reasoning: "${initialChoice?.reasoning || 'not provided'}"
This is exchange #${exchangeNumber}.

Based on the conversation above, provide your coaching guidance.`;

  try {
    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 600,
      system: systemPrompt,
      messages: [
        ...messages,
        { role: 'user', content: contextMessage },
      ],
    });

    const text = response.content[0]?.text || '';

    // Parse JSON response
    try {
      const parsed = JSON.parse(text);
      return {
        coaching: parsed.coaching || 'Continue exploring the customer\'s priorities.',
        focus: parsed.focus || 'general',
        confidence: parsed.confidence || 0.5,
        knowledgeAssessment: parsed.knowledgeAssessment || null,
      };
    } catch (parseErr) {
      // Fallback: extract coaching text from non-JSON response
      const coachingMatch = text.match(/"coaching"\s*:\s*"([^"]+)"/);
      return {
        coaching: coachingMatch ? coachingMatch[1] : text.slice(0, 500),
        focus: 'general',
        confidence: 0.5,
        knowledgeAssessment: null,
      };
    }
  } catch (err) {
    console.error('Coach agent error:', err.message);
    return {
      coaching: 'Focus on understanding what the customer truly values beyond price.',
      focus: 'general',
      confidence: 0.3,
      knowledgeAssessment: null,
    };
  }
}


module.exports = { generateCoaching };
