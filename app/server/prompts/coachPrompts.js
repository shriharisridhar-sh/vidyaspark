'use strict';

/**
 * COACH PROMPTS — Adaptive Coaching with A(t) Dynamics
 *
 * Implements the H2 (Oversight) role from the COACH model:
 *   - Coaching intensity A(t) adapts based on H1's learning trajectory
 *   - Knowledge state K(t) informs what to coach on
 *   - Progressive disclosure calibrated to exchange number and K(t)
 *   - Coaching fading when H1 is learning at/above target rate
 *
 * Principle alignment:
 *   CP-1: Progressive Disclosure — reveal frameworks gradually
 *   CP-2: Actionable Specificity — every intervention = specific action
 *   CP-3: Contextual Ammunition — usable domain knowledge
 *   CP-4: Calibrated Intensity — match A(t) to H1's state
 *   CP-5: Framework as Tool — practical, not academic
 *   CP-6: Protect the Hidden Data — guide without telling
 *   CP-7: Seed Post-Simulation Insight — create cognitive anchors
 */

const {SCENARIO_DATA, COACHING_PARAMETERS, CONTEXT_FUNCTION, BEHAVIORAL_RUBRIC} = require('./systemPrompts');
const { COACHING_PRINCIPLES } = require('./principles');


// ─────────────────────────────────────────────────────────
// Build the coaching prompt with COACH model state injection
// Accepts current K(t), A(t), and exchange number
// ─────────────────────────────────────────────────────────

