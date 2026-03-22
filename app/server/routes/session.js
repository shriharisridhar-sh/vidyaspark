'use strict';

const { Router } = require('express');
const sessionStore = require('../session/SessionStore');
const sessionArchive = require('../session/SessionArchive');
const database = require('../db/database');
const { optionalAuth } = require('../middleware/auth');

const router = Router();

/**
 * POST /api/session - Create a new session
 * Body: { coachType, coachingCadence, coachingInterval, difficulty }
 */
router.post('/', optionalAuth, (req, res) => {
  const { coachType, coachingCadence, coachingInterval, difficulty, userName, userGroup, scenarioId } = req.body;

  if (coachType && !['none', 'human', 'ai'].includes(coachType)) {
    return res.status(400).json({ error: 'coachType must be none, human, or ai' });
  }
  if (coachingCadence && !['between_rounds', 'real_time', 'on_demand'].includes(coachingCadence)) {
    return res.status(400).json({ error: 'Invalid coachingCadence' });
  }
  if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({ error: 'difficulty must be easy, medium, or hard' });
  }

  const session = sessionStore.createSession({
    coachType: coachType || 'none',
    coachingCadence: coachingCadence || 'between_rounds',
    coachingInterval: coachingInterval || 3,
    userName: userName || null,
    userGroup: userGroup || null,
    difficulty: difficulty || 'medium',
    scenarioId: scenarioId || 'abl-p7-force-pressure',
    userId: req.user ? req.user.id : null,
  });

  res.status(201).json({
    sessionId: session.id,
    joinCode: session.joinCode,
    config: session.config,
    state: session.state,
    scenarioWeights: session.scenarioWeights,
  });
});


/**
 * POST /api/session/:id/postsurvey — Post-simulation self-assessment (Feature 7)
 * Body: { informationAsymmetry, dimensionPrioritization, competitiveMapping, overallPerformance, renewalConfidence }
 *
 * COACH Model: Captures perceived outcome Y-hat for calibration gap analysis.
 * Y-hat = weighted average of concept self-ratings using omega = {0.35, 0.35, 0.30}
 */
/**
 * POST /api/session/:id/postsurvey — Simplified self-assessment (Discovery Model)
 * Body: { discoveryRating } — single 1-10: "How well did you discover what they value?"
 * Also accepts legacy format with informationAsymmetry etc. for backward compatibility.
 */
router.post('/:id/postsurvey', (req, res) => {
  const session = sessionStore.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const {
    discoveryRating,
    informationAsymmetry,
    dimensionPrioritization,
    competitiveMapping,
    overallPerformance,
    renewalConfidence,
  } = req.body;

  const { weightPrediction } = req.body;

  if (discoveryRating != null) {
    session.postSurvey = {
      discoveryRating: discoveryRating,
      weightPrediction: weightPrediction || null,
      timestamp: new Date().toISOString(),
    };
    session.perceivedScore = Math.round(discoveryRating * 10);
    if (weightPrediction) session.weightPrediction = weightPrediction;
  } else {
    // Legacy format
    session.postSurvey = {
      informationAsymmetry: informationAsymmetry || 5,
      dimensionPrioritization: dimensionPrioritization || 5,
      competitiveMapping: competitiveMapping || 5,
      overallPerformance: overallPerformance || 50,
      renewalConfidence: renewalConfidence || 5,
      timestamp: new Date().toISOString(),
    };
    const yHat = Math.round(
      (0.35 * ((informationAsymmetry || 5) / 10) +
       0.35 * ((dimensionPrioritization || 5) / 10) +
       0.30 * ((competitiveMapping || 5) / 10)) * 100
    );
    session.perceivedScore = yHat;
  }

  // Re-archive to capture postSurvey + weightPrediction (archive happens at session end, before postsurvey)
  const existing = sessionArchive.getById(req.params.id);
  if (existing) {
    existing.postSurvey = session.postSurvey;
    existing.perceivedScore = session.perceivedScore;
    existing.weightPrediction = session.weightPrediction || null;
    sessionArchive._save();
  }

  return res.json({
    status: 'ok',
    perceivedScore: session.perceivedScore,
    objectiveScore: sessionStore.computeObjectiveScore(req.params.id),
  });
});

