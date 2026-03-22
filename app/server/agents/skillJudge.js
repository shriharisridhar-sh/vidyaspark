'use strict';

/**
 * SKILL JUDGE — LLM-Based Skill Assessment (COACH 2.0)
 *
 * Replaces keyword-based K(t) with LLM-judged skill scores.
 * After each exchange, evaluates the learner's performance against
 * each skill's rubric (defined by Gamma).
 *
 * Two-layer scoring:
 *   Layer 1: LLM judge (Claude Haiku) produces raw scores
 *   Layer 2: Programmatic guardrails enforce hard caps based on
 *            transcript analysis (prevents LLM generosity drift)
 *
 * Returns: { scores: { skillId: 0-100, ... }, reasoning: { skillId: string, ... } }
 */

const Anthropic = require('@anthropic-ai/sdk');
const { loadModule } = require('../modules/ModuleRegistry');
const client = new Anthropic();

// ─── TRANSCRIPT ANALYSIS HELPERS ──────────────────────────────────────

/**
 * Analyze the learner's messages for quality signals.
 * Returns flags that drive programmatic score caps.
 */
function analyzeTranscript(transcript) {
  const managerMessages = transcript.filter(t => t.role === 'manager');
  const evidenceMessages = transcript.filter(t => t.role === 'evidence');
  const customerMessages = transcript.filter(t => t.role === 'customer');

  // Combine all learner text
  const allManagerText = managerMessages.map(m => (m.content || '').trim()).join(' ');
  const allManagerWords = allManagerText.split(/\s+/).filter(w => w.length > 0);
  const avgWordCount = managerMessages.length > 0
    ? allManagerWords.length / managerMessages.length
    : 0;

  // Check for garbage/nonsense indicators
  const nonsensePatterns = [
    /burrito|chipotle|pizza|taco|sandwich|lol|lmao|rofl|haha/i,
    /^(ok|yes|no|sure|yeah|yep|nah|nope|hmm|um|uh)\s*$/i,
  ];
  const nonsenseMessages = managerMessages.filter(m =>
    nonsensePatterns.some(p => p.test((m.content || '').trim()))
  );
  const isGarbage = nonsenseMessages.length >= managerMessages.length * 0.5
    || avgWordCount < 8
    || (managerMessages.length > 0 && allManagerWords.length < 15);

  // Check for price-only conversation
  const priceKeywords = /\b(price|pricing|cost|discount|cheaper|savings|rate|premium|%\s*off|volume\s*commit|unbundl|match.*rate|phased\s*pric)/i;
  const nonPriceKeywords = /\b(reliab|uptime|downtime|npt|non-productive|safety|hse|incident|compliance|regulat|technical\s+support|engineer|service\s+(?:response|time|quality|level)|response\s+time|operational\s+risk|failure|stuck\s*pipe)/i;

  const priceOnlyMessages = managerMessages.filter(m => {
    const text = m.content || '';
    return priceKeywords.test(text) && !nonPriceKeywords.test(text);
  });
  const nonPriceMessages = managerMessages.filter(m => {
    const text = m.content || '';
    return nonPriceKeywords.test(text);
  });

  // Additional price-only check: if ALL messages focus on pricing strategy
  // (discounts, volume deals, rate matching, phased pricing) with zero questions asked
  // about non-price dimensions, this is price-only
  const pricingStrategyPatterns = /\b(discount|volume\s*commit|match.*rate|phased\s*pric|unbundl|competitive\s*on\s*price|close\s*(the|that)\s*gap|%\s*off|pricing\s*approach|headline\s*number)/i;
  const allPricingStrategy = managerMessages.every(m => pricingStrategyPatterns.test(m.content || '') || priceKeywords.test(m.content || ''));
  const asksAboutNonPrice = managerMessages.some(m => {
    const text = m.content || '';
    const hasQuestion = text.includes('?');
    const aboutNonPrice = /\b(reliab|uptime|downtime|safety|hse|risk|operational|technical|engineer)/i.test(text);
    return hasQuestion && aboutNonPrice;
  });
  const isPriceOnlyStrict = allPricingStrategy && !asksAboutNonPrice;
  const isPriceOnly = (priceOnlyMessages.length >= managerMessages.length * 0.7 && nonPriceMessages.length === 0) || isPriceOnlyStrict;

  // Check for evidence spam (lots of evidence, minimal conversation)
  const substantiveManagerWords = allManagerWords.filter(w =>
    !['here', 'check', 'this', 'too', 'one', 'more', 'look', 'at', 'see', 'and', 'also'].includes(w.toLowerCase())
  );
  const isEvidenceSpam = evidenceMessages.length >= 3
    && substantiveManagerWords.length < 50;

  // Check for questions asked (discovery indicators)
  const questionsAsked = managerMessages.filter(m =>
    (m.content || '').includes('?')
  );
  const nonPriceQuestions = questionsAsked.filter(m =>
    nonPriceKeywords.test(m.content || '')
  );

  // Check if evidence was deployed BEFORE discovery questions
  let firstEvidenceIdx = -1;
  let firstNonPriceQuestionIdx = -1;
  transcript.forEach((t, idx) => {
    if (t.role === 'evidence' && firstEvidenceIdx === -1) firstEvidenceIdx = idx;
    if (t.role === 'manager' && nonPriceKeywords.test(t.content || '') && (t.content || '').includes('?') && firstNonPriceQuestionIdx === -1) {
      firstNonPriceQuestionIdx = idx;
    }
  });
  const evidenceBeforeDiscovery = firstEvidenceIdx !== -1
    && (firstNonPriceQuestionIdx === -1 || firstEvidenceIdx < firstNonPriceQuestionIdx);

  // Count substantive exchanges (manager messages with 10+ words)
  const substantiveExchanges = managerMessages.filter(m =>
    (m.content || '').split(/\s+/).filter(w => w.length > 0).length >= 10
  ).length;

  // Count unique non-price dimensions probed by the learner
  const dimensionProbes = {
    reliability: /\b(reliab|uptime|downtime|npt|non-productive|stuck\s*pipe|failure|outage|running|operational\s*risk)/i,
    hse: /\b(safety|hse|incident|compliance|regulat|environmental|health|injury|audit|zero\s*record)/i,
    technical: /\b(technical|support|engineer|expertise|wellbore|bha|geology|complex\s*well|formation)/i,
    service: /\b(response\s*time|service\s*time|service\s*response|speed\s*of\s*response|turnaround|mobiliz|on-site\s*within)/i,
  };
  const dimensionsProbed = new Set();
  managerMessages.forEach(m => {
    const text = m.content || '';
    Object.entries(dimensionProbes).forEach(([dim, pattern]) => {
      if (pattern.test(text)) dimensionsProbed.add(dim);
    });
  });

  return {
    managerMessageCount: managerMessages.length,
    evidenceCount: evidenceMessages.length,
    avgWordCount: Math.round(avgWordCount),
    substantiveExchanges,
    totalManagerWords: allManagerWords.length,
    substantiveManagerWords: substantiveManagerWords.length,
    questionsAsked: questionsAsked.length,
    nonPriceQuestions: nonPriceQuestions.length,
    dimensionsProbed: dimensionsProbed.size,
    dimensionsList: Array.from(dimensionsProbed),
    isGarbage,
    isPriceOnly,
    isEvidenceSpam,
    evidenceBeforeDiscovery,
  };
}

