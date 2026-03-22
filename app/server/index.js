'use strict';

const fs = require('fs');

const http = require('http');
const path = require('path');
try { require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), override: true }); } catch (_) { /* .env not found in production — env vars come from platform */ }

const express = require('express');
const cors    = require('cors');

// Routes
const conversationRoutes = require('./routes/conversation');
const negotiationRoutes  = require('./routes/negotiation');
const sessionRoutes      = require('./routes/session');
const coachingRoutes     = require('./routes/coaching');
const reportRoutes       = require('./routes/report');
const exportRoutes       = require('./routes/export');
const scenarioRoutes     = require('./routes/scenarios');
const moduleRoutes       = require('./routes/modules');
const ttsRoutes          = require('./routes/tts');
const analyticsRoutes    = require('./routes/analytics');
const authRoutes         = require('./routes/auth');
const cohortRoutes       = require('./routes/cohorts');
const dashboardRoutes    = require('./routes/dashboard');

// Middleware
const { parseCookies }   = require('./middleware/auth');

// WebSocket
const wsServer = require('./ws/wsServer');

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 3001;

// ── Trust Render's reverse proxy (critical for HTTPS detection) ──
app.set('trust proxy', 1);
app.disable('x-powered-by');  // Don't leak server technology

// ── HTTPS Redirect (production only) ────────────────────────
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, 'https://' + req.get('host') + req.originalUrl);
  }
  next();
});

// ── Security Headers (prevents corporate proxy/firewall blocks) ──
app.use((_req, res, next) => {
  // HSTS: Tell browsers to always use HTTPS (1 year, include subdomains)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS protection (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy: send origin only on cross-origin
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy: disable unused APIs
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=(self)');

  // Content Security Policy: allow our resources + Google Fonts + Anthropic API
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' wss://*.onrender.com wss://localhost:* ws://localhost:*",
    "media-src 'self' data: blob:",
    "frame-ancestors 'self'",
  ].join('; '));

  next();
});

// ── CORS ─────────────────────────────────────────────────
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*'
    ? true  // 'true' reflects the request origin (safer than literal '*' with credentials)
    : corsOrigin.split(',').map(s => s.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '5mb' }));
app.use(parseCookies);

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Auth & cohort routes
app.use('/api/auth',        authRoutes);
app.use('/api/cohorts',     cohortRoutes);
app.use('/api/dashboard',   dashboardRoutes);

// Session & governance routes
app.use('/api/session',      sessionRoutes);
app.use('/api/negotiation',  negotiationRoutes);
app.use('/api/coaching',     coachingRoutes);
app.use('/api/export',       exportRoutes);
app.use('/api/scenarios',    scenarioRoutes);
app.use('/api/modules',      moduleRoutes);
app.use('/api/analytics',    analyticsRoutes);

// Assessment route (VidyaSpark post-session student test)
let assessmentRoutes;
try { assessmentRoutes = require('./routes/assessment'); } catch (_) { assessmentRoutes = null; }
if (assessmentRoutes) app.use('/api/assessment', assessmentRoutes);

// Legacy & shared routes
app.use('/api/conversation', conversationRoutes);
app.use('/api/report',       reportRoutes);
app.use('/api/tts',          ttsRoutes);

app.get('/health', (_req, res) => {
  const sessionStore = require('./session/SessionStore');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeSessions: sessionStore.activeCount,
  });
});

// In production, serve the built React frontend
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath, {
    maxAge: '1d',           // Cache static assets for 1 day
    etag: true,             // Enable ETag for cache validation
    immutable: false,       // Allow revalidation
    setHeaders: (res, filePath) => {
      // Hashed assets (Vite adds hash to filename) can be cached longer
      if (filePath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }));
  // SPA fallback: serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/ws')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
  console.log('[Server] Serving static files from', clientDistPath);
} else {
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
}

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[unhandled error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Attach WebSocket server and start
wsServer.attach(server);

// Initialize SQLite database and migrate archive data
const database = require('./db/database');
database.getDb().then(async () => {
  const count = await database.migrateFromArchive();
  if (count > 0) console.log('[Server] Migrated ' + count + ' sessions from archive.json to SQLite');
}).catch(e => console.error('[Server] Database init failed:', e.message));

server.listen(PORT, () => {
  console.log(`\n  VidyaSpark Server`);
  console.log(`  HTTP:  http://localhost:${PORT}`);
  console.log(`  WS:    ws://localhost:${PORT}/ws\n`);
});

module.exports = app;