/**
 * GET /api/session/archive — List archived sessions (Feature 6)
 * Query: ?coachType=none&difficulty=medium
 */
router.get('/archive', (req, res) => {
  // Note: this must be defined before /:id to avoid route conflicts
  // Actually in Express, we need to handle this carefully.
  // We'll use a separate path check.
  const { coachType, difficulty } = req.query;
  const results = sessionArchive.getAll({ coachType, difficulty });
  res.json({
    count: results.length,
    sessions: results.map(s => ({
      sessionId: s.sessionId,
      timestamp: s.timestamp,
      config: s.config,
      objectiveScore: s.objectiveScore,
      perceivedScore: s.perceivedScore,
      exchangeCount: s.exchangeCount,
      transcriptLength: s.transcriptLength,
      coachingCount: s.coachingCount,
    })),
  });
});

/**
 * GET /api/session/archive/comparison — Comparison data for ROI view (Feature 3)
 * Query: ?difficulty=medium
 */
router.get('/archive/comparison', (req, res) => {
  const { difficulty } = req.query;
  const data = sessionArchive.getComparisonData(difficulty || null);
  res.json(data);
});

/**
 * GET /api/session/archive/:sessionId — Get one archived session
 */
router.get('/archive/:sessionId', (req, res) => {
  const archived = sessionArchive.getById(req.params.sessionId);
  if (!archived) {
    return res.status(404).json({ error: 'Archived session not found' });
  }
  res.json(archived);
});

// ══════════════════════════════════════════════════════════════
// DATABASE-BACKED ENDPOINTS (persistent storage)
// Must be defined before /:id to avoid Express route conflicts
// ══════════════════════════════════════════════════════════════

