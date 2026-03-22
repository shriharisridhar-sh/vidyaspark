'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const database = require('../db/database');
const { loadModule, listModules } = require('../modules/ModuleRegistry');

const router = Router();

/**
 * GET /api/dashboard - Get authenticated user's dashboard data
 * Returns: user, cohorts, available modules with progress, sessions
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's cohorts and allowed modules
    const cohorts = database.getUserCohorts(userId);

    // Admins see ALL modules; regular users see only their cohort modules
    const moduleIds = req.user.role === 'admin'
      ? listModules().map(m => m.id)
      : database.getUserModuleIds(userId);

    // Get user's completed sessions from database
    const sessions = database.getUserSessions(userId);

    // Build module progress data
    const modules = moduleIds.map(moduleId => {
      const mod = loadModule(moduleId);
      const moduleSessions = sessions.filter(s => s.scenarioId === moduleId);
      const completed = moduleSessions.length > 0;
      const scores = moduleSessions.map(s => s.compositeScore || s.objectiveScore || 0);
      const bestScore = scores.length > 0 ? Math.max(...scores) : null;
      const lastPlayed = moduleSessions.length > 0 ? moduleSessions[0].timestamp : null;

      return {
        id: moduleId,
        name: mod ? mod.name : moduleId,
        description: mod ? mod.description : '',
        completed,
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

module.exports = router;
