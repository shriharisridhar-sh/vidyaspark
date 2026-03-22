'use strict';

/**
 * REPORT ROUTE — COACH Model Outcome Functions
 *
 * Generates the post-simulation diagnostic report:
 *   Y = objective score from K(T) trajectory
 *   Framework teaching (LP-5: retrospective lens)
 *   Coaching impact from A(t) trajectory
 */

const { Router } = require('express');
const { generateReport, generateLegacyReport } = require('../agents/reportAgent');
const { buildCalibrationGap } = require('../prompts/reportPrompts');
const { generateAnnotations } = require('../agents/annotationAgent');
const sessionStore = require('../session/SessionStore');

const router = Router();

/**
 * POST /api/report
 *
 * Supports two modes:
 * 1. Session-based: { sessionId } — pulls all data including COACH model state
 * 2. Legacy: { initialChoice, conversationHistory }
 */
router.post('/', async (req, res) => {
  const { sessionId, initialChoice, otherApproach, conversationHistory } = req.body;

  try {
    let report;

    if (sessionId) {
      // Session-based mode — includes COACH model state
      const session = sessionStore.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const moduleId = session.scenarioId || 'abl-p7-force-pressure';

      // Pass full COACH model state to report generator
      report = await generateReport({
        moduleId: moduleId,
        initialChoice: session.initialChoice,
        transcript: session.transcript,
        coachingInterventions: session.coachingInterventions,
        config: session.config,
        knowledgeState: session.knowledgeState,
        knowledgeHistory: session.knowledgeHistory,
        coachingIntensity: session.coachingIntensity,
        learningVelocity: session.learningVelocity,
        dimensionEngagement: session.dimensionEngagement,
        scenarioWeights: session.scenarioWeights,
        weightPrediction: session.weightPrediction,
      });

      // COACH 2.0: Use composite score (falls back to legacy objective score)
      const objectiveY = sessionStore.computeCompositeScore(sessionId) || sessionStore.computeObjectiveScore(sessionId);
      if (report) {
        report.coachModelScore = objectiveY;
        report.scenarioWeights = session.scenarioWeights;
        report.weightPrediction = session.weightPrediction;
      }

      // Compute calibration gap (Feature 7: Ŷ vs Y)
      if (session.postSurvey && session.perceivedScore != null) {
        report.calibrationGap = buildCalibrationGap(session, objectiveY);
      }

      // COACH 2.0: Add Gamma-driven skill data to report
      report.skillScores = { ...session.skillScores };
      report.gammaSkills = session.gammaSkills;
      report.compositeScore = sessionStore.computeCompositeScore(sessionId);
      report.archetype = sessionStore.computeArchetype(sessionId);
      report.overallScore = sessionStore.computeCompositeScore(sessionId);

      // Legacy: Add discovery/persuasion breakdown (backward compat)
      report.discoveryScore = sessionStore.computeDiscoveryScore(sessionId);
      report.persuasionScore = sessionStore.computePersuasionScore(sessionId);
      report.mindsetShift = {
        initial: 0.15,
        final: session.mindsetState || 0.15,
        evidenceUsed: (session.usedPackets || []).length,
        summary: (session.mindsetState || 0.15) >= 0.5
          ? 'The customer shifted from a price-focused mindset to considering broader value.'
          : (session.mindsetState || 0.15) >= 0.3
            ? 'The customer began to consider factors beyond price, but wasn\'t fully convinced.'
            : 'The customer remained primarily focused on price throughout the conversation.',
      };

      // Store report in session
      sessionStore.setReport(sessionId, report);
    } else {
      // Legacy mode
      if (!initialChoice) {
        return res.status(400).json({ error: 'initialChoice or sessionId is required' });
      }
      if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) {
        return res.status(400).json({ error: 'conversationHistory is required' });
      }

      report = await generateLegacyReport(conversationHistory, initialChoice);
    }

    return res.json({ report });
  } catch (err) {
    console.error('[POST /api/report] Error:', err.message);
    return res.status(500).json({ error: 'Failed to generate report', details: err.message });
  }
});

/**
 * POST /api/report/:sessionId/annotations
 *
 * Generate AI-powered per-exchange annotations for a completed session.
 * Caches results in session.annotations for subsequent requests.
 */
router.post('/:sessionId/annotations', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = sessionStore.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Return cached annotations if available
    if (session.annotations && session.annotations.length > 0) {
      return res.json({
        annotations: session.annotations,
        cached: true,
      });
    }

    // Generate new annotations
    const annotations = await generateAnnotations({
      transcript: session.transcript,
      knowledgeHistory: session.knowledgeHistory,
      coachingInterventions: session.coachingInterventions,
      config: session.config,
    });

    // Cache in session
    session.annotations = annotations;

    return res.json({
      annotations,
      cached: false,
    });
  } catch (err) {
    console.error('[POST /api/report/:sessionId/annotations] Error:', err.message);
    return res.status(500).json({ error: 'Failed to generate annotations', details: err.message });
  }
});

/**
 * GET /api/report/:sessionId/download — Download PDF report
 *
 * Generates a PDF version of the teaching performance report.
 * Falls back to a JSON download if pdfReport utility is not available.
 */
router.get('/:sessionId/download', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = sessionStore.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const report = session.report;
    if (!report) {
      return res.status(400).json({ error: 'No report available for this session. Generate a report first.' });
    }

    // Try to use pdfReport utility if available
    let pdfReport;
    try {
      pdfReport = require('../utils/pdfReport');
    } catch (_) {
      // pdfReport not available — fall back to JSON download
    }

    if (pdfReport && typeof pdfReport.generateSessionPDF === 'function') {
      const exported = sessionStore.exportSession(sessionId);
      const moduleId = session.scenarioId || 'abl-p7-force-pressure';
      const pdfBuffer = await pdfReport.generateSessionPDF(exported, report, moduleId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="VidyaSpark-Report-${sessionId.slice(0, 8)}.pdf"`);
      return res.send(pdfBuffer);
    }

    // Fallback: return report as JSON download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="VidyaSpark-Report-${sessionId.slice(0, 8)}.json"`);
    return res.json({
      sessionId,
      generatedAt: new Date().toISOString(),
      ...report,
    });
  } catch (err) {
    console.error('[GET /api/report/:sessionId/download] Error:', err.message);
    return res.status(500).json({ error: 'Failed to generate PDF', details: err.message });
  }
});

module.exports = router;
