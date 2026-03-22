'use strict';

/**
 * ANALYZE CONVERSATIONS — Two-Phase Analysis Engine
 *
 * Phase 1: Computational analysis (no AI calls)
 * Phase 2: AI-powered pattern analysis (Claude Sonnet on sample)
 *
 * Reuses existing metrics.js functions where possible.
 */

const Anthropic = require('@anthropic-ai/sdk');
const {
  analyzeDimensionEngagement,
  estimateKnowledgeTrajectory,
  analyzeInformationSignal,
  computeValuePriceRatio,
  analyzeConceptProgression,
} = require('../utils/metrics');
const { DIMENSION_KEYWORDS } = require('../prompts/systemPrompts');
const { BATCH_PATTERN_PROMPT, PERSONA_EVALUATION_PROMPT } = require('./analysisPrompts');

const client = new Anthropic();

/**
 * Phase 1: Computational Analysis (no AI calls)
 */
function computationalAnalysis(conversations) {
  console.log('\n--- Phase 1: Computational Analysis ---');

  const stageAnalysis = {
    early:  { kDeltas: [], goodMoves: 0, totalMoves: 0 },
    middle: { kDeltas: [], goodMoves: 0, totalMoves: 0 },
    late:   { kDeltas: [], goodMoves: 0, totalMoves: 0 },
  };

  const dimensionStats = {
    reliability: { totalHits: 0, firstMentionExchanges: [], conversations: 0 },
    hse:         { totalHits: 0, firstMentionExchanges: [], conversations: 0 },
    technical:   { totalHits: 0, firstMentionExchanges: [], conversations: 0 },
    service:     { totalHits: 0, firstMentionExchanges: [], conversations: 0 },
    price:       { totalHits: 0, firstMentionExchanges: [], conversations: 0 },
  };

  const skillScores = { novice: [], intermediate: [], expert: [] };
  const difficultyScores = { easy: [], medium: [], hard: [] };
  const questionPatterns = [];

  conversations.forEach(conv => {
    // Track scores by skill and difficulty
    skillScores[conv.skillLevel]?.push(conv.finalObjectiveScore);
    difficultyScores[conv.difficulty]?.push(conv.finalObjectiveScore);

    // Analyze K(t) trajectory by stage
    conv.knowledgeTrajectory.forEach(kPoint => {
      const stage = kPoint.exchange <= 3 ? 'early' : kPoint.exchange <= 7 ? 'middle' : 'late';
      stageAnalysis[stage].kDeltas.push(kPoint.dKdt);
      stageAnalysis[stage].totalMoves++;
      if (kPoint.dKdt > 0.01) stageAnalysis[stage].goodMoves++;
    });

    // Analyze dimension engagement using metrics.js
    const transcript = conv.transcript.map(t => ({
      role: t.role === 'manager' ? 'manager' : 'customer',
      content: t.content,
    }));
    const engagement = analyzeDimensionEngagement(transcript);

    Object.keys(dimensionStats).forEach(dim => {
      dimensionStats[dim].totalHits += engagement[dim].count;
      if (engagement[dim].firstMention !== null) {
        dimensionStats[dim].firstMentionExchanges.push(engagement[dim].firstMention);
        dimensionStats[dim].conversations++;
      }
    });

    // Extract question patterns from manager messages
    const managerMsgs = conv.transcript.filter(t => t.role === 'manager');
    managerMsgs.forEach((msg, idx) => {
      if (msg.content.includes('?')) {
        // Check if this question led to a K(t) jump
        const kPoint = conv.knowledgeTrajectory[idx];
        if (kPoint && kPoint.dKdt > 0.01) {
          questionPatterns.push({
            question: msg.content,
            stage: msg.exchange <= 3 ? 'early' : msg.exchange <= 7 ? 'middle' : 'late',
            kDelta: kPoint.dKdt,
            skillLevel: conv.skillLevel,
            difficulty: conv.difficulty,
          });
        }
      }
    });
  });

  // Compute averages
  const avgFn = arr => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const stageResults = {};
  Object.entries(stageAnalysis).forEach(([stage, data]) => {
    stageResults[stage] = {
      avgKDelta: Math.round(avgFn(data.kDeltas) * 1000) / 1000,
      goodMoveRate: data.totalMoves > 0
        ? Math.round((data.goodMoves / data.totalMoves) * 100) : 0,
      totalExchanges: data.totalMoves,
    };
  });

  const dimensionResults = {};
  Object.entries(dimensionStats).forEach(([dim, data]) => {
    dimensionResults[dim] = {
      avgHitsPerConversation: conversations.length > 0
        ? Math.round((data.totalHits / conversations.length) * 10) / 10 : 0,
      avgFirstMention: data.firstMentionExchanges.length > 0
        ? Math.round(avgFn(data.firstMentionExchanges) * 10) / 10 : null,
      explorationRate: conversations.length > 0
        ? Math.round((data.conversations / conversations.length) * 100) : 0,
    };
  });

  const skillResults = {};
  Object.entries(skillScores).forEach(([skill, scores]) => {
    skillResults[skill] = {
      count: scores.length,
      avgScore: Math.round(avgFn(scores)),
      minScore: scores.length > 0 ? Math.min(...scores) : 0,
      maxScore: scores.length > 0 ? Math.max(...scores) : 0,
    };
  });

  const difficultyResults = {};
  Object.entries(difficultyScores).forEach(([diff, scores]) => {
    difficultyResults[diff] = {
      count: scores.length,
      avgScore: Math.round(avgFn(scores)),
    };
  });

  // Sort question patterns by K(t) delta to find highest-impact questions
  questionPatterns.sort((a, b) => b.kDelta - a.kDelta);

  console.log('  Stage analysis: early=' + stageResults.early.avgKDelta +
    ' middle=' + stageResults.middle.avgKDelta + ' late=' + stageResults.late.avgKDelta);
  console.log('  Skill scores: novice=' + (skillResults.novice?.avgScore || 0) +
    ' intermediate=' + (skillResults.intermediate?.avgScore || 0) +
    ' expert=' + (skillResults.expert?.avgScore || 0));
  console.log('  Top question patterns found: ' + Math.min(questionPatterns.length, 20));

  return {
    stageResults,
    dimensionResults,
    skillResults,
    difficultyResults,
    topQuestionPatterns: questionPatterns.slice(0, 20),
  };
}


