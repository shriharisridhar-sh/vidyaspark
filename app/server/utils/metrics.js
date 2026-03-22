'use strict';

/**
 * METRICS — COACH Model Research Analytics
 *
 * Computes research-grade metrics from session data, aligned with COACH model:
 *   K(t) trajectory estimation from transcript keyword analysis
 *   A(t) coaching effectiveness measurement
 *   Y (objective score) and delta-K (learning gain)
 *   Information signal quality I_j(t)
 *
 * These metrics serve the Calibration Layer — enabling cross-session
 * comparison and AI coaching improvement over time.
 */

const { DIMENSION_KEYWORDS, CONTEXT_FUNCTION, ASSESSMENT_WEIGHTS } = require('../prompts/systemPrompts');


// ─────────────────────────────────────────────────────────
// Core transcript analysis
// ─────────────────────────────────────────────────────────

function analyzeTranscript(transcript) {
  if (!transcript || transcript.length === 0) {
    return {
      totalExchanges: 0,
      managerMessages: 0,
      customerMessages: 0,
      averageManagerLength: 0,
      averageCustomerLength: 0,
    };
  }

  const managerMsgs = transcript.filter(t => t.role === 'manager');
  const customerMsgs = transcript.filter(t => t.role === 'customer');

  return {
    totalExchanges: managerMsgs.length,
    managerMessages: managerMsgs.length,
    customerMessages: customerMsgs.length,
    averageManagerLength: managerMsgs.length > 0
      ? Math.round(managerMsgs.reduce((sum, m) => sum + (m.content || '').length, 0) / managerMsgs.length)
      : 0,
    averageCustomerLength: customerMsgs.length > 0
      ? Math.round(customerMsgs.reduce((sum, m) => sum + (m.content || '').length, 0) / customerMsgs.length)
      : 0,
  };
}


// ─────────────────────────────────────────────────────────
// COACH Model: Dimension engagement analysis
// Estimates K(t) from keyword presence in transcript
// ─────────────────────────────────────────────────────────

function analyzeDimensionEngagement(transcript) {
  const engagement = {
    reliability: { count: 0, exchanges: [], firstMention: null },
    hse:         { count: 0, exchanges: [], firstMention: null },
    technical:   { count: 0, exchanges: [], firstMention: null },
    service:     { count: 0, exchanges: [], firstMention: null },
    price:       { count: 0, exchanges: [], firstMention: null },
  };

  if (!transcript) return engagement;

  // Analyze manager messages only (H1's exploration)
  const managerMsgs = transcript.filter(t => t.role === 'manager');

  managerMsgs.forEach((msg, idx) => {
    const text = (msg.content || '').toLowerCase();

    Object.keys(DIMENSION_KEYWORDS).forEach(dim => {
      const hits = DIMENSION_KEYWORDS[dim].filter(kw => text.includes(kw));
      if (hits.length > 0) {
        engagement[dim].count += hits.length;
        engagement[dim].exchanges.push(idx + 1);
        if (!engagement[dim].firstMention) {
          engagement[dim].firstMention = idx + 1;
        }
      }
    });
  });

  return engagement;
}


// ─────────────────────────────────────────────────────────
// COACH Model: K(t) trajectory estimation
// Reconstructs the knowledge state history from transcript
// ─────────────────────────────────────────────────────────

