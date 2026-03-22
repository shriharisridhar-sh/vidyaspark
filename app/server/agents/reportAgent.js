'use strict';

/**
 * REPORT AGENT — COACH Model Outcome Generation
 *
 * Generates the post-simulation report with COACH model alignment:
 *   Y = objective score from K(T)
 *   Learning trajectory from K(t) history
 *   Framework teaching as retrospective lens (LP-5)
 *   Coaching impact analysis from A(t) trajectory
 */

const Anthropic = require('@anthropic-ai/sdk');
const { REPORT_AGENT_PROMPT, SCENARIO_DATA } = require('../prompts/systemPrompts');
const { buildReportPrompt } = require('../prompts/reportPrompts');

const client = new Anthropic();


async function generateReport(sessionData) {
  const {
    transcript = [],
    coachingInterventions = [],
    initialChoice,
    config = {},
    knowledgeState = {},
    knowledgeHistory = [],
    coachingIntensity = 0.3,
    learningVelocity = 0,
    dimensionEngagement = {},
    scenarioWeights = null,
    weightPrediction = null,
  } = sessionData;

  const moduleId = sessionData.moduleId || 'abl-p7-force-pressure';

  // Build the report prompt with COACH model state injection
  const systemPrompt = buildReportPrompt({
    knowledgeState,
    knowledgeHistory,
    coachingIntensity,
    learningVelocity,
    dimensionEngagement,
    moduleId,
  }, scenarioWeights);

  // Format session context for the report
  const sessionContext = buildSessionContext(
    transcript,
    coachingInterventions,
    initialChoice,
    config,
    moduleId
  );

  try {
    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: sessionContext },
      ],
    });

    const text = response.content[0]?.text || '';

    try {
      return JSON.parse(text);
    } catch (parseErr) {
      // Try to extract JSON from text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      console.error('Report JSON parse error:', parseErr.message);
      return buildFallbackReport(initialChoice, moduleId);
    }
  } catch (err) {
    console.error('Report agent error:', err.message);
    return buildFallbackReport(initialChoice, moduleId);
  }
}


// Legacy support: generate report from conversation history (no session)
async function generateLegacyReport(conversationHistory, initialChoice) {
  try {
    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      system: REPORT_AGENT_PROMPT,
      messages: [
        {
          role: 'user',
          content: `PARTICIPANT'S INITIAL CHOICE: ${initialChoice || 'Not provided'}

CONVERSATION TRANSCRIPT:
${conversationHistory.map(m =>
  `${m.role === 'user' ? 'PARTICIPANT' : 'ADVISOR'}: ${m.content}`
).join('\n\n')}

HIDDEN SCENARIO DATA:
Importance Weights: Reliability 35%, HSE 28%, Technical Support 18%, Service Response 12%, Pricing 7%.
Halliburton Performance: Reliability 91, HSE 88, Technical Support 85, Service Response 79, Pricing 58.
Baker Hughes Performance: Reliability 74, HSE 79, Technical Support 71, Service Response 68, Pricing 82.

Generate the diagnostic report.`,
        },
      ],
    });

    const text = response.content[0]?.text || '';
    try {
      return JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return buildFallbackReport(initialChoice);
    }
  } catch (err) {
    console.error('Legacy report error:', err.message);
    return buildFallbackReport(initialChoice);
  }
}


