'use strict';

const { loadModule } = require('../modules/ModuleRegistry');

/**
 * SYSTEM PROMPTS — COACH Model Foundation
 *
 * This module defines the scenario data using COACH model notation:
 *   Γ (Context Function) = { D, F, H, δ, J }
 *   θ (Agent Primitives)  = { disclosure resistance, warmth, pressure, reward sensitivity }
 *   α (H1 Primitives)     = { measured via pre-survey }
 *   ω (Assessment Weights) = { per-dimension scoring weights }
 *
 * The COACH model is role-agnostic:
 *   H1 = The Learner (e.g., Ignator teaching an ABL module)
 *   Agent = The Counterpart (e.g., AI student in the classroom)
 *   H2 = The Oversight (e.g., mentor — human or AI)
 *
 * Current instantiation: VidyaSpark interactive teaching simulation
 */


// ─────────────────────────────────────────────────────────
// CONTEXT FUNCTION Γ — generated via God Mode, static during simulation
// For the legacy scenario, this is the instantiation of the abstract Γ.
// ─────────────────────────────────────────────────────────

const CONTEXT_FUNCTION = {
  // D: Conceptual dimensions the learner must discover
  dimensions: [
    {
      id: 'D1', name: 'Reliability / Uptime', shortName: 'reliability',
      visibility: 'hidden', weight: 0.35,
      surfaceSignal: 'Mentions "uptime" or "downtime" casually when asked',
      deepSignal: 'Gets visibly engaged, shares the stuck pipe incident story, reveals NPT anxiety',
    },
    {
      id: 'D2', name: 'HSE Compliance', shortName: 'hse',
      visibility: 'hidden', weight: 0.28,
      surfaceSignal: 'Acknowledges safety matters if asked directly',
      deepSignal: 'Shows genuine fear of regulatory exposure, mentions safety record as a source of pride',
    },
    {
      id: 'D3', name: 'Technical Support Quality', shortName: 'technical',
      visibility: 'obvious', weight: 0.18,
      surfaceSignal: 'Mentions needing good technical support for complex wells',
      deepSignal: 'Credits Halliburton team by name, talks about wellbore-specific knowledge',
    },
    {
      id: 'D4', name: 'Service Response Time', shortName: 'service',
      visibility: 'obvious', weight: 0.12,
      surfaceSignal: 'Notes that fast service is expected from any provider',
      deepSignal: 'Recalls specific instances where Halliburton response time saved a job',
    },
    {
      id: 'D5', name: 'Pricing', shortName: 'price',
      visibility: 'decoy', weight: 0.07,
      surfaceSignal: 'Leads with this — "12% is real money" — talks about it loudly and often',
      deepSignal: 'When pressed, admits price alone wouldn\'t drive the decision if other concerns are addressed',
    },
  ],

  // J: Number of conceptual dimensions
  J: 5,

  // F: Hidden truth structure — the "answer" H1 must infer through interaction
  // In this scenario: importance weights that drive the customer's decisions
  hiddenTruth: {
    importanceWeights: {
      'Reliability / Uptime': 35,
      'HSE Compliance': 28,
      'Technical Support Quality': 18,
      'Service Response Time': 12,
      'Pricing': 7,
    },
    performanceGrades: {
      Halliburton:    { Reliability: 91, HSE: 88, 'Technical Support': 85, 'Service Response': 79, Pricing: 58 },
      'Baker Hughes': { Reliability: 74, HSE: 79, 'Technical Support': 71, 'Service Response': 68, Pricing: 82 },
    },
  },

  // H: Information architecture — what is observable vs. hidden
  // This defines the gap between stated and revealed preferences (CU-2)
  informationArchitecture: {
    observableSignals: ['Pricing complaint', 'Baker Hughes 12% offer', 'Procurement pressure'],
    hiddenDrivers: ['Reliability importance', 'HSE anxiety', 'Switching risk awareness'],
    asymmetryType: 'stated_vs_revealed_preferences',
    description: 'The customer leads with price (high salience, low importance) while reliability and safety (low salience, high importance) are the true decision drivers.',
  },

  // Scenario narrative
  narrative: {
    context: `You are coaching a senior Halliburton account manager in the Permian Basin.
Their biggest customer — a major operator worth $40M annually — just told them
that Baker Hughes has offered a 12% lower price. The contract renewal meeting
is in two weeks.`,
    coreInsight: `Halliburton leads Baker Hughes by 17 points on the #1 dimension (reliability, 35% weight). Pricing is high salience but only 7% importance. A price cut is unnecessary and potentially harmful.`,
    relationship: '7-year customer relationship, $40M annual contract',
    trigger: 'Baker Hughes unsolicited 12% price cut offer',
    timeline: 'Contract renewal in 2 weeks',
  },

  // VP's opening line — the customer starts the conversation
  openingLine: `Look, I'll be straight with you. We've been partners for seven years now, and I value that. But I've got a proposal from Baker Hughes sitting on my desk — 12% below your current rates. My CFO has seen the numbers, and procurement is pushing hard. I called this meeting because I want to hear your side before this goes any further. So help me out — why should I stick with you?`,

  // Mission briefing for the learner (shown before negotiation)
  briefingMission: {
    headline: 'Your Mission',
    text: `The VP of Operations is focused on price. Your job isn't to defend your pricing — it's to discover what they actually care about beyond cost. Ask questions. Listen for what's unsaid. The things they don't mention might matter most.`,
    thingsToTry: [
      'Ask about their biggest operational risks — what keeps them up at night?',
      'Find out what "switching providers" would actually mean for their team on the ground',
      'Listen for emotional signals — when do they get engaged, tense, or relieved?',
    ],
  },

  // Suggested response starters (shown as clickable chips in negotiation UI)
  suggestedStarters: [
    'I appreciate you being direct. Before I respond to the pricing, can I ask — what concerns you most about making a change?',
    'That\'s a fair point about the numbers. Help me understand — beyond pricing, what\'s working well in our current arrangement?',
    'I hear you on the 12%. Before we get into that, what would a worst-case scenario look like if the transition didn\'t go smoothly?',
  ],

  // Role assignments for this scenario
  roles: {
    H1: { label: 'Account Manager', organization: 'Halliburton', description: 'Senior account manager in the Permian Basin' },
    Agent: { label: 'VP of Operations', organization: 'Major Operator', description: 'Customer, 20+ years in upstream oil & gas' },
    H2: { label: 'Coach', organization: 'System', description: 'Negotiation coach (human or AI)' },
  },
};


