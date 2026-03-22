'use strict';

/**
 * ANNOTATION PROMPTS — COACH Model Transcript Analysis
 *
 * Generates per-exchange annotations that reveal:
 *   - Missed signals: what the customer hinted at that H1 didn't pick up
 *   - Alternative questions: what H1 could have asked to advance K(t)
 *   - Strength moments: good moves that advanced understanding
 *   - Hidden signals: what F-data was available but not leveraged
 *   - K(t) delta: how knowledge changed at each exchange
 */

const { CONTEXT_FUNCTION, ASSESSMENT_WEIGHTS, BEHAVIORAL_RUBRIC } = require('./systemPrompts');

function buildAnnotationPrompt(sessionData) {
  const {
    transcript = [],
    knowledgeHistory = [],
    coachingInterventions = [],
    config = {},
  } = sessionData;

  // Format the transcript for the annotation agent
  const formattedTranscript = transcript.map((entry, i) => {
    const role = entry.role === 'manager' ? 'H1 (Manager)' : 'Customer (Agent)';
    return `[${role}] [Exchange ${entry.exchangeNumber || Math.floor(i/2)}]: ${entry.content}`;
  }).join('\n\n');

  // Format K(t) trajectory
  const kTrajectory = knowledgeHistory.map(h =>
    `Exchange ${h.exchange}: reliability=${(h.K.reliability||0).toFixed(2)}, hse=${(h.K.hse||0).toFixed(2)}, technical=${(h.K.technical||0).toFixed(2)}, service=${(h.K.service||0).toFixed(2)}, price=${(h.K.price||0).toFixed(2)}, dK/dt=${(h.dKdt||0).toFixed(3)}`
  ).join('\n');

  // Format coaching interventions
  const formattedCoaching = coachingInterventions.length > 0
    ? coachingInterventions.map(ci =>
        `[Exchange ${ci.exchangeNumber || '?'}, ${ci.source || 'ai'} coach, A(t)=${(ci.coachingIntensity||0.3).toFixed(2)}]: ${ci.content}`
      ).join('\n\n')
    : 'No coaching interventions (baseline condition)';

  return `You are an expert negotiation analyst reviewing a completed simulation transcript.
Your task is to annotate each exchange pair (manager message + customer response) with
insights that help the learner understand what they missed and what they did well.

SCENARIO CONTEXT:
This is a Halliburton B2B pricing simulation. The customer (VP of Operations) is
considering switching to Baker Hughes who offered 12% lower pricing.

HIDDEN TRUTH (F) — the answer the learner was trying to discover:
Importance Weights: Reliability 35%, HSE 28%, Technical Support 18%, Service Response 12%, Pricing 7%
Halliburton Performance: Reliability 91, HSE 88, Technical 85, Service 79, Pricing 58
Baker Hughes Performance: Reliability 74, HSE 79, Technical 71, Service 68, Pricing 82

KEY INSIGHT: Halliburton leads by 17 points on the #1 dimension (reliability).
Price is the loudest complaint but only 7% of actual decision weight.

COACHING TYPE: ${config.coachType || 'none'}
DIFFICULTY: ${config.difficulty || 'medium'}

KNOWLEDGE TRAJECTORY K(t):
${kTrajectory || 'No trajectory data'}

COACHING INTERVENTIONS:
${formattedCoaching}

FULL TRANSCRIPT:
${formattedTranscript}

NOVICE vs. EXPERT BEHAVIORAL RUBRIC (use this to calibrate your annotations):

NOVICE behaviors (what weak performers do):
- Accept price complaint at face value, jump to "how do we match the 12%?"
- Focus on a single dimension (price), ignore reliability, HSE, technical
- Compare competitors only on price, assume lower price = better value
- Negotiate tactically: offer discounts, bundles, concessions

EXPERT behaviors (what strong performers do):
- Ask WHO is complaining, distinguish stated vs. real concerns
- Systematically probe each dimension, ask customer to RANK priorities
- Map importance x performance across competitors, find strategic advantage
- Reframe the conversation: switching to Baker Hughes is a reliability RISK

When annotating missed signals, reference which EXPERT behavior the learner failed to exhibit.
When noting strengths, reference which EXPERT behavior was demonstrated.

ANNOTATION TASK:
For each manager-customer exchange pair, generate an annotation object.
Group by exchange number (each exchange = one manager turn + one customer response).

Return a JSON array of annotation objects, one per exchange:
[
  {
    "exchangeIndex": 0,
    "missedSignals": [
      "Brief description of a signal the customer gave that H1 didn't follow up on"
    ],
    "whatYouCouldHaveAsked": "A specific, concrete alternative question H1 could have asked to advance understanding",
    "strengthMoment": "What H1 did well in this exchange (null if nothing notable)",
    "hiddenSignals": [
      "What hidden truth (F) data was hinted at or available but not leveraged"
    ],
    "kDelta": "Brief description of how K(t) changed: e.g. '+reliability' or 'no change'",
    "coachingNote": "If coaching happened at this exchange, note its impact (null if no coaching)"
  }
]

ANNOTATION GUIDELINES:
- Be specific and actionable, not vague
- Reference actual customer words when identifying missed signals
- Suggest concrete alternative questions, not generic advice
- Strength moments should cite specific good moves
- Keep each field to 1-2 sentences max
- If the manager asked about price early on, note this is a common but suboptimal starting point
- If the manager discovered non-price dimensions, highlight this as a strength
- For hiddenSignals, connect customer responses to specific F-data points
- kDelta should reference which dimensions moved and direction

Return ONLY valid JSON. No markdown, no extra text.`;
}

module.exports = { buildAnnotationPrompt };
