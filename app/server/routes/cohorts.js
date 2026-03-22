'use strict';

const crypto = require('crypto');
const { Router } = require('express');
const { requireAuth, requireAdmin, generateToken, setAuthCookie } = require('../middleware/auth');
const database = require('../db/database');

const router = Router();

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

function isAdmin(email) {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * POST /api/cohorts - Create a new cohort (admin only)
 * Body: { name, description, code, moduleIds }
 */
router.post('/', requireAdmin, (req, res) => {
  try {
    const { name, description, moduleIds } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    // Auto-generate a unique 6-char uppercase code if not provided
    let code = req.body.code;
    if (!code) {
      code = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
        + crypto.randomUUID().slice(0, 2).toUpperCase();
    }

    const existing = database.getCohortByCode(code);
    if (existing) {
      // Append random chars to make unique
      code = code.slice(0, 4) + crypto.randomUUID().slice(0, 4).toUpperCase();
    }

    const cohortId = crypto.randomUUID();
    database.createCohort(cohortId, name, description || '', code, req.user.id);

    if (moduleIds && moduleIds.length > 0) {
      database.addCohortModules(cohortId, moduleIds);
    }

    const modules = database.getCohortModules(cohortId);

    res.status(201).json({
      cohort: { id: cohortId, name, description, code: code.toUpperCase(), created_by: req.user.id },
      modules,
    });
  } catch (e) {
    console.error('[Cohorts] Create error:', e.message);
    res.status(500).json({ error: 'Failed to create cohort' });
  }
});

/**
 * GET /api/cohorts - List all cohorts (admin only)
 */
router.get('/', requireAdmin, (req, res) => {
  try {
    const cohorts = database.getAllCohorts();
    const result = cohorts.map(c => ({
      ...c,
      modules: database.getCohortModules(c.id),
      memberCount: database.getCohortMembers(c.id).length,
    }));
    res.json({ cohorts: result });
  } catch (e) {
    console.error('[Cohorts] List error:', e.message);
    res.status(500).json({ error: 'Failed to list cohorts' });
  }
});

/**
 * GET /api/cohorts/by-code/:code - Get public info about a cohort by code
 * No auth required (used on join page).
 */
router.get('/by-code/:code', (req, res) => {
  try {
    const cohort = database.getCohortByCode(req.params.code);
    if (!cohort) {
      return res.status(404).json({ error: 'Cohort not found' });
    }

    const modules = database.getCohortModules(cohort.id);

    res.json({
      name: cohort.name,
      description: cohort.description,
      moduleCount: modules.length,
    });
  } catch (e) {
    console.error('[Cohorts] Lookup error:', e.message);
    res.status(500).json({ error: 'Failed to look up cohort' });
  }
});

/**
 * GET /api/cohorts/:id - Get cohort details (admin only)
 */
router.get('/:id', requireAdmin, (req, res) => {
  try {
    const cohort = database.getCohortById(req.params.id);
    if (!cohort) {
      return res.status(404).json({ error: 'Cohort not found' });
    }

    const modules = database.getCohortModules(cohort.id);
    const members = database.getCohortMembers(cohort.id);

    res.json({ cohort, modules, members });
  } catch (e) {
    console.error('[Cohorts] Get error:', e.message);
    res.status(500).json({ error: 'Failed to get cohort' });
  }
});

/**
 * PUT /api/cohorts/:id - Update cohort (admin only)
 * Body: { name, description, moduleIds }
 */
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const cohort = database.getCohortById(req.params.id);
    if (!cohort) {
      return res.status(404).json({ error: 'Cohort not found' });
    }

    const { name, description, moduleIds } = req.body;
    database.updateCohort(req.params.id, name || cohort.name, description !== undefined ? description : cohort.description);

    if (moduleIds) {
      database.removeCohortModules(req.params.id);
      if (moduleIds.length > 0) {
        database.addCohortModules(req.params.id, moduleIds);
      }
    }

    const modules = database.getCohortModules(req.params.id);
    res.json({ cohort: { ...cohort, name: name || cohort.name, description: description !== undefined ? description : cohort.description }, modules });
  } catch (e) {
    console.error('[Cohorts] Update error:', e.message);
    res.status(500).json({ error: 'Failed to update cohort' });
  }
});