/**
 * Phase 2: AI-Powered Analysis (Claude Sonnet on sample)
 */
async function aiAnalysis(conversations) {
  console.log('\n--- Phase 2: AI-Powered Analysis ---');

  // Select sample: top 5, bottom 5, random 10 from middle
  const sorted = [...conversations].sort((a, b) => b.finalObjectiveScore - a.finalObjectiveScore);
  const top5 = sorted.slice(0, 5);
  const bottom5 = sorted.slice(-5);
  const middle = sorted.slice(5, -5);
  const middleSample = middle.sort(() => Math.random() - 0.5).slice(0, 10);
  const sample = [...top5, ...middleSample, ...bottom5];

  console.log('  Selected ' + sample.length + ' conversations for AI analysis');
  console.log('  Top 5 scores: ' + top5.map(c => c.finalObjectiveScore).join(', '));
  console.log('  Bottom 5 scores: ' + bottom5.map(c => c.finalObjectiveScore).join(', '));

  // Prepare transcript summaries for the batch pattern analysis
  const transcriptSummaries = sample.map(conv => ({
    id: conv.id,
    skillLevel: conv.skillLevel,
    difficulty: conv.difficulty,
    finalScore: conv.finalObjectiveScore,
    transcript: conv.transcript.map(t => t.role + ': ' + t.content).join('\n'),
    knowledgeTrajectory: conv.knowledgeTrajectory.map(k =>
      'Ex' + k.exchange + ': dK=' + k.dKdt.toFixed(3) +
      ' K=[' + Object.entries(k.K).map(([d, v]) => d.slice(0, 3) + '=' + v.toFixed(2)).join(',') + ']'
    ).join('\n'),
  }));

  // AI Analysis 1: Pattern identification
  let patternAnalysis = null;
  try {
    console.log('  Running pattern analysis (this may take 30-60 seconds)...');
    const patternResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: BATCH_PATTERN_PROMPT,
      messages: [{
        role: 'user',
        content: 'Here are ' + sample.length + ' conversation transcripts with K(t) data:\n\n' +
          transcriptSummaries.map((s, i) =>
            '--- CONVERSATION ' + (i + 1) + ' [' + s.skillLevel + '/' + s.difficulty + ' Score: ' + s.finalScore + '] ---\n' +
            s.transcript + '\n\nK(t) Trajectory:\n' + s.knowledgeTrajectory
          ).join('\n\n'),
      }],
    });

    const text = patternResponse.content[0].text;
    try {
      patternAnalysis = JSON.parse(text);
      console.log('  Pattern analysis complete: ' + (patternAnalysis.goodPatterns?.length || 0) + ' good patterns, ' +
        (patternAnalysis.deadEndPatterns?.length || 0) + ' dead ends');
    } catch {
      console.warn('  Warning: Could not parse pattern analysis JSON, storing raw text');
      patternAnalysis = { raw: text };
    }
  } catch (err) {
    console.error('  Pattern analysis failed:', err.message);
    patternAnalysis = { error: err.message };
  }

  // AI Analysis 2: Persona evaluation
  let personaEval = null;
  try {
    console.log('  Running persona evaluation...');

    // Collect customer responses from different conversations and skill levels
    const customerResponses = sample.flatMap(conv =>
      conv.transcript
        .filter(t => t.role === 'customer' && t.exchange > 0)
        .slice(0, 3)
        .map(t => ({
          response: t.content,
          managerSkill: conv.skillLevel,
          difficulty: conv.difficulty,
          exchange: t.exchange,
          precedingManagerMsg: conv.transcript.find(
            m => m.role === 'manager' && m.exchange === t.exchange
          )?.content || '(unknown)',
        }))
    ).slice(0, 25);

    const personaResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: PERSONA_EVALUATION_PROMPT,
      messages: [{
        role: 'user',
        content: 'Here are ' + customerResponses.length + ' customer VP responses from different conversations:\n\n' +
          customerResponses.map((cr, i) =>
            '--- Response ' + (i + 1) + ' [Manager: ' + cr.managerSkill + ', Difficulty: ' + cr.difficulty + ', Exchange: ' + cr.exchange + '] ---\n' +
            'Manager said: "' + cr.precedingManagerMsg + '"\n' +
            'VP responded: "' + cr.response + '"'
          ).join('\n\n'),
      }],
    });

    const text = personaResponse.content[0].text;
    try {
      personaEval = JSON.parse(text);
      console.log('  Persona evaluation complete: overall score ' + (personaEval.overallScore || 'N/A'));
    } catch {
      console.warn('  Warning: Could not parse persona evaluation JSON, storing raw text');
      personaEval = { raw: text };
    }
  } catch (err) {
    console.error('  Persona evaluation failed:', err.message);
    personaEval = { error: err.message };
  }

  return { patternAnalysis, personaEval };
}


