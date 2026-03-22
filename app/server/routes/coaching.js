'use strict';

/**
 * COACHING ROUTE — H2 Oversight Layer Interface
 *
 * Handles coaching requests and submissions for the COACH model:
 *   - AI coaching: generates with K(t)/A(t) awareness
 *   - Human coaching: records as H2 training data (HO-3)
 *   - On-demand: manager requests help when stuck (IP-5: Graceful Escalation)
 */

const { Router } = require('express');
const sessionStore = require('../session/SessionStore');
const { generateCoaching } = require('../agents/coachAgent');

const router = Router();

/**
 * POST /api/coaching/request - Manager requests coaching (on-demand)
 * Body: { sessionId }
 */
router.post('/request', async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  const session = sessionStore.getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.config.coachType === 'none') {
    return res.status(400).json({ error: 'No coach configured for this session' });
  }

  if (session.config.coachType === 'ai') {
    try {
      // Generate coaching with COACH model state
      const coaching = await generateCoaching(
        session.transcript,
        session.initialChoice,
        session.exchangeCount,
        {
          knowledgeState: session.knowledgeState,
          coachingIntensity: session.coachingIntensity,
          learningVelocity: session.learningVelocity,
        }
      );

      const intervention = {
        content: coaching.coaching,
        source: 'ai',
        focus: coaching.focus,
        intensityLabel: sessionStore.getCoachingIntensityLabel(sessionId),
        timestamp: new Date().toISOString(),
      };

      sessionStore.addCoachingIntervention(sessionId, intervention);

      // Deliver via WebSocket
      sessionStore.sendToRole(sessionId, 'manager', {
        type: 'coaching_feedback',
        ...intervention,
      });

      return res.json({ status: 'delivered', coaching, intervention });
    } catch (err) {
      console.error('[POST /api/coaching/request] AI coach error:', err.message);
      return res.status(500).json({ error: 'Failed to generate AI coaching' });
    }
  }

  if (session.config.coachType === 'human') {
    // Notify H2 that H1 needs help (IP-5: Graceful Escalation)
    sessionStore.sendToRole(sessionId, 'coach', {
      type: 'coaching_requested',
      exchangeNumber: session.exchangeCount,
      timestamp: new Date().toISOString(),
      coachModelState: {
        knowledgeState: session.knowledgeState,
        coachingIntensity: session.coachingIntensity,
        learningVelocity: session.learningVelocity,
      },
    });

    return res.json({ status: 'waiting', message: 'Waiting for human coach feedback' });
  }
});

/**
 * POST /api/coaching/submit - Human coach (H2) submits feedback
 * Body: { sessionId, content } OR { sessionId, feedback }
 *
 * HO-3: Every human coaching intervention is logged with full context
 * as training data for the AI coach calibration layer.
 */
router.post('/submit', (req, res) => {
  const { sessionId } = req.body;
  const feedbackContent = req.body.content || req.body.feedback;

  if (!sessionId || !feedbackContent) {
    return res.status(400).json({ error: 'sessionId and content/feedback are required' });
  }

  const session = sessionStore.getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const intervention = {
    content: feedbackContent,
    source: 'human',
    timestamp: new Date().toISOString(),
    // HO-3: Capture full context for calibration layer
    context: {
      exchangeNumber: session.exchangeCount,
      knowledgeState: { ...session.knowledgeState },
      coachingIntensity: session.coachingIntensity,
      learningVelocity: session.learningVelocity,
      transcriptLength: session.transcript.length,
    },
  };

  sessionStore.addCoachingIntervention(sessionId, intervention);

  // Deliver to H1
  sessionStore.sendToRole(sessionId, 'manager', {
    type: 'coaching_feedback',
    content: feedbackContent,
    source: 'human',
    timestamp: intervention.timestamp,
  });

  res.json({ status: 'delivered', intervention });
});

/**
 * GET /api/coaching/:sessionId - Get all coaching interventions
 * Includes COACH model state at time of each intervention
 */
router.get('/:sessionId', (req, res) => {
  const session = sessionStore.getSession(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    sessionId: session.id,
    interventions: session.coachingInterventions,
    totalCount: session.coachingInterventions.length,
    currentIntensity: session.coachingIntensity,
    intensityLabel: sessionStore.getCoachingIntensityLabel(session.id),
  });
});

module.exports = router;