/**
 * DELETE /api/cohorts/:id - Delete cohort (admin only)
 */
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const cohort = database.getCohortById(req.params.id);
    if (!cohort) {
      return res.status(404).json({ error: 'Cohort not found' });
    }

    if (cohort.is_public) {
      return res.status(400).json({ error: 'Cannot delete the public cohort' });
    }

    database.deleteCohort(req.params.id);
    res.json({ status: 'ok', deleted: req.params.id });
  } catch (e) {
    console.error('[Cohorts] Delete error:', e.message);
    res.status(500).json({ error: 'Failed to delete cohort' });
  }
});

/**
 * POST /api/cohorts/join - Join a cohort by code
 * Body: { code, name, email }
 * Creates user if needed, enrolls in cohort, sets auth cookie.
 */
router.post('/join', (req, res) => {
  try {
    const { code, name, email } = req.body;
    if (!code || !name || !email) {
      return res.status(400).json({ error: 'code, name, and email are required' });
    }

    const cohort = database.getCohortByCode(code);
    if (!cohort) {
      return res.status(404).json({ error: 'Invalid cohort code' });
    }

    let user = database.getUserByEmail(email);
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    if (!user) {
      const userId = crypto.randomUUID();
      const role = isAdmin(email) ? 'admin' : 'ignator';
      database.createUser(userId, email, name, role, token, expiresAt);
      user = { id: userId, email: email.toLowerCase(), name, role };

      // Also enroll in Public cohort
      const publicCohort = database.getPublicCohort();
      if (publicCohort) {
        database.enrollUser(userId, publicCohort.id);
      }
    } else {
      database.updateUserToken(user.id, token, expiresAt);
    }

    // Enroll in the requested cohort
    database.enrollUser(user.id, cohort.id);

    setAuthCookie(res, token);

    const modules = database.getCohortModules(cohort.id);
    const allModuleIds = database.getUserModuleIds(user.id);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      cohort: { id: cohort.id, name: cohort.name, description: cohort.description, code: cohort.code },
      modules,
      allModuleIds,
    });
  } catch (e) {
    console.error('[Cohorts] Join error:', e.message);
    res.status(500).json({ error: 'Failed to join cohort' });
  }
});

/**
 * GET /api/cohorts/users - Get all users across all cohorts (admin only)
 */
router.get('/users', requireAdmin, (req, res) => {
  try {
    const cohorts = database.getAllCohorts();
    const userMap = new Map();

    for (const cohort of cohorts) {
      const members = database.getCohortMembers(cohort.id);
      for (const m of members) {
        if (!userMap.has(m.email)) {
          userMap.set(m.email, {
            name: m.name,
            email: m.email,
            cohorts: [cohort.name],
            sessionCount: m.sessionCount || 0,
            lastActive: m.lastActive || null,
          });
        } else {
          const existing = userMap.get(m.email);
          existing.cohorts.push(cohort.name);
          existing.sessionCount = Math.max(existing.sessionCount, m.sessionCount || 0);
          if (m.lastActive && (!existing.lastActive || m.lastActive > existing.lastActive)) {
            existing.lastActive = m.lastActive;
          }
        }
      }
    }

    res.json({ users: Array.from(userMap.values()) });
  } catch (e) {
    console.error('[Cohorts] Users error:', e.message);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

/**
 * GET /api/cohorts/:id/members - Get cohort members (admin only)
 */
router.get('/:id/members', requireAdmin, (req, res) => {
  try {
    const cohort = database.getCohortById(req.params.id);
    if (!cohort) {
      return res.status(404).json({ error: 'Cohort not found' });
    }

    const members = database.getCohortMembers(req.params.id);
    res.json({ members });
  } catch (e) {
    console.error('[Cohorts] Members error:', e.message);
    res.status(500).json({ error: 'Failed to get members' });
  }
});

module.exports = router;
