'use strict';

/**
 * NEGOTIATION ROUTE — VidyaSpark Multi-Student Classroom Engine
 *
 * Core teaching loop:
 *   1. Ignator sends message -> recorded in transcript
 *   2. Classroom (5 AI students) responds -> streamed via SSE
 *   3. LLM Skill Judge evaluates teaching quality -> scores updated
 *   4. Student engagement states tracked
 *   5. Session data broadcast to admin/coach via WebSocket
 */

const { Router } = require('express');
const classroomAgent = require('../agents/classroomAgent');
const { generateCoaching } = require('../agents/coachAgent');
const sessionStore = require('../session/SessionStore');
const { evaluateSkills } = require('../agents/skillJudge');
const { loadModule } = require('../modules/ModuleRegistry');

const router = Router();


/**
 * GET /api/negotiation/start/:sessionId — Classroom opening scene
 */
router.get('/start/:sessionId', (req, res) => {
  const session = sessionStore.getSession(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const moduleId = session.scenarioId || 'abl-p7-force-pressure';
  const mod = loadModule(moduleId);

  const openingScene = (mod && mod.classroomConfig && mod.classroomConfig.openingScene)
    || (mod && mod.openingScene)
    || 'Welcome to the classroom. The students are waiting for you to begin.';

  const suggestedStarters = [
    'Good morning class! Today we have an exciting experiment.',
    'Who can tell me what they think will happen when I place this on the sheet?',
    'Let me show you something interesting. Watch carefully!',
  ];

  // Record opening scene once
  if (!session._classroomOpeningRecorded) {
    sessionStore.addTranscriptEntry(req.params.sessionId, {
      role: 'classroom',
      content: openingScene,
    });
    session._classroomOpeningRecorded = true;
  }

  res.json({ openingLine: openingScene, suggestedStarters });
});


/**
 * POST /api/negotiation/message — Ignator sends a teaching message
 * Streams classroom response via SSE
 */
router.post('/message', async (req, res) => {
  const { sessionId, message, conversationHistory, currentStep } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  const session = sessionStore.getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Record Ignator's message
  sessionStore.addTranscriptEntry(sessionId, {
    role: 'manager',
    content: message,
    currentStep: currentStep || 1,
  });

  // Broadcast to coach dashboard
  sessionStore.sendToRole(sessionId, 'coach', {
    type: 'transcript_update',
    entry: { role: 'manager', content: message, timestamp: new Date().toISOString() },
    exchangeCount: session.exchangeCount,
  });

  // Build conversation history for classroom agent
  const historyForAgent = Array.isArray(conversationHistory)
    ? [...conversationHistory, { role: 'user', content: message }]
    : (session.transcript || []).map(t => ({
        role: t.role === 'manager' ? 'user' : 'assistant',
        content: t.content,
      }));

  // Ensure last message is the user's
  if (!historyForAgent.length || historyForAgent[historyForAgent.length - 1].role !== 'user') {
    historyForAgent.push({ role: 'user', content: message });
  }

  const moduleId = session.scenarioId || 'abl-p7-force-pressure';

  try {
    // Stream classroom response
    const fullText = await classroomAgent.stream({
      history: historyForAgent,
      difficulty: session.config?.difficulty || 'medium',
      moduleId,
      currentStep: currentStep || 1,
      res,
    });

    // Record classroom response
    sessionStore.addTranscriptEntry(sessionId, {
      role: 'classroom',
      content: fullText,
      currentStep: currentStep || 1,
    });

    // Broadcast to coach
    sessionStore.sendToRole(sessionId, 'coach', {
      type: 'transcript_update',
      entry: { role: 'classroom', content: fullText, timestamp: new Date().toISOString() },
      exchangeCount: session.exchangeCount,
    });

    // Update knowledge state
    try {
      sessionStore.updateKnowledgeState(sessionId, message, fullText);
    } catch (_) {}

    // Adapt coaching intensity
    try {
      sessionStore.adaptCoachingIntensity(sessionId);
    } catch (_) {}

    // Evaluate teaching skills via LLM Judge
    const mod = loadModule(moduleId);
    const dimensions = mod?.dimensions || null;
    let judgeResult = null;
    try {
      judgeResult = await evaluateSkills(
        session.transcript,
        session.gammaSkills || mod?.skills || [],
        dimensions,
        {
          exchangeCount: session.exchangeCount,
          messageQuality: { quality: 'normal', penalty: 0 },
          totalManagerMessages: session.transcript.filter(t => t.role === 'manager').length,
          moduleId,
        }
      );
      sessionStore.updateSkillScores(sessionId, judgeResult);
    } catch (judgeErr) {
      console.error('[negotiation] Skill judge failed:', judgeErr.message);
    }

    // Send metadata
    res.write('data: ' + JSON.stringify({
      type: 'done',
      exchangeCount: session.exchangeCount,
      skillScores: session.skillScores || {},
      compositeScore: sessionStore.computeCompositeScore?.(sessionId) || 0,
    }) + '\n\n');

    // Send to coach dashboard
    sessionStore.sendToRole(sessionId, 'coach', {
      type: 'coach_model_update',
      exchangeCount: session.exchangeCount,
      skillScores: session.skillScores || {},
    });

  } catch (err) {
    console.error('[POST /api/negotiation/message] Error:', err.message);
    console.error('[POST /api/negotiation/message] Stack:', err.stack);
    // Send error as a visible student response so user sees something
    res.write('data: ' + JSON.stringify({ type: 'token', token: '[System]: The classroom encountered an issue. Error: ' + err.message + '. Please try again.' }) + '\n\n');
    res.write('data: ' + JSON.stringify({ type: 'done', exchangeCount: 0 }) + '\n\n');
  } finally {
    res.end();
  }
});


// Keep the legacy POST / route as alias
router.post('/', async (req, res) => {
  // Redirect to /message handler
  req.url = '/message';
  return router.handle(req, res);
});


module.exports = router;