/**
 * Apply programmatic score caps based on transcript analysis.
 * These are HARD GUARDRAILS that override LLM generosity.
 */
function applyScoreCaps(scores, analysis) {
  const capped = { ...scores };
  const caps = [];

  // ── CAP 1: Garbage/nonsense — hard cap at 5 ──────────────────
  if (analysis.isGarbage) {
    Object.keys(capped).forEach(k => {
      if (capped[k] > 5) {
        capped[k] = Math.min(capped[k], 5);
        caps.push(k + ' capped at 5 (garbage/nonsense detected)');
      }
    });
    return { scores: capped, caps };
  }

  // ── CAP 2: Evidence spam — hard cap at 15 ────────────────────
  if (analysis.isEvidenceSpam) {
    Object.keys(capped).forEach(k => {
      if (capped[k] > 15) {
        capped[k] = Math.min(capped[k], 15);
        caps.push(k + ' capped at 15 (evidence spam: ' + analysis.evidenceCount + ' packets, only ' + analysis.substantiveManagerWords + ' substantive words)');
      }
    });
    return { scores: capped, caps };
  }

  // ── CAP 3: Price-only conversation — hard caps ────────────────
  if (analysis.isPriceOnly) {
    if (capped.discovery !== undefined && capped.discovery > 5) {
      capped.discovery = Math.min(capped.discovery, 5);
      caps.push('discovery capped at 5 (price-only conversation)');
    }
    if (capped.persuasion !== undefined && capped.persuasion > 10) {
      capped.persuasion = Math.min(capped.persuasion, 10);
      caps.push('persuasion capped at 10 (price-only conversation)');
    }
    return { scores: capped, caps };
  }

  // ── CAP 4: Evidence before discovery — cap persuasion ─────────
  if (analysis.evidenceBeforeDiscovery && analysis.nonPriceQuestions === 0) {
    if (capped.persuasion !== undefined && capped.persuasion > 20) {
      capped.persuasion = Math.min(capped.persuasion, 20);
      caps.push('persuasion capped at 20 (evidence deployed without any discovery)');
    }
  } else if (analysis.evidenceBeforeDiscovery) {
    if (capped.persuasion !== undefined && capped.persuasion > 30) {
      capped.persuasion = Math.min(capped.persuasion, 30);
      caps.push('persuasion capped at 30 (evidence deployed before discovery questions)');
    }
  }

  // ── CAP 5: Too few substantive exchanges ──────────────────────
  if (analysis.substantiveExchanges < 3) {
    Object.keys(capped).forEach(k => {
      if (capped[k] > 35) {
        capped[k] = Math.min(capped[k], 35);
        caps.push(k + ' capped at 35 (only ' + analysis.substantiveExchanges + ' substantive exchanges)');
      }
    });
  } else if (analysis.substantiveExchanges < 5) {
    Object.keys(capped).forEach(k => {
      if (capped[k] > 50) {
        capped[k] = Math.min(capped[k], 50);
        caps.push(k + ' capped at 50 (only ' + analysis.substantiveExchanges + ' substantive exchanges)');
      }
    });
  }

  // ── CAP 6: No questions asked — cap discovery ─────────────────
  if (analysis.questionsAsked === 0) {
    if (capped.discovery !== undefined && capped.discovery > 10) {
      capped.discovery = Math.min(capped.discovery, 10);
      caps.push('discovery capped at 10 (no questions asked)');
    }
  }

  // ── CAP 7: No non-price questions — cap discovery ─────────────
  if (analysis.nonPriceQuestions === 0 && analysis.questionsAsked > 0) {
    if (capped.discovery !== undefined && capped.discovery > 15) {
      capped.discovery = Math.min(capped.discovery, 15);
      caps.push('discovery capped at 15 (no non-price questions)');
    }
  }

  // ── CAP 8: Dimension-based discovery ceiling ──────────────────
  // Discovery score should scale with dimensions actually probed
  if (capped.discovery !== undefined) {
    const dimCeiling = analysis.dimensionsProbed === 0 ? 15
      : analysis.dimensionsProbed === 1 ? 35
      : analysis.dimensionsProbed === 2 ? 55
      : analysis.dimensionsProbed === 3 ? 70
      : 80; // 4 dimensions probed
    if (capped.discovery > dimCeiling) {
      capped.discovery = Math.min(capped.discovery, dimCeiling);
      caps.push('discovery capped at ' + dimCeiling + ' (' + analysis.dimensionsProbed + ' dimensions probed)');
    }
  }


  // ── FLOOR 1: Expert-level transcript minimum ──────────────────
  // If the learner has 7+ substantive exchanges, 3+ dimensions probed,
  // and 4+ non-price questions, enforce a minimum floor to counter
  // LLM under-scoring variance on clearly strong transcripts.
  if (analysis.substantiveExchanges >= 7 && analysis.dimensionsProbed >= 3 && analysis.nonPriceQuestions >= 4) {
    Object.keys(capped).forEach(k => {
      if (capped[k] < 58) {
        capped[k] = Math.max(capped[k], 58);
        caps.push(k + ' raised to 58 (expert-level transcript: ' + analysis.substantiveExchanges + ' exchanges, ' + analysis.dimensionsProbed + ' dimensions, ' + analysis.nonPriceQuestions + ' non-price questions)');
      }
    });
  }
  // Slightly lower floor for strong transcripts (5+ exchanges, 3+ dims, 3+ questions)
  else if (analysis.substantiveExchanges >= 5 && analysis.dimensionsProbed >= 3 && analysis.nonPriceQuestions >= 3) {
    Object.keys(capped).forEach(k => {
      if (capped[k] < 48) {
        capped[k] = Math.max(capped[k], 48);
        caps.push(k + ' raised to 48 (strong transcript: ' + analysis.substantiveExchanges + ' exchanges, ' + analysis.dimensionsProbed + ' dimensions)');
      }
    });
  }

  return { scores: capped, caps };
}