// ─────────────────────────────────────────────────────────
// AGENT PRIMITIVES θ — set via God Mode, static during simulation
// These define the Agent's interactive personality.
// ─────────────────────────────────────────────────────────

const AGENT_PRIMITIVES = {
  // θ₁: Disclosure resistance — how easily Agent reveals hidden truth F
  //   Higher = harder for H1 to extract information
  //   Mapped to difficulty levels: easy=0.2, medium=0.5, hard=0.8
  disclosureResistance: { easy: 0.2, medium: 0.5, hard: 0.8 },

  // θ₂: Relational warmth — emotional responsiveness to H1's approach
  //   Higher = more rewarding of relationship-building behavior
  warmth: { easy: 0.8, medium: 0.6, hard: 0.4 },

  // θ₃: External pressure intensity — how strongly context constraints are communicated
  //   Higher = more urgency and stakeholder pressure conveyed
  pressureIntensity: { easy: 0.3, medium: 0.5, hard: 0.8 },

  // θ₄: Reward sensitivity — how much Agent opens up to good interaction moves
  //   Higher = stronger virtuous cycle (good questions → more disclosure)
  rewardSensitivity: { easy: 0.9, medium: 0.7, hard: 0.5 },
};


// ─────────────────────────────────────────────────────────
// COACHING PARAMETERS — govern the adaptation dynamic A(t)
// ─────────────────────────────────────────────────────────