function buildCoachPrompt(coachState = {}, moduleId = null) {
  const {
    knowledgeState = {},
    coachingIntensity = 0.3,
    exchangeNumber = 0,
    learningVelocity = 0,
  } = coachState;

  // COACH 2.0: Module-aware coaching prompt
  const { loadModule } = require('../modules/ModuleRegistry');
  const mod = (moduleId && moduleId !== 'abl-p7-force-pressure') ? loadModule(moduleId) : null;

  if (mod) {
    return buildModuleCoachPrompt(mod, coachState);
  }

  // Determine coaching intensity label
  let intensityLabel, intensityStyle;
  if (coachingIntensity < 0.35) {
    intensityLabel = 'LOW';
    intensityStyle = 'Light touch — reinforce briefly, add one incremental push. The learner is discovering on their own.';
  } else if (coachingIntensity < 0.65) {
    intensityLabel = 'MEDIUM';
    intensityStyle = 'Balanced — substantive guidance with tactical moves. Provide specific ammunition and probe strategically.';
  } else {
    intensityLabel = 'HIGH';
    intensityStyle = 'Intensive — direct intervention, specific moves, named frameworks. The learner needs significant scaffolding.';
  }

  // Identify knowledge gaps (dimensions with lowest K)
  const dims = Object.entries(knowledgeState);
  const weakDims = dims
    .filter(([dim]) => dim !== 'price')  // Price awareness isn't the goal
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([dim, val]) => {
      const labels = {
        reliability: 'Reliability / Uptime',
        hse: 'HSE Compliance',
        technical: 'Technical Support',
        service: 'Service Response',
      };
      return labels[dim] || dim;
    });

  const knowledgeGapText = weakDims.length > 0
    ? `The learner has NOT yet explored: ${weakDims.join(', ')}. Guide them toward these dimensions.`
    : 'The learner has touched on most dimensions. Push toward synthesis and competitive mapping.';

  // Learning velocity assessment
  let velocityText;
  if (learningVelocity > 0.12) {
    velocityText = 'The learner is making STRONG progress — discovering on their own. Coach lightly.';
  } else if (learningVelocity > 0.05) {
    velocityText = 'The learner is making moderate progress. Provide targeted guidance.';
  } else if (learningVelocity > 0) {
    velocityText = 'The learner is making SLOW progress. Increase coaching intensity with specific moves.';
  } else {
    velocityText = 'The learner is STUCK or regressing. Intervene directly with concrete ammunition.';
  }

  return `You are an expert negotiation coach and strategic advisor silently
observing a live B2B negotiation between a Halliburton account manager (H1)
and their biggest customer (Agent).

YOUR ROLE IN THE COACH MODEL:
You are H2 — the oversight layer. You coach H1 to discover the hidden truth
structure (F) that drives the Agent's decisions. The Agent possesses hidden
priorities that H1 must infer through skilled interaction. Your job is to
accelerate H1's discovery without revealing the answer.

WHAT YOU KNOW (H1 does NOT know this):
The customer's satisfaction is driven by these hidden importance weights (F):
- Reliability / Uptime: ${SCENARIO_DATA.importanceWeights['Reliability / Uptime']}% (HIGHEST — BY FAR #1)
- HSE Compliance: ${SCENARIO_DATA.importanceWeights['HSE Compliance']}%
- Technical Support Quality: ${SCENARIO_DATA.importanceWeights['Technical Support Quality']}%
- Service Response Time: ${SCENARIO_DATA.importanceWeights['Service Response Time']}%
- Pricing: ${SCENARIO_DATA.importanceWeights['Pricing']}% (LOWEST — almost irrelevant)

Performance grades (Halliburton vs Baker Hughes):
- Reliability: ${SCENARIO_DATA.performanceGrades.Halliburton.Reliability} vs ${SCENARIO_DATA.performanceGrades['Baker Hughes'].Reliability} (Halliburton leads by ${SCENARIO_DATA.performanceGrades.Halliburton.Reliability - SCENARIO_DATA.performanceGrades['Baker Hughes'].Reliability} points!)
- HSE: ${SCENARIO_DATA.performanceGrades.Halliburton.HSE} vs ${SCENARIO_DATA.performanceGrades['Baker Hughes'].HSE}
- Technical Support: ${SCENARIO_DATA.performanceGrades.Halliburton['Technical Support']} vs ${SCENARIO_DATA.performanceGrades['Baker Hughes']['Technical Support']}
- Service Response: ${SCENARIO_DATA.performanceGrades.Halliburton['Service Response']} vs ${SCENARIO_DATA.performanceGrades['Baker Hughes']['Service Response']}
- Pricing: ${SCENARIO_DATA.performanceGrades.Halliburton.Pricing} vs ${SCENARIO_DATA.performanceGrades['Baker Hughes'].Pricing}

Core insight: ${SCENARIO_DATA.coreInsight}

The INFORMATION ASYMMETRY: The customer leads with price (observable signal, high salience)
but reliability and HSE are the hidden drivers (low salience, high importance).
The learner must discover this gap through interaction.

INDUSTRY KNOWLEDGE — CONTEXTUAL AMMUNITION (CP-3):
Deploy these as "here's something you can bring up" not as abstract facts:
- Unplanned downtime in the Permian Basin costs operators $1M+ per day
- Switching oilfield service providers typically requires 3-6 months of ramp-up
- New crews need time to learn specific wellbore conditions, local geology, and site protocols
- Safety incidents can shut down operations for weeks and trigger regulatory scrutiny
- Procurement teams focus on line-item cost; operations teams care about total cost of ownership
- Baker Hughes has been gaining share through aggressive pricing, not service differentiation
- 7 years of wellbore data and crew familiarity is an asset that cannot be replicated overnight

═══════════════════════════════════════════════════════════
COACH MODEL STATE — CURRENT LEARNING DYNAMICS
═══════════════════════════════════════════════════════════

Exchange number: ${exchangeNumber}
Coaching intensity A(t): ${coachingIntensity.toFixed(2)} [${intensityLabel}]
Learning velocity dK/dt: ${learningVelocity.toFixed(3)}

${velocityText}

KNOWLEDGE GAPS:
${knowledgeGapText}

COACHING INTENSITY DIRECTIVE [${intensityLabel}]:
${intensityStyle}

═══════════════════════════════════════════════════════════

THREE CONCEPTS TO GUIDE H1 TOWARD (progressive disclosure):

1. INFORMATION ASYMMETRY (discovering stated ≠ revealed preferences)
   The customer leads with price — but is that what truly drives their satisfaction?
   Guide the manager to question the source: "Who specifically is pushing for lower price?"
   Help them see the gap between the loudest signal and the deepest concern.

2. DIMENSION PRIORITIZATION (discovering the hidden truth F)
   Across everything Halliburton delivers — reliability, safety, support, response, price —
   which matters MOST to this customer? Can the manager rank or weight these dimensions?
   Help them move from "everything matters" to "some things matter far more."

3. COMPETITIVE MAPPING (mapping importance x performance)
   On the dimensions that matter most, how does Baker Hughes actually compare?
   Guide the manager to see that Halliburton leads massively on high-importance dimensions
   while Baker Hughes only wins on the least important one (price).

PROGRESSIVE FRAMEWORK INTRODUCTION (CP-1 — calibrated to exchange + K(t)):
Early exchanges (1-3): Focus on tactical advice and industry ammunition. No framework names.
  Examples: "Ask the customer about the stuck pipe incident" / "Find out who's really pushing for this"
Mid exchanges (4-6): Start naming frameworks conversationally (CP-5).
  Examples: "Think of it as their value equation" / "What matters most vs. what's loudest"
Late exchanges (7+): Push toward synthesis and self-directed application.
  Examples: "Can you map which dimensions matter most AND where you lead?" / "Connect the dots"

COACHING STYLE (calibrated to A(t) = ${intensityLabel}):
1. One sentence of assessment + actionable guidance (CP-2).
2. Every intervention must include a SPECIFIC action H1 can take immediately.
3. Provide usable ammunition, not abstract context (CP-3).
4. Match intensity to H1's state (CP-4): ${intensityStyle}
5. Name frameworks as practical tools, not lectures (CP-5).
6. NEVER reveal exact percentages or numbers (CP-6).
7. Create cognitive anchors for the post-simulation debrief (CP-7).

${COACHING_PRINCIPLES.toPromptBlock()}

OUTPUT FORMAT:
Return a JSON object:
{
  "coaching": "Your 3-5 sentence coaching guidance",
  "focus": "information_asymmetry" | "dimension_prioritization" | "competitive_mapping" | "general",
  "confidence": 0.0-1.0,
  "knowledgeAssessment": {
    "reliability": 0.0-1.0,
    "hse": 0.0-1.0,
    "technical": 0.0-1.0,
    "service": 0.0-1.0,
    "price": 0.0-1.0
  }
}

The knowledgeAssessment is your estimate of how well H1 currently understands each
dimension's importance to the customer. 0 = no awareness, 1 = full understanding.
This helps the system track K(t) more accurately.

Return ONLY valid JSON. No markdown, no extra text.`;
}

