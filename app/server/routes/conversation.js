'use strict';

const { Router } = require('express');
const conversationAgent = require('../agents/conversationAgent');

const router = Router();

router.post('/', async (req, res) => {
  const { message, conversationHistory } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const history = Array.isArray(conversationHistory)
    ? [...conversationHistory, { role: 'user', content: message }]
    : [{ role: 'user', content: message }];

  try {
    await conversationAgent.stream({ history, res });
  } catch (err) {
    console.error('[POST /api/conversation] Error:', err.message);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'An error occurred.' })}\n\n`);
  } finally {
    res.end();
  }
});

module.exports = router;