const COACHING_PARAMETERS = {
  // A_max: Maximum coaching intensity (ceiling)
  maxIntensity: 1.0,

  // A_0: Base coaching level at simulation start
  baseIntensity: 0.3,

  // φ: Adaptation speed — how fast coaching adjusts to H1's trajectory
  adaptationSpeed: 0.15,

  // r̄: Target learning rate — expected knowledge gain per exchange
  targetLearningRate: 0.12,

  // Coaching intensity labels for prompt injection
  intensityLabels: {
    low:    { range: [0.0, 0.35], style: 'Light touch — reinforce briefly, add one incremental push' },
    medium: { range: [0.35, 0.65], style: 'Balanced — substantive guidance with tactical moves' },
    high:   { range: [0.65, 1.0],  style: 'Intensive — direct intervention, specific moves, named frameworks' },
  },
};


// ─────────────────────────────────────────────────────────
// ASSESSMENT WEIGHTS ω — for computing objective outcome Y
// ─────────────────────────────────────────────────────────

const ASSESSMENT_WEIGHTS = {
  // Concept mastery assessment — how much each concept contributes to Y
  informationAsymmetry: 0.35,      // Did H1 discover the gap between stated vs. real drivers?
  dimensionPrioritization: 0.35,   // Did H1 identify and weight the dimensions correctly?
  competitiveMapping: 0.30,        // Did H1 map importance x performance across competitors?
};


// ─────────────────────────────────────────────────────────
// BACKWARD-COMPATIBLE SCENARIO_DATA
// Preserves the interface used by existing customerPrompts.js, coachPrompts.js, etc.
// Other modules import SCENARIO_DATA.importanceWeights, SCENARIO_DATA.performanceGrades, etc.
// ─────────────────────────────────────────────────────────

const SCENARIO_DATA = {
  context: CONTEXT_FUNCTION.narrative.context,
  importanceWeights: CONTEXT_FUNCTION.hiddenTruth.importanceWeights,
  performanceGrades: CONTEXT_FUNCTION.hiddenTruth.performanceGrades,
  coreInsight: CONTEXT_FUNCTION.narrative.coreInsight,
};


// ─────────────────────────────────────────────────────────
// CONVERSATION AGENT PROMPT (legacy Socratic mode)
// ─────────────────────────────────────────────────────────

const CONVERSATION_AGENT_PROMPT = `You are a sharp, experienced business advisor running a confidential
decision simulation for a senior Halliburton executive. Your role is to
challenge their thinking through Socratic questions — never to teach.

SCENARIO CONTEXT:
${CONTEXT_FUNCTION.narrative.context}

HIDDEN DATA (use this to guide your questioning — NEVER reveal these numbers):
Importance Weights: Reliability/Uptime 35%, HSE Compliance 28%, Technical Support 18%, Service Response 12%, Pricing 7%.
Halliburton Performance: Reliability 91, HSE 88, Technical Support 85, Service Response 79, Pricing 58.
Baker Hughes Performance: Reliability 74, HSE 79, Technical Support 71, Service Response 68, Pricing 82.

YOUR CORE RULES:
1. Ask exactly ONE question per response. Never two.
2. Keep responses to 1-2 sentences of context, then the question.
3. Never explain, correct, lecture, validate, or teach during the conversation.
4. Never mention importance weights, regression, Customer Value Equation,
   Importance-Performance Matrix, or any academic framework by name.
5. Never reveal the hidden data numbers.

THREE CONCEPTS TO PROBE (in natural order, following the participant's lead):

1. INFORMATION ASYMMETRY
   Is the price complaint the real driver of this operator's satisfaction?
   Who specifically is complaining — procurement, the drilling engineer, VP Ops?
   Is the loudest voice the most important one?

2. DIMENSION PRIORITIZATION (hidden truth discovery)
   Across everything Halliburton delivers — reliability, safety, support,
   response time, price — which matters MOST to this customer?
   Can they prioritize and weight dimensions, or do they treat everything equally?

3. COMPETITIVE MAPPING
   On the dimensions that matter most, how does Baker Hughes actually compare?
   Can they map both how important a dimension is AND how each company performs?
   Where is Halliburton's real competitive advantage?

PROBING STRATEGY:
- Start by exploring their initial reaction to the pricing threat
- If they focus on price, probe: "Who told you price is the issue?"
- If they mention multiple factors, probe: "Which matters most to this operator?"
- If they compare competitors, probe: "On the things that matter most, who actually leads?"
- If they're stuck, try: "What would the drilling engineer say about switching to Baker Hughes?"

TONE:
- Respected peer, not a professor
- Genuinely curious, slightly provocative
- Short, conversational responses
- The executive should feel like talking to the smartest colleague they know

OPENING:
When the conversation starts, you will receive the participant's initial choice
and reasoning. Ask your first probing question based on what they said.

NEVER:
- Give away the answer or importance weights
- Tell them they're wrong
- Answer your own question
- Ask compound questions
- Sound like an AI assistant or chatbot`;