function estimateKnowledgeTrajectory(transcript) {
  const trajectory = [];
  const K = { reliability: 0.1, hse: 0.1, technical: 0.1, service: 0.1, price: 0.4 };

  if (!transcript) return trajectory;

  // Process exchange pairs (manager + customer)
  const managerMsgs = transcript.filter(t => t.role === 'manager');
  const customerMsgs = transcript.filter(t => t.role === 'customer');

  managerMsgs.forEach((managerMsg, idx) => {
    const customerMsg = customerMsgs[idx] || { content: '' };
    const combinedText = ((managerMsg.content || '') + ' ' + (customerMsg.content || '')).toLowerCase();

    // Update K for each dimension based on keyword engagement
    Object.keys(DIMENSION_KEYWORDS).forEach(dim => {
      const keywords = DIMENSION_KEYWORDS[dim];
      const hits = keywords.filter(kw => combinedText.includes(kw)).length;

      if (hits > 0) {
        const informationSignal = Math.min(hits / keywords.length, 1.0);
        const learningRate = 0.08 * informationSignal;
        const knowledgeGap = 1.0 - K[dim];
        K[dim] += learningRate * knowledgeGap;
        K[dim] = Math.min(K[dim], 1.0);
      }
    });

    trajectory.push({
      exchange: idx + 1,
      K: { ...K },
    });
  });

  return trajectory;
}


// ─────────────────────────────────────────────────────────
// COACH Model: Information signal quality I_j(t)
// Measures the quality of H1's interaction moves
// ─────────────────────────────────────────────────────────

function analyzeInformationSignal(transcript) {
  if (!transcript) return { overallQuality: 0, questionRatio: 0, dimensionBreadth: 0 };

  const managerMsgs = transcript.filter(t => t.role === 'manager');
  if (managerMsgs.length === 0) return { overallQuality: 0, questionRatio: 0, dimensionBreadth: 0 };

  // Question ratio: proportion of manager messages containing questions
  const questionCount = managerMsgs.filter(m =>
    (m.content || '').includes('?')).length;
  const questionRatio = questionCount / managerMsgs.length;

  // Dimension breadth: how many dimensions were explored
  const engagement = analyzeDimensionEngagement(transcript);
  const exploredDims = Object.values(engagement).filter(e => e.count > 0).length;
  const dimensionBreadth = exploredDims / 5;

  // Overall quality: combination of questioning skill and dimension coverage
  const overallQuality = (questionRatio * 0.4 + dimensionBreadth * 0.6);

  return { overallQuality, questionRatio, dimensionBreadth };
}


// ─────────────────────────────────────────────────────────
// COACH Model: Value-Price ratio
// Measures whether H1 shifted from price to value arguments
// ─────────────────────────────────────────────────────────

function computeValuePriceRatio(transcript) {
  if (!transcript || transcript.length === 0) return { ratio: 0, trend: 'unknown' };

  const managerMsgs = transcript.filter(t => t.role === 'manager');
  if (managerMsgs.length === 0) return { ratio: 0, trend: 'unknown' };

  let valueCount = 0;
  let priceCount = 0;

  const valueKeywords = [
    ...DIMENSION_KEYWORDS.reliability,
    ...DIMENSION_KEYWORDS.hse,
    ...DIMENSION_KEYWORDS.technical,
    ...DIMENSION_KEYWORDS.service,
  ];
  const priceKeywords = DIMENSION_KEYWORDS.price;

  managerMsgs.forEach(msg => {
    const text = (msg.content || '').toLowerCase();
    valueKeywords.forEach(kw => { if (text.includes(kw)) valueCount++; });
    priceKeywords.forEach(kw => { if (text.includes(kw)) priceCount++; });
  });

  const total = valueCount + priceCount;
  const ratio = total > 0 ? valueCount / total : 0;

  // Compute trend: did the ratio improve over time?
  const midpoint = Math.floor(managerMsgs.length / 2);
  if (midpoint === 0) return { ratio, trend: 'insufficient_data' };

  let earlyValue = 0, earlyPrice = 0, lateValue = 0, latePrice = 0;
  managerMsgs.forEach((msg, idx) => {
    const text = (msg.content || '').toLowerCase();
    if (idx < midpoint) {
      valueKeywords.forEach(kw => { if (text.includes(kw)) earlyValue++; });
      priceKeywords.forEach(kw => { if (text.includes(kw)) earlyPrice++; });
    } else {
      valueKeywords.forEach(kw => { if (text.includes(kw)) lateValue++; });
      priceKeywords.forEach(kw => { if (text.includes(kw)) latePrice++; });
    }
  });

  const earlyRatio = (earlyValue + earlyPrice) > 0 ? earlyValue / (earlyValue + earlyPrice) : 0;
  const lateRatio = (lateValue + latePrice) > 0 ? lateValue / (lateValue + latePrice) : 0;

  let trend = 'flat';
  if (lateRatio > earlyRatio + 0.15) trend = 'improving';
  else if (lateRatio < earlyRatio - 0.15) trend = 'declining';

  return { ratio: Math.round(ratio * 100) / 100, trend };
}