/**
 * Evaluate learner skills after an exchange.
 *
 * @param {Array} transcript - Full conversation transcript [{role, content}, ...]
 * @param {Array} skills - Gamma's skill definitions [{id, name, weight, rubric}, ...]
 * @param {Object} dimensions - Gamma's dimension definitions (for context)
 * @returns {Promise<{scores: Object, reasoning: Object}>}
 */
async function evaluateSkills(transcript, skills, dimensions, context) {
  context = context || {};
  if (!transcript || transcript.length === 0 || !skills || skills.length === 0) {
    const defaultScores = {};
    const defaultReasoning = {};
    skills.forEach(s => {
      defaultScores[s.id] = 0;
      defaultReasoning[s.id] = 'No transcript to evaluate';
    });
    return { scores: defaultScores, reasoning: defaultReasoning };
  }

  // ── Layer 1: Analyze transcript programmatically ──────────────
  const analysis = analyzeTranscript(transcript);

  // Build the transcript text for the judge
  const transcriptText = transcript
    .filter(t => t.role === 'manager' || t.role === 'customer' || t.role === 'evidence')
    .map(t => {
      const label = t.role === 'manager' ? 'LEARNER' : t.role === 'evidence' ? '[EVIDENCE PRESENTED]' : 'COUNTERPART';
      return label + ': ' + (t.content || '').slice(0, 500);
    })
    .join('\n\n');

  // Build skill rubrics section
  const rubricText = skills.map(skill => {
    return 'SKILL: ' + skill.name + ' (weight: ' + (skill.weight * 100).toFixed(0) + '%)\nDescription: ' + skill.description + '\nScoring rubric:\n  0-15 (Novice): ' + skill.rubric.novice + '\n  16-40 (Developing): ' + skill.rubric.developing + '\n  41-70 (Advanced): ' + (skill.rubric.advanced || skill.rubric.developing + ' with multiple strong exchanges') + '\n  71-100 (Expert): ' + skill.rubric.expert;
  }).join('\n\n');

  // Build dimensions context
  const dimText = dimensions
    ? dimensions.map(d => d.name + ' (' + d.visibility + ', ' + (d.weight * 100).toFixed(0) + '% weight)').join(', ')
    : 'Not specified';

  // Quality context
  const qualityNote = context.messageQuality && context.messageQuality.quality !== 'normal'
    ? '\nWARNING: The learner\'s LATEST message was flagged as: ' + context.messageQuality.quality + '. This should significantly lower scores.'
    : '';

  // Include transcript analysis in the prompt for the LLM
  const analysisNote = `
AUTOMATED TRANSCRIPT ANALYSIS (use these facts to calibrate your scores):
- Learner sent ${analysis.managerMessageCount} messages, averaging ${analysis.avgWordCount} words each
- ${analysis.substantiveExchanges} messages had 10+ words (substantive exchanges)
- ${analysis.questionsAsked} questions asked total, ${analysis.nonPriceQuestions} about non-price topics
- ${analysis.dimensionsProbed} non-price dimensions mentioned by learner: [${analysis.dimensionsList.join(', ') || 'none'}]
- ${analysis.evidenceCount} evidence packets presented
- Evidence before discovery: ${analysis.evidenceBeforeDiscovery ? 'YES' : 'no'}
- Garbage/nonsense detected: ${analysis.isGarbage ? 'YES' : 'no'}
- Price-only conversation: ${analysis.isPriceOnly ? 'YES' : 'no'}
- Evidence spam pattern: ${analysis.isEvidenceSpam ? 'YES' : 'no'}`;

  // Load module-specific context for the judge prompt
  const moduleId = context.moduleId || null;
  const mod = moduleId ? loadModule(moduleId) : null;
  const moduleDescription = mod ? mod.description : 'a B2B contract renewal negotiation';
  const moduleNarrative = mod && mod.informationArchitecture ? mod.informationArchitecture.description : 'price is a decoy (only 7% importance), while reliability (35%) and HSE safety (28%) are the real decision drivers';

  const prompt = `You are a STRICT skill assessment judge for a high-stakes conversational learning simulation.

SCENARIO CONTEXT:
The learner is a sales professional in ${moduleDescription}. Their counterpart holds a HIDDEN priority structure — ${moduleNarrative}. The learner must DISCOVER these hidden priorities through skilled questioning, then DEPLOY evidence strategically.

Hidden dimensions: ${dimText}

SKILL RUBRICS TO EVALUATE:
${rubricText}

SESSION STATISTICS:
- Total learner messages: ${analysis.managerMessageCount}
- Evidence packets presented: ${analysis.evidenceCount}
- Exchanges completed: ${context.exchangeCount || 0}${qualityNote}
${analysisNote}

CONVERSATION TRANSCRIPT:
${transcriptText}

CRITICAL SCORING INSTRUCTIONS — READ CAREFULLY:

1. BE EXTREMELY HARSH. You are grading executives at a world-class level. A score above 50 should be RARE. Most learners score 10-35.

2. SCORING CALIBRATION (STRICT):
   - 0-5: GARBAGE. Off-topic, nonsensical, extremely short messages, food orders, or gibberish. Also: pure evidence spam with no real conversation.
   - 0-10: PRICE ONLY. Learner only discussed pricing, discounts, or cost without asking about ANY non-price dimension. Price defense is the OPPOSITE of discovery.
   - 11-25: SHALLOW. Asked 1-2 surface questions. May have touched on non-price topics but without depth or follow-up. Evidence presented without relevant discovery.
   - 26-40: DEVELOPING. Asked about 1-2 non-price dimensions with SOME follow-up. Beginning to probe but hasn't mapped priorities. Evidence may have been used with partial relevance.
   - 41-55: GOOD. Discovered 2+ hidden priorities through deliberate probing questions. Multiple follow-up questions. Evidence deployed AFTER discovery with clear connection to discovered concerns.
   - 56-68: STRONG. Systematically mapped the priority structure across 3+ dimensions. Evidence deployed with strategic timing matching customer's revealed concerns. Customer shows genuine engagement shift.
   - 69-80: EXPERT. Full systematic discovery of ALL major hidden priorities with deep follow-up on each. Evidence surgically matched to each revealed concern. Customer explicitly verbalizes mindset shift. 7+ substantive exchanges. This score should be VERY RARE.

3. CRITICAL HARD CAPS:
   - If garbage/nonsense detected: ALL scores MUST be 0-5.
   - If evidence spam detected: ALL scores MUST be 5-15. Evidence without conversation is NOT skill.
   - If price-only conversation: Discovery MUST be 0-5, Persuasion MUST be 0-10.
   - If evidence before discovery: Persuasion cap at 20.
   - If fewer than 3 substantive exchanges: ALL scores cap at 35.
   - If fewer than 5 substantive exchanges: ALL scores cap at 50.
   - If zero non-price questions: Discovery cap at 15.
   - The NUMBER of evidence packets does NOT improve scores. Each must be preceded by relevant discovery.

4. DISCOVERY scoring requires the learner to ASK SPECIFIC QUESTIONS that uncover hidden information. Stating facts is NOT discovery. Vague questions like "how has service been?" barely count. The learner must probe SPECIFIC non-price dimensions.

5. PERSUASION scoring requires STRATEGIC evidence deployment AFTER and BECAUSE OF discovery. Evidence must be EXPLICITLY connected to a concern the customer voiced. Random evidence dumps score 0-10.

6. IMPORTANT: Do NOT give the learner credit for the CUSTOMER's statements. The customer may reveal information voluntarily — the learner only gets credit for SKILLFULLY ELICITING information through specific questions.

Return ONLY a JSON object with this exact structure (no markdown, no extra text):
{
  "scores": { ${skills.map(s => '"' + s.id + '": <number 0-100>').join(', ')} },
  "reasoning": { ${skills.map(s => '"' + s.id + '": "<brief 1-sentence explanation>"').join(', ')} }
}`;

  try {
    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = (response.content[0]?.text || '').trim();

    // Parse JSON — handle potential markdown wrapping
    let jsonText = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonText = jsonMatch[0];

    const parsed = JSON.parse(jsonText);

    // Extract raw LLM scores
    const rawScores = {};
    const reasoning = {};
    skills.forEach(skill => {
      const raw = parsed.scores?.[skill.id];
      rawScores[skill.id] = typeof raw === 'number' ? Math.max(0, Math.min(100, Math.round(raw))) : 0;
      reasoning[skill.id] = parsed.reasoning?.[skill.id] || '';
    });

    // ── Layer 2: Apply programmatic score caps ──────────────────
    const { scores: cappedScores, caps } = applyScoreCaps(rawScores, analysis);

    // Log caps for debugging (only in development)
    if (caps.length > 0) {
      console.log('[SkillJudge] Score caps applied:', caps.join('; '));
    }

    return { scores: cappedScores, reasoning };
  } catch (err) {
    console.error('[SkillJudge] Error:', err.message);
    // Fallback: return zeros
    const scores = {};
    const reasoning = {};
    skills.forEach(s => {
      scores[s.id] = 0;
      reasoning[s.id] = 'Judge error: ' + err.message;
    });
    return { scores, reasoning };
  }
}

module.exports = { evaluateSkills };