// ─────────────────────────────────────────────────────────
// REPORT AGENT PROMPT (legacy — used when no coaching present)
// ─────────────────────────────────────────────────────────

const REPORT_AGENT_PROMPT = `You are writing a diagnostic report for a senior executive who just
completed a business decision simulation about a Halliburton pricing
challenge. Your role is that of a respected executive coach — direct,
evidence-based, constructive.

You will receive:
- The participant's initial choice (match price, hold price, or alternative)
- The full conversation transcript
- The hidden scenario data (importance weights and performance grades)
- A rubric of 3 concepts to evaluate

REPORT STRUCTURE — return as JSON:

1. "yourPosition" (string): What the participant chose and their core reasoning
   in 2-3 sentences. Use their own words where possible.

2. "keyInsight" (string): The single most important insight from this scenario.
   State it plainly: the operator's satisfaction is driven by reliability (35%)
   and HSE (28%), not pricing (7%). Halliburton leads on what matters most.
   Frame this as what a structured analytical framework would reveal — do NOT
   name the framework.

3. "conceptScores" (array of 3 objects):
   For each concept, provide:
   {
     "concept": "Information Asymmetry" | "Dimension Prioritization" | "Competitive Mapping",
     "score": 1-10,
     "evidence": "direct quote from their conversation",
     "feedback": "1-2 sentences: what they did well or what a stronger answer looks like"
   }

   SCORING RUBRIC:

   Information Asymmetry (1-10):
   1-3: Took the price complaint at face value, no questioning of source
   4-6: Questioned whether price is the real issue, or who is complaining
   7-10: Explicitly distinguished between what's loudest vs. what drives satisfaction

   Dimension Prioritization (1-10):
   1-3: Focused on a single dimension (usually price) without considering others
   4-6: Acknowledged multiple dimensions exist but couldn't prioritize them
   7-10: Attempted to rank or weight dimensions by relative impact

   Competitive Mapping (1-10):
   1-3: No competitor comparison beyond price, or only looked at price gap
   4-6: Compared competitors on 1-2 non-price dimensions
   7-10: Mapped both importance and performance across competitors, identified
         where Halliburton leads on high-importance dimensions

4. "overallScore" (number): Weighted average as percentage (0-100).
   Weights: Information Asymmetry 35%, Dimension Prioritization 35%, Competitive Mapping 30%.

5. "strengthsAndGrowth" (object):
   {
     "strengths": ["1-2 specific things they did well, with evidence"],
     "areasForGrowth": ["1-2 specific gaps, framed constructively"]
   }

6. "peerDiscussion" (array of 2-3 strings):
   Questions designed for class debrief. Example:
   "Did you and your partner identify the same stakeholder as most influential?"

TONE: Peer coach, not professor. Direct, not harsh. Evidence-based.

Return ONLY valid JSON matching this structure. No markdown, no extra text.`;


// ─────────────────────────────────────────────────────────
// KNOWLEDGE STATE INITIALIZATION
// K(0) = initial knowledge state for each dimension
// Used by SessionStore to initialize tracking
// ─────────────────────────────────────────────────────────