// ─────────────────────────────────────────────────────────
// COACH Model: Concept progression analysis
// Tracks which concepts H1 engaged with over time
// ─────────────────────────────────────────────────────────

function analyzeConceptProgression(transcript) {
  if (!transcript) return { progression: [], conceptOrder: [] };

  const managerMsgs = transcript.filter(t => t.role === 'manager');
  const progression = [];
  const conceptOrder = [];

  managerMsgs.forEach((msg, idx) => {
    const text = (msg.content || '').toLowerCase();
    const concepts = [];

    // Information asymmetry: questioning who is complaining, source of concern
    if (text.match(/who.*(complain|push|say|told|driving|behind)/) ||
        text.match(/(real|actual|true).*(issue|concern|driver|priority)/)) {
      concepts.push('information_asymmetry');
    }

    // Dimension prioritization: ranking, weighting, comparing priorities
    if (text.match(/(most important|matter.*most|priori|rank|weight|compared to|versus|more than)/) ||
        text.match(/(reliab|safety|hse).*(more|greater|bigger|import)/)) {
      concepts.push('dimension_prioritization');
    }

    // Competitive mapping: comparing across competitors on specific dimensions
    if (text.match(/(baker|competitor|switch|compare|versus|against).*(reliab|safety|support|perform)/) ||
        text.match(/(reliab|safety|support).*(baker|competitor|switch)/)) {
      concepts.push('competitive_mapping');
    }

    progression.push({
      exchange: idx + 1,
      concepts,
    });

    concepts.forEach(c => {
      if (!conceptOrder.includes(c)) conceptOrder.push(c);
    });
  });

  return { progression, conceptOrder };
}


// ─────────────────────────────────────────────────────────
// COACH Model: Coaching effectiveness metrics
// Measures how well coaching interventions drove learning
// ─────────────────────────────────────────────────────────

function analyzeCoachingEffectiveness(coachingInterventions, transcript) {
  if (!coachingInterventions || coachingInterventions.length === 0) {
    return { density: 0, pivotMoments: 0, topicShifts: 0 };
  }

  const density = transcript && transcript.length > 0
    ? coachingInterventions.length / transcript.filter(t => t.role === 'manager').length
    : 0;

  // Count topic shifts: manager changes topic after coaching
  let topicShifts = 0;
  const managerMsgs = (transcript || []).filter(t => t.role === 'manager');

  coachingInterventions.forEach(intervention => {
    const afterExchange = intervention.exchangeNumber || 0;
    const beforeMsg = managerMsgs[afterExchange - 1];
    const afterMsg = managerMsgs[afterExchange];

    if (beforeMsg && afterMsg) {
      const beforeText = (beforeMsg.content || '').toLowerCase();
      const afterText = (afterMsg.content || '').toLowerCase();

      // Check if the manager shifted from price to value dimensions
      const beforePrice = DIMENSION_KEYWORDS.price.some(kw => beforeText.includes(kw));
      const afterValue = [...DIMENSION_KEYWORDS.reliability, ...DIMENSION_KEYWORDS.hse]
        .some(kw => afterText.includes(kw));

      if (beforePrice && afterValue) topicShifts++;
    }
  });

  return {
    density: Math.round(density * 100) / 100,
    totalInterventions: coachingInterventions.length,
    topicShifts,
    estimatedPivotRate: coachingInterventions.length > 0
      ? Math.round((topicShifts / coachingInterventions.length) * 100)
      : 0,
  };
}