/**
 * Main analysis function
 */
async function analyzeResults(batchData) {
  console.log('\n========================================');
  console.log('ANALYZING ' + batchData.conversations.length + ' CONVERSATIONS');
  console.log('========================================');

  // Phase 1: Computational
  const computational = computationalAnalysis(batchData.conversations);

  // Phase 2: AI-Powered (only if we have enough conversations)
  let aiResults = { patternAnalysis: null, personaEval: null };
  if (batchData.conversations.length >= 10) {
    aiResults = await aiAnalysis(batchData.conversations);
  } else {
    console.log('\nSkipping AI analysis (need at least 10 conversations, have ' + batchData.conversations.length + ')');
  }

  // Combine into final report
  const report = {
    summary: {
      totalConversations: batchData.conversations.length,
      bySkillLevel: computational.skillResults,
      byDifficulty: computational.difficultyResults,
      batchId: batchData.batchId,
      timestamp: new Date().toISOString(),
    },
    stageAnalysis: {
      early: {
        avgKDelta: computational.stageResults.early.avgKDelta,
        goodMoveRate: computational.stageResults.early.goodMoveRate,
        goodPatterns: aiResults.patternAnalysis?.stageInsights?.early?.optimalMoves || [],
        badPatterns: aiResults.patternAnalysis?.stageInsights?.early?.commonMistakes || [],
      },
      middle: {
        avgKDelta: computational.stageResults.middle.avgKDelta,
        goodMoveRate: computational.stageResults.middle.goodMoveRate,
        goodPatterns: aiResults.patternAnalysis?.stageInsights?.middle?.optimalMoves || [],
        badPatterns: aiResults.patternAnalysis?.stageInsights?.middle?.commonMistakes || [],
      },
      late: {
        avgKDelta: computational.stageResults.late.avgKDelta,
        goodMoveRate: computational.stageResults.late.goodMoveRate,
        goodPatterns: aiResults.patternAnalysis?.stageInsights?.late?.optimalMoves || [],
        badPatterns: aiResults.patternAnalysis?.stageInsights?.late?.commonMistakes || [],
      },
    },
    discoveryInsights: {
      highImpactQuestions: aiResults.patternAnalysis?.goodPatterns || computational.topQuestionPatterns.slice(0, 10),
      deadEndPatterns: aiResults.patternAnalysis?.deadEndPatterns || [],
      optimalQuestionSequences: aiResults.patternAnalysis?.optimalSequences || [],
      dimensionSpecificStrategies: aiResults.patternAnalysis?.dimensionStrategies || {},
    },
    dimensionEngagement: computational.dimensionResults,
    personaInsights: {
      customerResponseQuality: personaScoreSummary(aiResults.personaEval),
      naturalness: aiResults.personaEval?.naturalness?.score || null,
      suggestionForImprovement: aiResults.personaEval?.improvements || [],
      fullEvaluation: aiResults.personaEval,
    },
    topQuestionPatterns: computational.topQuestionPatterns,
  };

  console.log('\n========================================');
  console.log('ANALYSIS COMPLETE');
  console.log('========================================');

  return report;
}

function personaScoreSummary(eval_) {
  if (!eval_ || eval_.error || eval_.raw) return 'Analysis unavailable';
  const scores = [
    eval_.naturalness?.score,
    eval_.behavioralAuthenticity?.score,
    eval_.disclosureGradient?.score,
    eval_.rewardSensitivity?.score,
    eval_.conversationFlow?.score,
  ].filter(s => s != null);
  if (scores.length === 0) return 'No scores available';
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return avg.toFixed(1) + '/10 (based on ' + scores.length + ' dimensions)';
}

module.exports = { analyzeResults, computationalAnalysis, aiAnalysis };