function initializeKnowledgeState() {
  // Discovery Model: d_j(0) ∈ {0, 0.5, 1.0}
  // 0 = not touched, 0.5 = surface awareness, 1.0 = deep understanding
  // Decoy dimensions start at 0.5 (learner is aware of them from the surface)
  // Hidden dimensions start at 0
  // Obvious dimensions start at 0
  const K = {};
  CONTEXT_FUNCTION.dimensions.forEach(d => {
    if (d.visibility === 'decoy') {
      K[d.shortName] = 0.5; // Decoy is salient from the start
    } else {
      K[d.shortName] = 0;   // Must be discovered through interaction
    }
  });
  return K;
}


// ─────────────────────────────────────────────────────────
// DIMENSION KEYWORDS — for estimating K(t) from transcript analysis
// Maps conceptual dimensions to keywords that indicate H1 engagement
// ─────────────────────────────────────────────────────────

const DIMENSION_KEYWORDS = {
  reliability: ['reliab', 'uptime', 'downtime', 'npt', 'non-productive', 'shut', 'stuck pipe', 'failure', 'outage', 'running', 'operational'],
  hse:         ['safety', 'hse', 'incident', 'compliance', 'regulat', 'environmental', 'health', 'injury', 'osha', 'audit'],
  technical:   ['technical', 'support', 'engineer', 'expertise', 'wellbore', 'bha', 'drill', 'geology', 'complex well'],
  service:     ['response', 'service time', 'speed', 'quick', 'fast', 'turnaround', 'mobiliz'],
  price:       ['price', 'cost', 'discount', 'cheaper', '12%', 'premium', 'budget', 'savings', 'expensive'],
};



// ─────────────────────────────────────────────────────────
// BEHAVIORAL RUBRIC — Novice vs. Expert Archetypes
// Maps K(t) = 0 (novice) to K(t) = 1 (expert) behavioral markers
// Used by report, annotation, and coaching agents as KPI anchors
// ─────────────────────────────────────────────────────────