function buildSessionContext(transcript, coachingInterventions, initialChoice, config, moduleId) {
  const { loadModule } = require('../modules/ModuleRegistry');
  const mod = loadModule(moduleId || 'abl-p7-force-pressure');

  const dimInfo = mod ? mod.dimensions.map(d =>
    `${d.name}: ${mod.importanceWeights[d.shortName] || 0}%`
  ).join(', ') : 'Reliability 35%, HSE 28%, Technical 18%, Service 12%, Pricing 7%';

  let context = `SESSION CONFIGURATION:
- Difficulty (delta): ${config.difficulty || 'medium'}
- Coaching type: ${config.coachType || 'none'}
- Coaching cadence: ${config.cadence || 'between_rounds'}
- Coaching interval: every ${config.coachingInterval || 3} exchanges

PARTICIPANT'S INITIAL CHOICE: ${initialChoice?.choice || 'Not provided'}
PARTICIPANT'S REASONING: ${initialChoice?.reasoning || 'Not provided'}

HIDDEN SCENARIO DATA (the hidden truth F):
Importance Weights: ${dimInfo}.

NEGOTIATION TRANSCRIPT:
`;

  // Add transcript
  transcript.forEach(entry => {
    const roleLabel = entry.role === 'manager' ? 'H1 (MANAGER)' : 'AGENT (CUSTOMER)';
    context += `${roleLabel} [Exchange ${entry.exchangeNumber || '?'}]: ${entry.content}\n\n`;
  });

  // Add coaching interventions if present
  if (coachingInterventions.length > 0) {
    context += `\nCOACHING INTERVENTIONS (H2):\n`;
    coachingInterventions.forEach(ci => {
      const source = ci.source === 'human' ? 'HUMAN COACH' : 'AI COACH';
      context += `[${source}, Exchange ${ci.exchangeNumber || '?'}, A(t)=${(ci.coachingIntensity || 0.3).toFixed(2)}]: ${ci.content}\n\n`;
    });
  }

  context += `\nGenerate the diagnostic report.`;
  return context;
}


function buildFallbackReport(initialChoice, moduleId) {
  const { loadModule } = require('../modules/ModuleRegistry');
  const mod = loadModule(moduleId || 'abl-p7-force-pressure');
  const fallbackInsight = mod ? (mod.narrative?.coreInsight || mod.description) : 'The customer\'s satisfaction is driven primarily by reliability and HSE compliance, not pricing. Halliburton leads on the dimensions that matter most.';

  return {
    yourPosition: `The participant chose: "${initialChoice?.choice || 'unknown'}". ${initialChoice?.reasoning || ''}`,
    keyInsight: fallbackInsight,
    conceptScores: [
      { concept: 'Information Asymmetry', score: 5, evidence: 'Assessment pending', feedback: 'Consider exploring what is behind the price complaint.' },
      { concept: 'Dimension Prioritization', score: 5, evidence: 'Assessment pending', feedback: 'Try to rank and weight the customer\'s priorities.' },
      { concept: 'Competitive Mapping', score: 5, evidence: 'Assessment pending', feedback: 'Map importance and performance across competitors.' },
    ],
    overallScore: 50,
    strengthsAndGrowth: {
      strengths: ['Engaged in the simulation'],
      areasForGrowth: ['Explore beyond the initial price concern'],
    },
    peerDiscussion: ['What did your partner identify as the customer\'s top priority?'],
    negotiationEffectiveness: {
      customerEngagement: 'Assessment pending',
      valueArticulation: 'Assessment pending',
      priceHandling: 'Assessment pending',
      strategicThinking: 'Assessment pending',
    },
    frameworkTeaching: {
      informationAsymmetry: 'The price complaint is an observable signal, but the hidden driver of this customer\'s satisfaction is reliability (35% importance) and HSE compliance (28%).',
      valueEquation: 'Customer satisfaction is a weighted sum: Reliability 35%, HSE 28%, Technical Support 18%, Service Response 12%, Pricing only 7%.',
      competitiveMapping: 'Halliburton leads Baker Hughes by 17 points on reliability — the most important dimension. Baker Hughes only leads on pricing, the least important dimension.',
    },
    learningTrajectory: {
      startingPoint: 'Initial assessment pending',
      discoveryMoments: [],
      endingPoint: 'Final assessment pending',
      deltaK: 'Learning gain assessment pending',
    },
  };
}


module.exports = { generateReport, generateLegacyReport };
