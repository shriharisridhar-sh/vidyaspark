'use strict';

/**
 * ANALYTICS ROUTES — Cohort-level research data aggregation.
 *
 * GET /api/analytics/cohort/:tag — All 6 cross-sectional metrics for a cohort.
 * GET /api/analytics/cohorts     — List all cohort tags with session counts.
 * GET /api/analytics/cohort/:tag/export — CSV export of cohort data.
 */

const { Router } = require('express');
const database = require('../db/database');

const router = Router();

// ══════════════════════════════════════════════════════════════
// Helper: Compute cross-sectional metrics from an array of sessions
// ══════════════════════════════════════════════════════════════

function computeCohortMetrics(sessions) {
  if (!sessions.length) {
    return {
      n: 0,
      priceTrapEffect: null,
      withinSessionSkillGrowth: null,
      weightAccuracy: null,
      calibrationGap: null,
      archetypeDistribution: {},
      engagement: null,
    };
  }

  const n = sessions.length;

  // ─── Metric 1: Price Trap Effect ───────────────────────────
  // % of learners who predicted "price" as their #1 priority
  // (demonstrates the anchoring bias the module is designed to reveal)
  let pricePredictors = 0;
  let hasPrediction = 0;
  for (const s of sessions) {
    // priorityPrediction is stored in metadata or directly on the session
    const pp = s.priorityPrediction || (s.metadata && s.metadata.priorityPrediction);
    if (pp && pp.first) {
      hasPrediction++;
      if (pp.first === 'price') pricePredictors++;
    }
  }
  const priceTrapEffect = hasPrediction > 0
    ? { pct: Math.round((pricePredictors / hasPrediction) * 100), n: hasPrediction, trapped: pricePredictors }
    : null;

  // ─── Metric 2: Within-Session Skill Growth ─────────────────
  // Average skill score improvement from first quarter to last quarter of session
  const growthData = [];
  for (const s of sessions) {
    const hist = s.skillHistory || [];
    if (hist.length >= 4) {
      // Compare first quarter average vs last quarter average
      const q = Math.floor(hist.length / 4);
      const firstQ = hist.slice(0, q);
      const lastQ = hist.slice(-q);

      // Average the composite (or discovery) score across each quarter
      const avgScore = (arr) => {
        let sum = 0;
        for (const snap of arr) {
          if (snap.scores) {
            // COACH 2.0 format: { scores: { discovery: 30, persuasion: 20 } }
            const vals = Object.values(snap.scores);
            sum += vals.reduce((a, b) => a + b, 0) / vals.length;
          } else if (typeof snap === 'number') {
            sum += snap;
          }
        }
        return sum / arr.length;
      };

      const earlyAvg = avgScore(firstQ);
      const lateAvg = avgScore(lastQ);
      growthData.push({ early: earlyAvg, late: lateAvg, delta: lateAvg - earlyAvg });
    }
  }

  const withinSessionSkillGrowth = growthData.length > 0
    ? {
        avgEarly: Math.round(mean(growthData.map(g => g.early))),
        avgLate: Math.round(mean(growthData.map(g => g.late))),
        avgDelta: Math.round(mean(growthData.map(g => g.delta))),
        n: growthData.length,
        pctImproved: Math.round((growthData.filter(g => g.delta > 0).length / growthData.length) * 100),
      }
    : null;

  // ─── Metric 3: Post-Negotiation Weight Accuracy ────────────
  // How accurately learners estimate the true dimension weights after playing
  const accuracyData = [];
  for (const s of sessions) {
    const wp = s.weightPrediction;
    const sw = s.scenarioWeights;
    if (wp && sw && sw.weights) {
      // Compare predicted vs actual for each dimension
      let totalError = 0;
      let dimCount = 0;
      const dims = ['reliability', 'hse', 'technical', 'service', 'price'];
      for (const dim of dims) {
        const predicted = wp[dim];
        const actual = sw.weights[dim];
        if (predicted != null && actual != null) {
          totalError += Math.abs(predicted - actual * 100);
          dimCount++;
        }
      }
      if (dimCount > 0) {
        accuracyData.push({
          avgError: totalError / dimCount,
          dimCount,
        });
      }
    }
  }

  const weightAccuracy = accuracyData.length > 0
    ? {
        avgError: Math.round(mean(accuracyData.map(a => a.avgError)) * 10) / 10,
        n: accuracyData.length,
      }
    : null;

  // ─── Metric 4: Calibration Gap ─────────────────────────────
  // Y_hat (self-assessed) minus Y (objective score)
  const gapData = [];
  for (const s of sessions) {
    if (s.perceivedScore != null && s.objectiveScore != null) {
      gapData.push({
        perceived: s.perceivedScore,
        objective: s.objectiveScore,
        gap: s.perceivedScore - s.objectiveScore,
      });
    }
  }

  const calibrationGap = gapData.length > 0
    ? {
        avgPerceived: Math.round(mean(gapData.map(g => g.perceived))),
        avgObjective: Math.round(mean(gapData.map(g => g.objective))),
        avgGap: Math.round(mean(gapData.map(g => g.gap))),
        pctOverconfident: Math.round((gapData.filter(g => g.gap > 0).length / gapData.length) * 100),
        n: gapData.length,
      }
    : null;

  // ─── Metric 5: Archetype Distribution ──────────────────────
  const archetypeDistribution = {};
  for (const s of sessions) {
    const arch = s.archetype || 'Unknown';
    const label = typeof arch === 'string' ? arch : (arch.name || arch.label || 'Unknown');
    archetypeDistribution[label] = (archetypeDistribution[label] || 0) + 1;
  }

  // ─── Metric 6: Engagement ─────────────────────────────────
  const exchanges = sessions.map(s => s.exchangeCount || 0).filter(e => e > 0);
  const scores = sessions.map(s => s.objectiveScore).filter(s => s != null);

  const engagement = {
    avgExchanges: exchanges.length > 0 ? Math.round(mean(exchanges) * 10) / 10 : 0,
    avgScore: scores.length > 0 ? Math.round(mean(scores)) : 0,
    completionRate: Math.round((sessions.filter(s => (s.exchangeCount || 0) > 3).length / n) * 100),
    n: n,
  };

  return {
    n,
    priceTrapEffect,
    withinSessionSkillGrowth,
    weightAccuracy,
    calibrationGap,
    archetypeDistribution,
    engagement,
  };
}

