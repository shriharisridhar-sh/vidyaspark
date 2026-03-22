'use strict';

/**
 * REPORT PROMPTS — COACH Model Outcome Functions
 *
 * Implements the outcome measurement from the COACH model:
 *   Y  = objective simulation score (system-computed from K(T))
 *   Y-hat = perceived outcome (learner's self-assessment)
 *
 * Principle alignment:
 *   LP-4: Reflection Before Revelation
 *   LP-5: Framework as Retrospective Lens
 *   LP-6: Aspirational Close
 */

const { SCENARIO_DATA, ASSESSMENT_WEIGHTS, CONTEXT_FUNCTION, BEHAVIORAL_RUBRIC } = require('./systemPrompts');

function buildReportPrompt(coachModelState = {}, scenarioWeights = null) {
  const {
    knowledgeState = {},
    knowledgeHistory = [],
    coachingIntensity = 0.3,
    learningVelocity = 0,
    dimensionEngagement = {},
  } = coachModelState;

  // Build dynamic weight info for the report
  const DIM_NAMES = {
    reliability: 'Reliability / Uptime', hse: 'HSE Compliance',
    technical: 'Technical Support Quality', service: 'Service Response Time', price: 'Pricing',
  };
  let weightsInfo = 'Default: Reliability 35%, HSE 28%, Technical 18%, Service 12%, Price 7%';
  if (scenarioWeights && scenarioWeights.weights) {
    const w = scenarioWeights.weights;
    const sorted = Object.entries(w).sort((a, b) => b[1] - a[1]);
    weightsInfo = 'SESSION-SPECIFIC WEIGHTS (randomized for this session):\n' +
      sorted.map(([dim, pct]) => '  ' + (DIM_NAMES[dim] || dim) + ': ' + pct + '%').join('\n');
  }

  // Format K(t) trajectory for the report agent
  const kTrajectory = knowledgeHistory.length > 0
    ? knowledgeHistory.map(h => `Exchange ${h.exchange}: reliability=${(h.K.reliability||0).toFixed(2)}, hse=${(h.K.hse||0).toFixed(2)}, price=${(h.K.price||0).toFixed(2)}`).join('\n')
    : 'No trajectory data available';

  const { loadModule } = require('../modules/ModuleRegistry');
  const mod = loadModule(coachModelState.moduleId || 'abl-p7-force-pressure');
  const scenarioDesc = mod ? `${mod.name}: ${mod.description}` : 'a Halliburton pricing challenge';
  const roleName = mod?.roles?.H1?.label || 'sales professional';
  const counterpartName = mod?.customerPersona?.name || 'the customer';

  return `You are writing a diagnostic report for a senior executive who just
completed a business decision simulation about ${scenarioDesc}.
Your role is that of a respected executive coach — direct, evidence-based, constructive.

This simulation is built on the COACH model (Coaching-Optimized Adaptive Capability
Enhancement), which tracks how the learner discovers the hidden truth structure (F)
through interaction with the customer.

You will receive:
- The participant's initial choice (match price, hold price, or alternative)
- The full negotiation transcript (H1 vs. Agent)
- Coaching interventions (H2 — with source: AI or human coach)
- The hidden scenario data: importance weights (F) and performance grades
- Session configuration (difficulty delta, coaching cadence)
- COACH model learning trajectory: K(t) across exchanges

SCENARIO WEIGHTS:\n${weightsInfo}\n\nCOACH MODEL STATE:\nLearning trajectory K(t):
${kTrajectory}
Final coaching intensity A(T): ${coachingIntensity.toFixed(2)}
Final learning velocity dK/dt: ${learningVelocity.toFixed(3)}

REPORT STRUCTURE — return as JSON:

1. "yourPosition" (string):
   What the participant chose and their core reasoning in 2-3 sentences.
   Use their own words where possible. This captures their initial mental model.

2. "keyInsight" (string):
   The single most important insight: the operator's satisfaction is driven by
   reliability (35%) and HSE (28%), not pricing (7%). Halliburton leads on what
   matters most. Frame as what a structured analytical framework reveals.
   This is the HIDDEN TRUTH (F) being disclosed (LP-5: Framework as Retrospective Lens).

3. "conceptScores" (array of 3 objects):
   For each concept, provide:
   {
     "concept": "Information Asymmetry" | "Dimension Prioritization" | "Competitive Mapping",
     "score": 1-10,
     "evidence": "direct quote from their conversation",
     "feedback": "1-2 sentences: what they did well or what a stronger answer looks like"
   }

   SCORING RUBRIC (maps to assessment weights omega):

   Information Asymmetry (weight: ${ASSESSMENT_WEIGHTS.informationAsymmetry}) — Score 1-10:
   KPI: ${BEHAVIORAL_RUBRIC.informationAsymmetry.kpiQuestion}
   1-3 (NOVICE — ${BEHAVIORAL_RUBRIC.informationAsymmetry.novice.label}): Took the price complaint at face value, no questioning of source. ${BEHAVIORAL_RUBRIC.informationAsymmetry.novice.behaviors[0]}.
   4-6 (DEVELOPING — ${BEHAVIORAL_RUBRIC.informationAsymmetry.developing.label}): Questioned whether price is the real issue, or who is complaining. ${BEHAVIORAL_RUBRIC.informationAsymmetry.developing.behaviors[2]}.
   7-10 (EXPERT — ${BEHAVIORAL_RUBRIC.informationAsymmetry.expert.label}): Explicitly distinguished between what is loudest vs. what drives satisfaction. ${BEHAVIORAL_RUBRIC.informationAsymmetry.expert.behaviors[3]}.

   Dimension Prioritization (weight: ${ASSESSMENT_WEIGHTS.dimensionPrioritization}) — Score 1-10:
   KPI: ${BEHAVIORAL_RUBRIC.dimensionPrioritization.kpiQuestion}
   1-3 (NOVICE — ${BEHAVIORAL_RUBRIC.dimensionPrioritization.novice.label}): Focused on a single dimension (usually price). ${BEHAVIORAL_RUBRIC.dimensionPrioritization.novice.behaviors[0]}.
   4-6 (DEVELOPING — ${BEHAVIORAL_RUBRIC.dimensionPrioritization.developing.label}): Acknowledged multiple dimensions but could not prioritize. ${BEHAVIORAL_RUBRIC.dimensionPrioritization.developing.behaviors[3]}.
   7-10 (EXPERT — ${BEHAVIORAL_RUBRIC.dimensionPrioritization.expert.label}): Attempted to rank or weight dimensions. ${BEHAVIORAL_RUBRIC.dimensionPrioritization.expert.behaviors[2]}.

   Competitive Mapping (weight: ${ASSESSMENT_WEIGHTS.competitiveMapping}) — Score 1-10:
   KPI: ${BEHAVIORAL_RUBRIC.competitiveMapping.kpiQuestion}
   1-3 (NOVICE — ${BEHAVIORAL_RUBRIC.competitiveMapping.novice.label}): No competitor comparison beyond price. ${BEHAVIORAL_RUBRIC.competitiveMapping.novice.behaviors[2]}.
   4-6 (DEVELOPING — ${BEHAVIORAL_RUBRIC.competitiveMapping.developing.label}): Compared competitors on 1-2 non-price dimensions. ${BEHAVIORAL_RUBRIC.competitiveMapping.developing.behaviors[2]}.
   7-10 (EXPERT — ${BEHAVIORAL_RUBRIC.competitiveMapping.expert.label}): Mapped importance x performance, identified Halliburton advantage. ${BEHAVIORAL_RUBRIC.competitiveMapping.expert.behaviors[1]}.

4. "overallScore" (number):
   Weighted average as percentage (0-100).
   Y = (Information Asymmetry * 0.35 + Dimension Prioritization * 0.35 + Competitive Mapping * 0.30) * 10

5. "strengthsAndGrowth" (object):
   {
     "strengths": ["1-2 specific things they did well, with evidence"],
     "areasForGrowth": ["1-2 specific gaps, framed constructively"]
   }

6. "peerDiscussion" (array of 2-3 strings):
   Questions for class debrief. Must create demand for deeper learning (LP-6).

7. "coachingImpact" (object — ONLY if coaching interventions were present):
   {
     "totalInterventions": number,
     "pivotMoments": ["Moments where coaching visibly shifted the manager approach"],
     "effectivenessScore": 0-100,
     "coachingQuality": "Assessment of coaching quality",
     "conceptProgression": "How did concept understanding evolve across exchanges?"
   }

8. "negotiationEffectiveness" (object):
   {
     "customerEngagement": "How well did H1 engage the Agent?",
     "valueArticulation": "How effectively did H1 articulate non-price value?",
     "priceHandling": "How did H1 handle the price objection?",
     "strategicThinking": "Did H1 think strategically about dimensions?"
   }

9. "frameworkTeaching" (object — ALWAYS include, this is the LP-5 moment):
   Reveal frameworks as retrospective lenses on H1's own experience.
   {
     "informationAsymmetry": "Explain the gap between observable signals (price) and hidden drivers (reliability, HSE).",
     "valueEquation": "Explain weighted satisfaction: Reliability 35%, HSE 28%, Technical 18%, Service 12%, Price 7%.",
     "competitiveMapping": "Show Halliburton leads on high-importance dimensions by 17 points."
   }

10. "expertiseProfile" (object — classify the learner on the novice-expert spectrum):
    {
      "overallLevel": "novice" | "developing" | "expert",
      "conceptLevels": {
        "informationAsymmetry": "novice" | "developing" | "expert",
        "dimensionPrioritization": "novice" | "developing" | "expert",
        "competitiveMapping": "novice" | "developing" | "expert"
      },
      "noviceBehaviorsObserved": ["specific novice behaviors you saw in the transcript"],
      "expertBehaviorsObserved": ["specific expert behaviors you saw in the transcript"],
      "developmentPriority": "The single most impactful shift from novice to expert behavior this learner should focus on"
    }

11. "learningTrajectory" (object — captures K(t) in narrative form):
    {
      "startingPoint": "Where was H1 understanding at the beginning?",
      "discoveryMoments": ["Key moments where K(t) jumped"],
      "endingPoint": "Where did H1 understanding end up?",
      "deltaK": "Total learning gain"
    }

TONE: Peer coach, not professor. Direct, not harsh. Evidence-based.
Make the learner feel: "I wish I had known this framework before the negotiation" (LP-6).

Return ONLY valid JSON. No markdown, no extra text.`;
}