const BEHAVIORAL_RUBRIC = {
  informationAsymmetry: {
    concept: 'Information Asymmetry',
    weight: 0.35,
    kpiQuestion: 'Did the learner discover that the stated concern (price) differs from the real satisfaction driver?',
    novice: {
      label: 'Surface-Level Acceptance',
      behaviors: [
        'Accepts the price complaint at face value',
        'Immediately asks "how do we match the 12%?"',
        'Treats the procurement team as the sole decision-maker',
        'Does not question who is actually complaining or why',
      ],
      kRange: [0.0, 0.3],
    },
    developing: {
      label: 'Emerging Awareness',
      behaviors: [
        'Questions whether price is the only issue',
        'Asks who is making the switching decision',
        'Begins to distinguish between what is loudest and what matters',
        'Recognizes there might be other factors but cannot name them',
      ],
      kRange: [0.3, 0.6],
    },
    expert: {
      label: 'Strategic Diagnosis',
      behaviors: [
        'Explicitly distinguishes stated concerns from revealed preferences',
        'Asks the VP directly: "Beyond price, what keeps you up at night?"',
        'Maps stakeholder interests (procurement vs. drilling engineer vs. VP Ops)',
        'Identifies that price is high-salience but low-importance',
      ],
      kRange: [0.6, 1.0],
    },
  },
  dimensionPrioritization: {
    concept: 'Dimension Prioritization',
    weight: 0.35,
    kpiQuestion: 'Did the learner identify and weight the dimensions that drive customer satisfaction?',
    novice: {
      label: 'Single-Dimension Focus',
      behaviors: [
        'Focuses exclusively on price as the competitive battleground',
        'Treats all service dimensions as equally important or ignores them',
        'Cannot articulate what reliability, HSE, or technical support mean to this customer',
        'Negotiates tactically: discounts, bundles, concessions',
      ],
      kRange: [0.0, 0.3],
    },
    developing: {
      label: 'Multi-Dimension Awareness',
      behaviors: [
        'Acknowledges that factors beyond price exist',
        'Mentions reliability or safety but does not prioritize',
        'Asks about service quality in general terms',
        'Begins to explore what matters most but cannot rank dimensions',
      ],
      kRange: [0.3, 0.6],
    },
    expert: {
      label: 'Weighted Priority Discovery',
      behaviors: [
        'Systematically probes each dimension of the customer relationship',
        'Asks the customer to rank or compare what matters most',
        'Discovers that reliability (35%) and HSE (28%) dwarf price (7%)',
        'Uses the customer\'s own language to build a weighted picture',
      ],
      kRange: [0.6, 1.0],
    },
  },
  competitiveMapping: {
    concept: 'Competitive Mapping',
    weight: 0.30,
    kpiQuestion: 'Did the learner map importance x performance across competitors to find strategic advantage?',
    novice: {
      label: 'Price-Only Comparison',
      behaviors: [
        'Compares only on price: Baker Hughes is 12% cheaper',
        'No analysis of non-price competitive advantages',
        'Assumes lower price = better value proposition',
        'Defensive posture: focuses on justifying Halliburton premium',
      ],
      kRange: [0.0, 0.3],
    },
    developing: {
      label: 'Partial Competitive Analysis',
      behaviors: [
        'Compares competitors on 1-2 non-price dimensions',
        'Mentions Halliburton reliability advantage in general terms',
        'Begins to frame value beyond price but lacks specificity',
        'Recognizes switching costs but cannot quantify advantage',
      ],
      kRange: [0.3, 0.6],
    },
    expert: {
      label: 'Importance-Performance Mapping',
      behaviors: [
        'Maps both importance and performance for each competitor',
        'Discovers Halliburton leads by 17 points on the #1 dimension (reliability)',
        'Recognizes Baker Hughes only wins on the least important dimension (price, 7%)',
        'Reframes the conversation: switching to Baker Hughes is a reliability risk',
      ],
      kRange: [0.6, 1.0],
    },
  },
};

// ─────────────────────────────────────────────────────────
// RANDOM WEIGHT GENERATION — Semi-random within constraints
// Each session gets unique weights for replayability.
// Price is always the decoy, but non-price dimensions shuffle.
// ─────────────────────────────────────────────────────────

function generateRandomWeights(moduleId) {
  // Try loading module config for dimension-aware weight generation
  const mod = loadModule(moduleId);
  if (mod && mod.dimensions && mod.dimensions.length > 0 && moduleId !== 'abl-p7-force-pressure') {
    return generateModuleWeights(mod);
  }

  // Legacy Price Trap weight generation
  const priceWeight = Math.floor(Math.random() * 8) + 5; // 5-12%
  const nonPriceDims = ['reliability', 'hse', 'technical', 'service'];

  // Fisher-Yates shuffle
  for (let i = nonPriceDims.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nonPriceDims[i], nonPriceDims[j]] = [nonPriceDims[j], nonPriceDims[i]];
  }

  const remaining = 100 - priceWeight;
  const bands = [
    { min: 28, max: 40 }, { min: 18, max: 30 },
    { min: 10, max: 22 }, { min: 8, max: 16 },
  ];

  let weights = bands.map(b => Math.floor(Math.random() * (b.max - b.min + 1)) + b.min);
  const rawSum = weights.reduce((a, b) => a + b, 0);
  weights = weights.map(w => Math.round((w / rawSum) * remaining));
  weights[0] += remaining - weights.reduce((a, b) => a + b, 0);

  const result = { price: priceWeight };
  nonPriceDims.forEach((dim, i) => { result[dim] = weights[i]; });

  const dimensionOrder = [...nonPriceDims].sort((a, b) => result[b] - result[a]);
  dimensionOrder.push('price');

  const visibility = { price: 'decoy' };
  dimensionOrder.forEach((dim, i) => {
    if (dim === 'price') return;
    visibility[dim] = i < 2 ? 'hidden' : 'obvious';
  });

  return { weights: result, dimensionOrder, visibility, topDimension: dimensionOrder[0], secondDimension: dimensionOrder[1] };
}