router.get('/db/stats', async (req, res) => {
  try {
    const total = await database.getSessionCount();
    const all = await database.getAllSessions();
    const coached = all.filter(s => s.config.coachType === 'ai');
    const solo = all.filter(s => s.config.coachType === 'none');
    const mean = arr => arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0;
    res.json({
      totalSessions: total,
      coachedSessions: coached.length,
      soloSessions: solo.length,
      avgScoreCoached: mean(coached.map(s => s.objectiveScore)),
      avgScoreSolo: mean(solo.map(s => s.objectiveScore)),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/db/all', async (req, res) => {
  try {
    const { coachType, difficulty, userName } = req.query;
    const sessions = await database.getAllSessions({ coachType, difficulty, userName });
    res.json({ sessions, count: sessions.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/db/comparison', async (req, res) => {
  try {
    const { difficulty } = req.query;
    const data = await database.getComparisonData(difficulty || null);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/db/migrate', async (req, res) => {
  try {
    const count = await database.migrateFromArchive();
    const total = await database.getSessionCount();
    res.json({ migrated: count, totalInDb: total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/db/:sessionId', async (req, res) => {
  try {
    const session = await database.getSessionById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found in database' });
    res.json(session);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * GET /api/session/:id - Get session state
 */
router.get('/:id', (req, res) => {
  const session = sessionStore.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    sessionId: session.id,
    joinCode: session.joinCode,
    config: session.config,
    state: session.state,
    exchangeCount: session.exchangeCount,
    initialChoice: session.initialChoice,
    coachConnected: !!(session._coachWs && session._coachWs.readyState === 1),
    metadata: {
      createdAt: session.createdAt,
      startTime: session.metadata && session.metadata.startTime || null,
      pauseCount: session.metadata && session.metadata.pauseCount || 0,
    },
    scenarioWeights: session.scenarioWeights || null,
  });
});

/**
 * POST /api/session/:id/join - Coach joins via join code
 * Body: { joinCode }
 */
router.post('/:id/join', (req, res) => {
  const { joinCode } = req.body;
  if (!joinCode) {
    return res.status(400).json({ error: 'joinCode is required' });
  }

  const session = sessionStore.getByJoinCode(joinCode);
  if (!session) {
    return res.status(404).json({ error: 'Invalid join code' });
  }

  // Admin can join any session regardless of coachType
  res.json({
    sessionId: session.id,
    config: session.config,
    state: session.state,
    exchangeCount: session.exchangeCount,
  });
});

/**
 * POST /api/session/join - Coach joins via join code (alternative endpoint)
 * Body: { joinCode }
 */
router.post('/join', (req, res) => {
  const { joinCode } = req.body;
  if (!joinCode) {
    return res.status(400).json({ error: 'joinCode is required' });
  }

  const session = sessionStore.getByJoinCode(joinCode);
  if (!session) {
    return res.status(404).json({ error: 'Invalid join code' });
  }

  // Admin can join any session regardless of coachType
  res.json({
    sessionId: session.id,
    config: session.config,
    state: session.state,
    exchangeCount: session.exchangeCount,
  });
});

/**
 * POST /api/session/:id/briefing - Set initial choice and move to active
 * Body: { initialChoice, otherApproach? }
 */
router.post('/:id/briefing', (req, res) => {
  const session = sessionStore.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { initialChoice, otherApproach } = req.body;
  if (!initialChoice) {
    return res.status(400).json({ error: 'initialChoice is required' });
  }

  sessionStore.setInitialChoice(req.params.id, initialChoice, otherApproach);
  sessionStore.updateState(req.params.id, 'active');

  res.json({ sessionId: session.id, state: 'active', initialChoice });
});

/**
 * POST /api/session/:id/mentor-request - Request human mentor review
 * Body: { mentorRequested: true }
 */
router.post('/:id/mentor-request', (req, res) => {
  const session = sessionStore.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (!session.metadata) session.metadata = {};
  session.metadata.mentorRequested = {
    requested: true,
    timestamp: new Date().toISOString(),
  };

  // Notify coach via WebSocket if connected
  sessionStore.sendToRole(req.params.id, 'coach', {
    type: 'mentor_review_requested',
    sessionId: session.id,
    timestamp: new Date().toISOString(),
  });

  res.json({ status: 'ok', mentorRequested: true });
});

/**
 * POST /api/session/:id/end - End the session
 */
router.post('/:id/end', (req, res) => {
  const session = sessionStore.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  sessionStore.updateState(req.params.id, 'ended');
  sessionStore.broadcast(req.params.id, {
    type: 'session_state_change',
    state: 'ended',
    reason: 'session_ended',
  });

  res.json({
    sessionId: session.id,
    state: 'ended',
    exchangeCount: session.exchangeCount,
  });
});

/**
 * POST /api/session/:id/quiz - Store quiz results for research data
 * Body: { answers, timestamp }
 */
/**
 * POST /api/session/:id/presurvey
 * Body: { experience, analyticalStyle, confidence, priorFrameworks }
 *
 * COACH Model: Captures H1 primitives (alpha) and calibrates:
 *   K(0): Initial knowledge state per dimension
 *   A(0): Initial coaching intensity
 *   r_bar: Target learning rate (adjusted for experience)
 */
router.post('/:id/presurvey', (req, res) => {
  const session = sessionStore.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { experience, analyticalStyle, confidence, priorFrameworks } = req.body;

  // Store raw survey data for research
  session.preSurvey = {
    experience,
    analyticalStyle,
    confidence,
    priorFrameworks,
    timestamp: new Date().toISOString(),
  };

  // Alpha values for each primitive (maps survey answers to [0,1])
  const alphaMap = {
    experience: { none: 0.1, junior: 0.3, mid: 0.5, senior: 0.7 },
    analyticalStyle: { intuitive: 0.2, mixed: 0.4, structured: 0.6, analytical: 0.8 },
    confidence: { low: 0.2, moderate: 0.4, high: 0.6, very_high: 0.8 },
    priorFrameworks: { none: 0.1, aware: 0.3, used: 0.5, expert: 0.7 },
  };

  const alpha = {
    experience: alphaMap.experience[experience] || 0.3,
    analyticalStyle: alphaMap.analyticalStyle[analyticalStyle] || 0.4,
    confidence: alphaMap.confidence[confidence] || 0.4,
    priorFrameworks: alphaMap.priorFrameworks[priorFrameworks] || 0.3,
  };

  session.alphaPrimitives = alpha;

  // Calibrate K(0) using randomized visibility from session weights
  const frameworkBoost = alpha.priorFrameworks * 0.15;
  const experienceBoost = alpha.experience * 0.1;
  const vis = session.scenarioWeights?.visibility || {};
  const dims = ['reliability', 'hse', 'technical', 'service', 'price'];
  const newK = {};
  dims.forEach(dim => {
    let base = vis[dim] === 'decoy' ? 0.4 : vis[dim] === 'obvious' ? 0.15 : 0.1;
    if (dim !== 'price') base += frameworkBoost + (dim === 'reliability' || dim === 'technical' ? experienceBoost : 0);
    newK[dim] = base;
  });
  session.knowledgeState = newK;

  // Calibrate A(0): less confident learners get more coaching
  // Higher alpha -> lower initial coaching intensity (they need less help)
  const avgAlpha = (alpha.experience + alpha.analyticalStyle + alpha.confidence + alpha.priorFrameworks) / 4;
  session.coachingIntensity = Math.max(0.2, 0.5 - avgAlpha * 0.3);

  return res.json({
    status: 'ok',
    alphaPrimitives: alpha,
    calibratedK0: session.knowledgeState,
    calibratedA0: session.coachingIntensity,
  });
});

router.post('/:id/quiz', (req, res) => {
  const session = sessionStore.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { answers, timestamp } = req.body;
  // Store quiz data in session metadata
  if (!session.metadata) session.metadata = {};
  session.metadata.quizResults = { answers, timestamp, completedAt: new Date().toISOString() };

  res.json({ sessionId: session.id, quizStored: true });
});

/**
 * POST /api/session/:id/debrief-viewed - Track debrief completion
 * Body: { timestamp }
 */
router.post('/:id/debrief-viewed', (req, res) => {
  const session = sessionStore.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { timestamp } = req.body;
  if (!session.metadata) session.metadata = {};
  session.metadata.debriefViewed = { timestamp, viewedAt: new Date().toISOString() };

  res.json({ sessionId: session.id, debriefTracked: true });
});

/**
 * POST /api/session/:id/priority-prediction — Pre-negotiation priority prediction
 * Body: { priorityPrediction: { first: 'price', second: 'reliability' } }
 *
 * Captures the learner's "before" mental model of what the customer values most.
 * Used in debrief for calibration comparison: "You predicted X was #1, it was actually Y."
 */
router.post('/:id/priority-prediction', (req, res) => {
  const session = sessionStore.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { priorityPrediction } = req.body;
  if (!priorityPrediction || !priorityPrediction.first) {
    return res.status(400).json({ error: 'priorityPrediction.first is required' });
  }

  // Store on session for use in debrief/report
  session.priorityPrediction = {
    first: priorityPrediction.first,
    second: priorityPrediction.second || null,
    timestamp: new Date().toISOString(),
  };

  res.json({
    sessionId: session.id,
    priorityPrediction: session.priorityPrediction,
  });
});

/**
 * POST /api/session/:id/reflection - Save post-reveal reflection
 * Body: { reflection, timestamp }
 */
router.post('/:id/reflection', (req, res) => {
  const session = sessionStore.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { reflection, timestamp } = req.body;
  if (!reflection) {
    return res.status(400).json({ error: 'reflection text is required' });
  }

  if (!session.metadata) session.metadata = {};
  session.metadata.reflection = {
    text: reflection,
    timestamp,
    savedAt: new Date().toISOString(),
  };

  // Update archive if it exists
  const existing = sessionArchive.getById(req.params.id);
  if (existing) {
    if (!existing.metadata) existing.metadata = {};
    existing.metadata = { ...existing.metadata, reflection: session.metadata.reflection };
    sessionArchive._save();
  }

  res.json({ sessionId: session.id, reflectionSaved: true });
});

/**
 * GET /api/session/:id/export - Export full session data
 */
router.get('/:id/export', (req, res) => {
  const exported = sessionStore.exportSession(req.params.id);
  if (!exported) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(exported);
});


module.exports = router;