// Backward-compatible static prompt
const EXTENDED_REPORT_PROMPT = buildReportPrompt();



/**
 * buildCalibrationGap — Compute Ŷ vs Y calibration gap (Feature 7)
 *
 * Compares the learner's self-assessment (Ŷ) with the COACH model's
 * objective score (Y) to measure metacognitive calibration.
 *
 * @param {Object} session - The session object with postSurvey and knowledgeState
 * @param {number} objectiveScore - Y from computeObjectiveScore()
 * @returns {Object|null} calibrationGap data for ReportScreen, or null if no postSurvey
 */
function buildCalibrationGap(session, objectiveScore) {
  if (!session || !session.postSurvey || session.perceivedScore == null) {
    return null;
  }

  const K = session.knowledgeState || {};
  const survey = session.postSurvey;

  // Compute per-concept objective scores from K(t) — mirrors computeObjectiveScore()
  const asymmetryK = Math.min(Math.max(Math.max(K.reliability || 0, K.hse || 0) - (K.price || 0) * 0.3, 0), 1);
  const prioritizationK = Math.min(((K.reliability || 0) + (K.hse || 0) + (K.technical || 0) + (K.service || 0)) / 4, 1);
  const competitiveK = Math.min((((K.reliability || 0) + (K.hse || 0)) / 2), prioritizationK);

  // Scale to percentage (0-100) for display
  const concepts = [
    {
      name: 'Information Asymmetry',
      perceived: Math.round((survey.informationAsymmetry || 5) * 10),
      actual: Math.round(asymmetryK * 100),
    },
    {
      name: 'Dimension Prioritization',
      perceived: Math.round((survey.dimensionPrioritization || 5) * 10),
      actual: Math.round(prioritizationK * 100),
    },
    {
      name: 'Competitive Mapping',
      perceived: Math.round((survey.competitiveMapping || 5) * 10),
      actual: Math.round(competitiveK * 100),
    },
  ];

  const perceivedScore = session.perceivedScore;
  const gap = perceivedScore - objectiveScore;
  const absGap = Math.abs(gap);

  // Generate interpretation
  let interpretation;
  if (absGap < 10) {
    interpretation = 'Your self-assessment closely matches the objective COACH model score. This strong metacognitive calibration suggests you have good awareness of your negotiation capabilities — a hallmark of experienced decision-makers.';
  } else if (gap > 0) {
    // Overconfident
    if (absGap < 25) {
      interpretation = 'You rated your performance somewhat higher than the objective analysis indicates. This mild overconfidence is common and represents an opportunity: focusing on the specific concept gaps below can sharpen your self-awareness and actual performance simultaneously.';
    } else {
      interpretation = 'There is a significant gap between your self-assessment and the objective score, suggesting overconfidence in your current approach. The concept-level breakdown below reveals where your mental model diverges most from the structured analysis — these are your highest-leverage areas for growth.';
    }
  } else {
    // Underconfident
    if (absGap < 25) {
      interpretation = 'You rated yourself slightly lower than the objective analysis shows. This modest underconfidence suggests you may be undervaluing some of the good instincts you demonstrated during the negotiation. Review the concept scores to see where you performed better than you thought.';
    } else {
      interpretation = 'You significantly underestimated your performance. The objective analysis shows you discovered more of the hidden value structure than you realized. This pattern often indicates strong intuitive negotiation skills that would benefit from being made more explicit through structured frameworks.';
    }
  }

  return {
    perceivedScore,
    objectiveScore,
    gap,
    concepts,
    interpretation,
  };
}

module.exports = { EXTENDED_REPORT_PROMPT, buildReportPrompt, buildCalibrationGap };