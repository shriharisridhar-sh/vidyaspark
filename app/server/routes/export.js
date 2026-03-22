'use strict';

/**
 * EXPORT ROUTE — COACH 2.0 Research Data Export
 *
 * Exports the full session with COACH 2.0 metrics:
 *   - S_i(t) skill score trajectories (LLM-judged)
 *   - Y = composite score (Gamma-weighted)
 *   - Archetype classification
 *   - Legacy K(t), A(t) trajectories (backward compat)
 *   - Research-grade computed metrics
 */

const { Router } = require('express');
const sessionStore = require('../session/SessionStore');
const { computeSessionMetrics } = require('../utils/metrics');
const { generateSessionPDF } = require('../utils/pdfReport');

const router = Router();

/**
 * GET /api/export/:sessionId
 *
 * Exports the full session as structured JSON for research analysis.
 * Includes: config, transcript, coaching interventions, report,
 *           COACH model state, and computed metrics.
 */
router.get('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessionStore.getSession(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // exportSession() now includes coachModelMetrics
  const exported = sessionStore.exportSession(sessionId);

  // Compute research metrics
  const metrics = computeSessionMetrics({
    transcript: session.transcript,
    coachingInterventions: session.coachingInterventions,
    knowledgeState: session.knowledgeState,
    knowledgeHistory: session.knowledgeHistory,
    intensityHistory: session.intensityHistory,
    dimensionEngagement: session.dimensionEngagement,
    config: session.config,
  });

  const payload = {
    exportedAt: new Date().toISOString(),
    version: '3.0',          // COACH model version
    modelVersion: 'COACH-2.0',
    ...exported,
    computedMetrics: metrics,
  };

  // Set headers for file download
  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="session-' + sessionId + '.json"'
  );

  return res.json(payload);
});

/**
 * GET /api/export/:sessionId/pdf
 *
 * Generates and returns an individualized 2-page PDF performance report.
 * Used by instructors to download and email to participants.
 */
router.get('/:sessionId/pdf', async (req, res) => {
  const { sessionId } = req.params;
  const session = sessionStore.getSession(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    const exported = sessionStore.exportSession(sessionId);
    const reportData = session.report || {};

    const moduleId = session.scenarioId || exported?.coachModelMetrics?.scenarioId || 'price-war';
    const pdfBuffer = await generateSessionPDF(exported, reportData, moduleId);

    const safeName = (session.userName || 'participant').replace(/[^a-zA-Z0-9]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="coequal-report-' + safeName + '.pdf"'
    );
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('[PDF Export] Error generating PDF:', err.message);
    return res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router;
