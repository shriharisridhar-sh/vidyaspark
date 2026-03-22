'use strict';

/**
 * ANNOTATION AGENT — COACH Model Transcript Annotation
 *
 * Calls Claude to generate per-exchange annotations on a completed
 * negotiation transcript, identifying missed signals, alternative
 * questions, strength moments, and K(t) impact.
 */

const Anthropic = require('@anthropic-ai/sdk');
const { buildAnnotationPrompt } = require('../prompts/annotationPrompts');

const client = new Anthropic();

/**
 * Generate annotations for a completed session transcript.
 *
 * @param {Object} sessionData - Session object with transcript, knowledgeHistory, etc.
 * @returns {Array} Array of annotation objects, one per exchange
 */
async function generateAnnotations(sessionData) {
  const systemPrompt = buildAnnotationPrompt(sessionData);

  try {
    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: 'Generate the per-exchange annotations for this transcript. Return only the JSON array.',
        },
      ],
    });

    const text = response.content[0]?.text || '';

    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch (parseErr) {
      // Try to extract JSON array from text
      const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      console.error('[AnnotationAgent] JSON parse error:', parseErr.message);
      return buildFallbackAnnotations(sessionData);
    }
  } catch (err) {
    console.error('[AnnotationAgent] Error:', err.message);
    return buildFallbackAnnotations(sessionData);
  }
}

/**
 * Build fallback annotations when AI generation fails.
 */
function buildFallbackAnnotations(sessionData) {
  const { transcript = [] } = sessionData;
  const exchangeCount = Math.ceil(transcript.filter(t => t.role === 'manager').length);

  const annotations = [];
  for (let i = 0; i < exchangeCount; i++) {
    annotations.push({
      exchangeIndex: i,
      missedSignals: ['Analysis pending — try refreshing annotations'],
      whatYouCouldHaveAsked: 'Consider asking about what matters most beyond pricing',
      strengthMoment: null,
      hiddenSignals: ['The customer\'s true priorities (reliability 35%, HSE 28%) are hidden behind the price complaint'],
      kDelta: 'Unable to compute',
      coachingNote: null,
    });
  }
  return annotations;
}

module.exports = { generateAnnotations };
