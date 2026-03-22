'use strict';

const { Router } = require('express');
const scenarioStore = require('../scenarios/ScenarioStore');
const { streamDesignResponse } = require('../agents/scenarioDesignAgent');

const router = Router();

/**
 * POST /api/scenarios/design — SSE streaming Socratic design conversation
 */
router.post('/design', async (req, res) => {
  const { conversationHistory = [] } = req.body;

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  try {
    await streamDesignResponse(conversationHistory, res);
  } catch (err) {
    console.error('[POST /api/scenarios/design] Error:', err.message);
    res.write('data: ' + JSON.stringify({ type: 'error', message: err.message }) + '\n\n');
    res.end();
  }
});

/**
 * POST /api/scenarios — Save a finalized scenario
 */
router.post('/', (req, res) => {
  const { scenario } = req.body;

  if (!scenario || !scenario.id || !scenario.name) {
    return res.status(400).json({ error: 'scenario with id and name is required' });
  }

  const saved = scenarioStore.saveScenario(scenario);
  res.status(201).json({ scenario: saved });
});

/**
 * GET /api/scenarios — List all custom scenarios
 */
router.get('/', (_req, res) => {
  const scenarios = scenarioStore.getAll();
  res.json({
    scenarios,
    count: scenarios.length,
  });
});

/**
 * GET /api/scenarios/:id — Get a single scenario
 */
router.get('/:id', (req, res) => {
  const scenario = scenarioStore.getById(req.params.id);
  if (!scenario) {
    return res.status(404).json({ error: 'Scenario not found' });
  }
  res.json({ scenario });
});

/**
 * DELETE /api/scenarios/:id — Delete a scenario
 */
router.delete('/:id', (req, res) => {
  const deleted = scenarioStore.deleteById(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Scenario not found' });
  }
  res.json({ deleted: true });
});

module.exports = router;