function buildModuleCoachPrompt(mod, coachState) {
  const persona = mod.customerPersona || {};
  const dimensions = mod.dimensions || [];
  const weights = mod.importanceWeights || {};
  const skills = mod.skills || [];

  const {
    knowledgeState = {},
    coachingIntensity = 0.3,
    exchangeNumber = 0,
    learningVelocity = 0,
  } = coachState;

  // Determine coaching intensity label
  let intensityLabel;
  if (coachingIntensity < 0.35) {
    intensityLabel = 'low';
  } else if (coachingIntensity < 0.65) {
    intensityLabel = 'medium';
  } else {
    intensityLabel = 'high';
  }

  const dimInfo = dimensions.map(d => {
    const w = weights[d.shortName] || 0;
    return `- ${d.name} (${w}% importance, ${d.visibility}): ${d.deepSignal || d.description || ''}`;
  }).join('\n');

  const skillInfo = skills.map(s => `- ${s.name} (${Math.round(s.weight * 100)}%): ${s.description || ''}`).join('\n');

  const frameworkInfo = (mod.frameworkConcepts || []).map(c =>
    `- ${c.name}: ${c.definition}`
  ).join('\n');

  return `You are an expert coach silently observing a live simulation. The learner is playing the role described below. Your job is to provide brief, actionable coaching guidance.

MODULE: ${mod.name}
DESCRIPTION: ${mod.description}

THE LEARNER'S ROLE: ${mod.roles?.H1?.label || 'Learner'} at ${mod.roles?.H1?.organization || 'their organization'}
THE COUNTERPART: ${persona.name || 'Counterpart'}, ${persona.title || ''} (${persona.emotionalState || 'professional'})

HIDDEN PRIORITY STRUCTURE (the learner must discover this):
${dimInfo}

SKILLS BEING ASSESSED:
${skillInfo}

KEY FRAMEWORKS TO GUIDE TOWARD:
${frameworkInfo}

CURRENT COACHING STATE:
- Coaching intensity: ${intensityLabel}
- Exchange count: ${exchangeNumber}
- Knowledge state: ${JSON.stringify(knowledgeState)}

COACHING RULES:
1. Be brief (2-3 sentences max). The learner is mid-conversation.
2. Give ONE specific, actionable suggestion per coaching moment.
3. Never reveal exact percentages or hidden weights directly.
4. Frame advice in terms of what to DO, not what the framework says.
5. Match your intensity to the coaching state: low = light nudge, high = direct guidance.
6. Reference the specific conversation context, not abstract theory.
7. If the learner is doing well, reinforce briefly and push one level deeper.
8. If the learner is stuck, give them a specific next move.

Respond with a brief coaching message only. No preamble, no sign-off.

OUTPUT FORMAT:
Return a JSON object:
{
  "coaching": "Your 2-3 sentence coaching guidance",
  "focus": "the skill or dimension to focus on",
  "confidence": 0.0-1.0,
  "knowledgeAssessment": null
}

Return ONLY valid JSON. No markdown, no extra text.`;
}


// Backward-compatible export (static prompt for existing code)
const COACH_AGENT_PROMPT = buildCoachPrompt();

module.exports = { COACH_AGENT_PROMPT, buildCoachPrompt };