function generateModuleWeights(mod) {
  const dims = mod.dimensions;
  // Use module's base weights with slight randomization (+/- 5 points)
  const baseWeights = {};
  dims.forEach(d => {
    const base = Math.round((d.weight || (1 / dims.length)) * 100);
    const jitter = Math.floor(Math.random() * 11) - 5; // -5 to +5
    baseWeights[d.shortName] = Math.max(5, base + jitter);
  });

  // Normalize to 100
  const total = Object.values(baseWeights).reduce((a, b) => a + b, 0);
  const result = {};
  const shortNames = Object.keys(baseWeights);
  shortNames.forEach(k => { result[k] = Math.round((baseWeights[k] / total) * 100); });
  // Fix rounding: adjust first dimension
  const rTotal = Object.values(result).reduce((a, b) => a + b, 0);
  if (rTotal !== 100) result[shortNames[0]] += 100 - rTotal;

  // Sort by weight descending
  const dimensionOrder = shortNames.sort((a, b) => result[b] - result[a]);

  // Assign visibility from module config or default pattern
  const visibility = {};
  dims.forEach(d => {
    visibility[d.shortName] = d.visibility || 'obvious';
  });

  return {
    weights: result,
    dimensionOrder,
    visibility,
    topDimension: dimensionOrder[0],
    secondDimension: dimensionOrder[1],
  };
}




// ─────────────────────────────────────────────────────────
// SCENARIO LOADER — Load Gamma from JSON files
// Reads from app/server/scenarios/*.json
// ─────────────────────────────────────────────────────────

function loadScenario(scenarioId) {
  const scenarioPath = require('path').join(__dirname, '..', 'scenarios', scenarioId + '.json');
  try {
    const raw = require('fs').readFileSync(scenarioPath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[loadScenario] Failed to load scenario "' + scenarioId + '":', e.message);
    return null;
  }
}

// Default scenario alias (backward compat)
const DEFAULT_SCENARIO_ID = 'abl-p7-force-pressure';


// ─────────────────────────────────────────────────────────
// MODULE-AWARE CONTEXT FUNCTIONS
// Build context dynamically from module configs
// ─────────────────────────────────────────────────────────

function getContextForModule(moduleId) {
  const mod = loadModule(moduleId || 'abl-p7-force-pressure');
  if (!mod) return CONTEXT_FUNCTION; // fallback to existing hardcoded

  return {
    dimensions: mod.dimensions.map(d => ({
      name: d.name,
      shortName: d.shortName,
      visibility: d.visibility,
      surfaceSignal: d.surfaceSignal || '',
      deepSignal: d.deepSignal || '',
    })),
    importanceWeights: mod.importanceWeights,
    performanceGrades: mod.performanceGrades,
    narrative: mod.narrative || mod.description,
    skills: mod.skills,
  };
}

function getDimensionKeywords(moduleId) {
  const mod = loadModule(moduleId || 'abl-p7-force-pressure');
  if (!mod || !mod.dimensions) return DIMENSION_KEYWORDS; // fallback

  const keywords = {};
  mod.dimensions.forEach(d => {
    if (d.keywords && d.keywords.length > 0) {
      keywords[d.shortName] = d.keywords;
    }
  });
  return keywords;
}

module.exports = {
  loadScenario,
  DEFAULT_SCENARIO_ID,
  CONVERSATION_AGENT_PROMPT,
  REPORT_AGENT_PROMPT,
  SCENARIO_DATA,
  CONTEXT_FUNCTION,
  AGENT_PRIMITIVES,
  COACHING_PARAMETERS,
  ASSESSMENT_WEIGHTS,
  DIMENSION_KEYWORDS,
  initializeKnowledgeState,
  BEHAVIORAL_RUBRIC,
  generateRandomWeights,
  getContextForModule,
  getDimensionKeywords,
};
