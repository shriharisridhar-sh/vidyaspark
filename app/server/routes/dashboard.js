'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const database = require('../db/database');
const { loadModule, listModules } = require('../modules/ModuleRegistry');

const router = Router();

/**
 * GET /api/dashboard - Get authenticated user's full dashboard data
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const cohorts = database.getUserCohorts(userId);
    const moduleIds = req.user.role === 'admin'
      ? listModules().map(m => m.id)
      : database.getUserModuleIds(userId);
    const sessions = database.getUserSessions(userId);

    const modules = moduleIds.map(moduleId => {
      const mod = loadModule(moduleId);
      const moduleSessions = sessions.filter(s => s.scenarioId === moduleId);
      const scores = moduleSessions.map(s => s.compositeScore || s.objectiveScore || 0);
      const bestScore = scores.length > 0 ? Math.max(...scores) : null;
      const lastPlayed = moduleSessions.length > 0 ? moduleSessions[0].timestamp : null;

      return {
        id: moduleId,
        name: mod ? mod.name : moduleId,
        description: mod ? mod.description : '',
        completed: moduleSessions.length > 0,
        bestScore,
        sessionCount: moduleSessions.length,
        lastPlayed,
      };
    });

    res.json({
      user: req.user,
      cohorts,
      modules,
      sessions: sessions.map(s => ({
        sessionId: s.sessionId,
        scenarioId: s.scenarioId,
        timestamp: s.timestamp,
        compositeScore: s.compositeScore,
        objectiveScore: s.objectiveScore,
        archetype: s.archetype,
        exchangeCount: s.exchangeCount,
      })),
    });
  } catch (e) {
    console.error('[Dashboard] Error:', e.message);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

/**
 * GET /api/dashboard/user-stats - Get Ignator's summary stats
 */
router.get('/user-stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = database.getUserSessions(userId);

    const totalSessions = sessions.length;
    const modulesSet = new Set(sessions.map(s => s.scenarioId));
    const modulesPracticed = modulesSet.size;

    // Calculate average Spark and Reach scores
    let sparkTotal = 0, sparkCount = 0;
    let reachTotal = 0, reachCount = 0;

    for (const s of sessions) {
      const skills = s.skillScores || {};
      if (skills.spark || skills.S1) {
        sparkTotal += skills.spark || skills.S1 || 0;
        sparkCount++;
      }
      if (skills.reach || skills.S2) {
        reachTotal += skills.reach || skills.S2 || 0;
        reachCount++;
      }
    }

    const avgSpark = sparkCount > 0 ? Math.round(sparkTotal / sparkCount) : 0;
    const avgReach = reachCount > 0 ? Math.round(reachTotal / reachCount) : 0;

    res.json({
      totalSessions,
      modulesPracticed,
      avgSpark,
      avgReach,
      user: req.user,
    });
  } catch (e) {
    console.error('[Dashboard] user-stats error:', e.message);
    res.status(500).json({ error: 'Failed to load user stats' });
  }
});

/**
 * GET /api/dashboard/sessions - Get user's recent sessions
 */
router.get('/sessions', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = database.getUserSessions(userId);

    const result = sessions.slice(0, 10).map(s => {
      const mod = loadModule(s.scenarioId);
      return {
        sessionId: s.sessionId,
        scenarioId: s.scenarioId,
        moduleName: mod ? mod.name : s.scenarioId,
        timestamp: s.timestamp,
        compositeScore: s.compositeScore || s.objectiveScore || 0,
        exchangeCount: s.exchangeCount,
      };
    });

    res.json(result);
  } catch (e) {
    console.error('[Dashboard] sessions error:', e.message);
    res.status(500).json({ error: 'Failed to load sessions' });
  }
});

/**
 * DELETE /api/dashboard/sessions/cleanup - Delete all 0-score sessions for the current user
 * This runs inside the live server process so it actually affects the in-memory DB
 */
router.delete('/sessions/cleanup', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const d = await database.getDb();

    // Count before
    const before = d.exec('SELECT COUNT(*) FROM sessions WHERE user_id = ?', [userId]);
    const countBefore = before.length ? before[0].values[0][0] : 0;

    // Delete sessions with 0 or null composite_score
    d.run('DELETE FROM sessions WHERE user_id = ? AND (composite_score IS NULL OR composite_score = 0)', [userId]);
    database.saveToDisk();

    // Count after
    const after = d.exec('SELECT COUNT(*) FROM sessions WHERE user_id = ?', [userId]);
    const countAfter = after.length ? after[0].values[0][0] : 0;

    res.json({
      message: 'Cleanup complete',
      deleted: countBefore - countAfter,
      remaining: countAfter,
    });
  } catch (e) {
    console.error('[Dashboard] cleanup error:', e.message);
    res.status(500).json({ error: 'Cleanup failed: ' + e.message });
  }
});

module.exports = router;
