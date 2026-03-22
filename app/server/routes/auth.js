'use strict';

const crypto = require('crypto');
const { Router } = require('express');
const { requireAuth, generateToken, setAuthCookie, clearAuthCookie } = require('../middleware/auth');
const database = require('../db/database');

const router = Router();

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

function isAdmin(email) {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * POST /api/auth/signup - Create new user account
 * Body: { name, email }
 */
router.post('/signup', (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }

    const existing = database.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered. Use /login instead.' });
    }

    const userId = crypto.randomUUID();
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const role = isAdmin(email) ? 'admin' : 'student';

    database.createUser(userId, email, name, role, token, expiresAt);

    // Enroll in Public cohort
    const publicCohort = database.getPublicCohort();
    if (publicCohort) {
      database.enrollUser(userId, publicCohort.id);
    }

    setAuthCookie(res, token);

    const cohorts = database.getUserCohorts(userId);
    const moduleIds = database.getUserModuleIds(userId);

    res.status(201).json({
      user: { id: userId, email: email.toLowerCase(), name, role },
      cohorts,
      moduleIds,
    });
  } catch (e) {
    console.error('[Auth] Signup error:', e.message);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

/**
 * POST /api/auth/login - Log in existing user
 * Body: { email }
 */
router.post('/login', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const user = database.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No account found with that email' });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    database.updateUserToken(user.id, token, expiresAt);

    setAuthCookie(res, token);

    const cohorts = database.getUserCohorts(user.id);
    const moduleIds = database.getUserModuleIds(user.id);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      cohorts,
      moduleIds,
    });
  } catch (e) {
    console.error('[Auth] Login error:', e.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /api/auth/me - Get current user info
 */
router.get('/me', requireAuth, (req, res) => {
  try {
    const cohorts = database.getUserCohorts(req.user.id);
    const moduleIds = database.getUserModuleIds(req.user.id);

    res.json({
      user: req.user,
      cohorts,
      moduleIds,
    });
  } catch (e) {
    console.error('[Auth] /me error:', e.message);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

/**
 * POST /api/auth/logout - Clear auth cookie
 */
router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ status: 'ok' });
});

module.exports = router;