function mean(arr) {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

// ══════════════════════════════════════════════════════════════
// Routes
// ══════════════════════════════════════════════════════════════

/**
 * GET /api/analytics/cohorts — List all cohort tags with session counts
 */
router.get('/cohorts', async (req, res) => {
  try {
    const db = await database.getDb();
    const result = db.exec(
      "SELECT user_group, COUNT(*) as cnt FROM sessions WHERE user_group IS NOT NULL AND user_group != '' GROUP BY user_group ORDER BY cnt DESC"
    );
    if (!result.length) return res.json({ cohorts: [] });

    const cohorts = result[0].values.map(row => ({
      tag: row[0],
      sessionCount: row[1],
    }));
    res.json({ cohorts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/analytics/cohort/:tag — Full cross-sectional metrics for a cohort
 */
router.get('/cohort/:tag', async (req, res) => {
  try {
    const tag = req.params.tag;
    const db = await database.getDb();

    // Get all sessions for this cohort
    const result = db.exec(
      'SELECT * FROM sessions WHERE user_group = ? ORDER BY created_at DESC',
      [tag]
    );

    if (!result.length || !result[0].values.length) {
      return res.json({
        cohortTag: tag,
        metrics: computeCohortMetrics([]),
        sessions: [],
      });
    }

    // Parse sessions
    const sessions = result[0].values.map(row => {
      const obj = {};
      result[0].columns.forEach((col, i) => obj[col] = row[i]);
      return {
        sessionId: obj.id,
        timestamp: obj.created_at,
        userName: obj.user_name,
        userGroup: obj.user_group,
        coachType: obj.coach_type,
        objectiveScore: obj.objective_score,
        perceivedScore: obj.perceived_score,
        exchangeCount: obj.exchange_count,
        archetype: obj.archetype ? safeJSON(obj.archetype) : null,
        skillScores: obj.skill_scores ? safeJSON(obj.skill_scores) : {},
        skillHistory: obj.skill_history ? safeJSON(obj.skill_history) : [],
        scenarioWeights: obj.scenario_weights ? safeJSON(obj.scenario_weights) : {},
        weightPrediction: obj.weight_prediction ? safeJSON(obj.weight_prediction) : null,
        priorityPrediction: obj.priority_prediction ? safeJSON(obj.priority_prediction) : null,
        initialChoice: obj.initial_choice ? safeJSON(obj.initial_choice) : null,
        compositeScore: obj.composite_score || obj.objective_score || 0,
      };
    });

    // Enrich sessions with any data from post_survey
    const enrichedSessions = sessions.map((s, idx) => {
      const obj = {};
      result[0].columns.forEach((col, i) => obj[col] = result[0].values[idx][i]);

      // Weight prediction fallback from post_survey
      const postSurvey = obj.post_survey ? safeJSON(obj.post_survey) : null;
      if (!s.weightPrediction && postSurvey && postSurvey.weightPrediction) {
        s.weightPrediction = postSurvey.weightPrediction;
      }

      return s;
    });

    const metrics = computeCohortMetrics(enrichedSessions);

    res.json({
      cohortTag: tag,
      metrics,
      sessions: enrichedSessions.map(s => ({
        sessionId: s.sessionId,
        timestamp: s.timestamp,
        userName: s.userName,
        coachType: s.coachType,
        objectiveScore: s.objectiveScore,
        perceivedScore: s.perceivedScore,
        exchangeCount: s.exchangeCount,
        archetype: s.archetype,
        compositeScore: s.compositeScore,
      })),
    });
  } catch (e) {
    console.error('[Analytics] Error:', e);
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/analytics/cohort/:tag/export — CSV export of cohort data
 */
router.get('/cohort/:tag/export', async (req, res) => {
  try {
    const tag = req.params.tag;
    const db = await database.getDb();

    const result = db.exec(
      'SELECT * FROM sessions WHERE user_group = ? ORDER BY created_at ASC',
      [tag]
    );

    if (!result.length || !result[0].values.length) {
      return res.status(404).json({ error: 'No sessions found for cohort: ' + tag });
    }

    // Build CSV
    const headers = [
      'session_id', 'timestamp', 'user_name', 'coach_type',
      'objective_score', 'perceived_score', 'calibration_gap',
      'exchange_count', 'archetype', 'initial_choice',
      'priority_prediction_1st', 'priority_prediction_2nd',
    ];

    const rows = result[0].values.map(row => {
      const obj = {};
      result[0].columns.forEach((col, i) => obj[col] = row[i]);
      const meta = obj.metadata_json ? safeJSON(obj.metadata_json) : {};
      const pp = meta.priorityPrediction || {};
      const arch = obj.archetype ? safeJSON(obj.archetype) : null;
      const archLabel = typeof arch === 'string' ? arch : (arch ? (arch.name || '') : '');
      const gap = (obj.perceived_score != null && obj.objective_score != null)
        ? (obj.perceived_score - obj.objective_score) : '';

      return [
        obj.id,
        obj.created_at,
        csvEscape(obj.user_name || ''),
        obj.coach_type || '',
        obj.objective_score || '',
        obj.perceived_score || '',
        gap,
        obj.exchange_count || '',
        csvEscape(archLabel),
        csvEscape(obj.initial_choice ? String(safeJSON(obj.initial_choice)) : ''),
        pp.first || '',
        pp.second || '',
      ].join(',');
    });

    const csv = headers.join(',') + '\n' + rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cohort_' + tag + '.csv"');
    res.send(csv);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function safeJSON(str) {
  try { return typeof str === 'string' ? JSON.parse(str) : str; }
  catch (_) { return null; }
}

function csvEscape(str) {
  if (!str) return '';
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

module.exports = router;