// ─────────────────────────────────────────────────────────
// Compute full COACH model research metrics
// ─────────────────────────────────────────────────────────

function computeSessionMetrics(sessionData) {
  const {
    transcript = [],
    coachingInterventions = [],
    knowledgeState = {},
    knowledgeHistory = [],
    intensityHistory = [],
    dimensionEngagement = {},
    config = {},
  } = sessionData;

  // COACH 2.0: Include skill metrics if available
  const skillMetrics = computeSkillMetrics(sessionData);

  return {
    // Basic transcript stats
    transcript: analyzeTranscript(transcript),

    // COACH Model: Dimension engagement
    dimensionEngagement: analyzeDimensionEngagement(transcript),

    // COACH Model: K(t) trajectory
    knowledgeTrajectory: knowledgeHistory.length > 0
      ? knowledgeHistory
      : estimateKnowledgeTrajectory(transcript),

    // COACH Model: Information signal quality
    informationSignal: analyzeInformationSignal(transcript),

    // COACH Model: Value-price ratio
    valuePriceRatio: computeValuePriceRatio(transcript),

    // COACH Model: Concept progression
    conceptProgression: analyzeConceptProgression(transcript),

    // COACH Model: Coaching effectiveness
    coachingEffectiveness: analyzeCoachingEffectiveness(coachingInterventions, transcript),

    // COACH 2.0: Skill-based metrics
    skillMetrics: skillMetrics,

    // COACH Model: Final state
    finalState: {
      knowledgeState: knowledgeState,
      coachingIntensity: intensityHistory.length > 0
        ? intensityHistory[intensityHistory.length - 1].A
        : 0.3,
      totalExchanges: transcript.filter(t => t.role === 'manager').length,
      difficulty: config.difficulty || 'medium',
      coachType: config.coachType || 'none',
      cadence: config.cadence || 'between_rounds',
    },
  };
}




// ─────────────────────────────────────────────────────────
// COACH 2.0: Skill-based metrics (Gamma-driven)
// Computes metrics from LLM-judged skill scores
// ─────────────────────────────────────────────────────────

function computeSkillMetrics(sessionData) {
  const {
    skillScores = {},
    skillHistory = [],
    gammaSkills = [],
    archetype = null,
  } = sessionData;

  if (!gammaSkills || !gammaSkills.length) {
    return { available: false };
  }

  // Per-skill analysis
  const skillAnalysis = gammaSkills.map(skill => {
    const finalScore = skillScores[skill.id] || 0;

    // Compute trajectory from history
    const trajectory = skillHistory.map(snap => ({
      exchange: snap.exchange,
      score: (snap.scores && snap.scores[skill.id]) || 0,
    }));

    // Compute improvement rate
    const firstScore = trajectory.length > 0 ? trajectory[0].score : 0;
    const improvement = finalScore - firstScore;

    return {
      id: skill.id,
      name: skill.name,
      weight: skill.weight,
      finalScore,
      trajectory,
      improvement,
      level: finalScore >= 66 ? 'expert' : finalScore >= 31 ? 'developing' : 'novice',
    };
  });

  // Composite score
  let compositeScore = 0;
  gammaSkills.forEach(skill => {
    compositeScore += skill.weight * (skillScores[skill.id] || 0);
  });

  // Skill balance: standard deviation of skill scores
  const scores = gammaSkills.map(s => skillScores[s.id] || 0);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  const balance = Math.round(100 - Math.sqrt(variance));

  return {
    available: true,
    compositeScore: Math.round(compositeScore),
    archetype,
    skillAnalysis,
    balance,
    totalExchangesJudged: skillHistory.length,
  };
}

module.exports = {
  analyzeTranscript,
  analyzeDimensionEngagement,
  estimateKnowledgeTrajectory,
  analyzeInformationSignal,
  computeValuePriceRatio,
  analyzeConceptProgression,
  analyzeCoachingEffectiveness,
  computeSessionMetrics,
  computeSkillMetrics,
};
