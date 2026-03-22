const express = require('express');
const router = express.Router();
const { streamIntakeConversation, streamModuleGeneration } = require('../agents/moduleBuilderAgent');
const moduleStore = require('../modules/ModuleStore');
const { listModules, loadModule } = require('../modules/ModuleRegistry');

// SSE headers helper
function sseHeaders(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
}

// Phase 1->2: Begin intake conversation
router.post('/intake/begin', (req, res) => {
  sseHeaders(res);
  const { frustrationText } = req.body;
  const conversationHistory = [
    { role: 'user', content: frustrationText }
  ];
  streamIntakeConversation(conversationHistory, res);
});

// Phase 2 refinement
router.post('/intake/refine', (req, res) => {
  sseHeaders(res);
  const { conversationHistory } = req.body;
  streamIntakeConversation(conversationHistory, res);
});

// Phase 3->4: Generate full module
router.post('/generate', (req, res) => {
  sseHeaders(res);
  const { moduleIntake } = req.body;
  streamModuleGeneration(moduleIntake, res);
});

// Save completed module
router.post('/save', (req, res) => {
  try {
    const module = req.body;
    if (!module.id) {
      module.id = 'module-' + Date.now();
    }
    module.createdAt = module.createdAt || new Date().toISOString();
    module.updatedAt = new Date().toISOString();
    const saved = moduleStore.save(module);
    res.json({ success: true, module: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List available simulation modules (scenarios with module.json packages)
router.get('/available', (req, res) => {
  try {
    const modules = listModules();
    res.json({ modules });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get full module config from a scenario package
router.get('/config/:moduleId', (req, res) => {
  try {
    const mod = loadModule(req.params.moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found' });
    res.json({ module: mod });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all modules
router.get('/', (req, res) => {
  try {
    const modules = moduleStore.readAll();
    res.json({ modules });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single module (check scenario registry first, then moduleStore)
router.get('/:id', (req, res) => {
  try {
    // First try the scenario registry (ABL modules)
    const scenarioMod = loadModule(req.params.id);
    if (scenarioMod) return res.json(scenarioMod);

    // Fall back to moduleStore (user-created modules)
    const module = moduleStore.getById(req.params.id);
    if (!module) return res.status(404).json({ error: 'Module not found' });
    res.json({ module });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete module
router.delete('/:id', (req, res) => {
  try {
    moduleStore.remove(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
