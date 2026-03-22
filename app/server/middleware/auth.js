'use strict';

const crypto = require('crypto');
const { getUserByToken, updateUserLastActive } = require('../db/database');

const COOKIE_NAME = 'vidyaspark_token';

/**
 * Parse cookies from request headers (no cookie-parser dependency).
 */
function parseCookies(req, res, next) {
  req.cookies = {};
  const header = req.headers.cookie;
  if (header) {
    header.split(';').forEach(pair => {
      const [key, ...vals] = pair.trim().split('=');
      if (key) req.cookies[key.trim()] = vals.join('=').trim();
    });
  }
  next();
}

/**
 * Generate a secure random auth token.
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Set auth cookie via raw Set-Cookie header (no cookie-parser needed).
 */
function setAuthCookie(res, token) {
  const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`);
}

/**
 * Clear auth cookie.
 */
function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

/**
 * Require valid authentication. Populates req.user or returns 401.
 */
function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const user = getUserByToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  if (user.token_expires_at && new Date(user.token_expires_at) < new Date()) {
    return res.status(401).json({ error: 'Token expired' });
  }

  req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
  updateUserLastActive(user.id);
  next();
}

/**
 * Require admin role. Chains through requireAuth first.
 */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

/**
 * Optional auth — sets req.user if token is valid, null otherwise.
 */
function optionalAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) { req.user = null; return next(); }

  const user = getUserByToken(token);
  if (!user || (user.token_expires_at && new Date(user.token_expires_at) < new Date())) {
    req.user = null;
    return next();
  }

  req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
  updateUserLastActive(user.id);
  next();
}

module.exports = {
  parseCookies,
  generateToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
  requireAdmin,
  optionalAuth,
  COOKIE_NAME,
};
