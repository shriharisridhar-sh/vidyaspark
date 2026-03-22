'use strict';

/**
 * DATABASE — SQLite persistent storage for COACH sessions.
 *
 * Uses sql.js (pure JS/WASM SQLite) for zero-dependency portability.
 * Stores completed sessions with full transcript, coaching data, and scores.
 * Persists to disk as a single .db file in the data directory.
 */

const initSqlJs = require('sql.js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'coach.db');

let db = null;
let initPromise = null;

async function getDb() {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const SQL = await initSqlJs();

    let buffer = null;
    if (fs.existsSync(DB_PATH)) {
      buffer = fs.readFileSync(DB_PATH);
      console.log('[Database] Loaded existing database from', DB_PATH);
    } else {
      console.log('[Database] Creating new database at', DB_PATH);
    }

    db = new SQL.Database(buffer);

    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        ended_at TEXT,
        state TEXT DEFAULT 'ended',
        user_name TEXT,
        user_group TEXT,
        coach_type TEXT,
        cadence TEXT,
        coaching_interval INTEGER,
        difficulty TEXT,
        objective_score REAL,
        perceived_score REAL,
        exchange_count INTEGER DEFAULT 0,
        config_json TEXT,
        knowledge_state TEXT,
        knowledge_history TEXT,
        intensity_history TEXT,
        transcript TEXT,
        coaching_interventions TEXT,
        scenario_weights TEXT,
        initial_choice TEXT,
        pre_survey TEXT,
        post_survey TEXT,
        alpha_primitives TEXT,
        dimension_engagement TEXT,
        report_json TEXT,
        annotations TEXT,
        metadata_json TEXT,
        weight_prediction TEXT,
        mindset_state REAL,
        mindset_history TEXT,
        used_packets TEXT,
        discovery_score REAL,
        persuasion_score REAL,
        scenario_id TEXT,
        skill_scores TEXT,
        skill_history TEXT,
        skill_weights TEXT,
        archetype TEXT,
        composite_score REAL
      )
    `);

    db.run('CREATE INDEX IF NOT EXISTS idx_sessions_coach_type ON sessions(coach_type)');
    db.run('CREATE INDEX IF NOT EXISTS idx_sessions_difficulty ON sessions(difficulty)');
    db.run('CREATE INDEX IF NOT EXISTS idx_sessions_user_name ON sessions(user_name)');
    db.run('CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at)');
    db.run('CREATE INDEX IF NOT EXISTS idx_sessions_user_group ON sessions(user_group)');

    // ── Auth & Cohort Tables ──────────────────────────────────
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        auth_token TEXT UNIQUE,
        token_expires_at TEXT,
        created_at TEXT NOT NULL,
        last_active_at TEXT
      )
    `);
    db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    db.run('CREATE INDEX IF NOT EXISTS idx_users_token ON users(auth_token)');

    db.run(`
      CREATE TABLE IF NOT EXISTS cohorts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        code TEXT NOT NULL UNIQUE,
        created_by TEXT,
        is_public INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      )
    `);
    db.run('CREATE INDEX IF NOT EXISTS idx_cohorts_code ON cohorts(code)');

    db.run(`
      CREATE TABLE IF NOT EXISTS cohort_modules (
        cohort_id TEXT NOT NULL,
        module_id TEXT NOT NULL,
        PRIMARY KEY (cohort_id, module_id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS cohort_members (
        user_id TEXT NOT NULL,
        cohort_id TEXT NOT NULL,
        enrolled_at TEXT NOT NULL,
        PRIMARY KEY (user_id, cohort_id)
      )
    `);


    // ── Migrations: add new columns to existing databases ──
    const newColumns = [
      ['mindset_state', 'REAL'],
      ['mindset_history', 'TEXT'],
      ['used_packets', 'TEXT'],
      ['discovery_score', 'REAL'],
      ['persuasion_score', 'REAL'],
      // COACH 2.0: Gamma-driven skill tracking columns
      ['scenario_id', 'TEXT'],
      ['skill_scores', 'TEXT'],
      ['skill_history', 'TEXT'],
      ['skill_weights', 'TEXT'],
      ['archetype', 'TEXT'],
      ['composite_score', 'REAL'],
      ['priority_prediction', 'TEXT'],
      ['user_id', 'TEXT'],
    ];
    for (const [col, type] of newColumns) {
      try {
        db.run(`ALTER TABLE sessions ADD COLUMN ${col} ${type}`);
      } catch (_) {
        // Column already exists — ignore
      }
    }

    // ── Seed: Public Cohort ──────────────────────────────────
    const publicCheck = db.exec('SELECT id FROM cohorts WHERE is_public = 1');
    if (!publicCheck.length || !publicCheck[0].values.length) {
      const publicCohortId = crypto.randomUUID();
      db.run(
        'INSERT INTO cohorts (id, name, description, code, is_public, created_at) VALUES (?, ?, ?, ?, 1, ?)',
        [publicCohortId, 'Public', 'Default public cohort with free modules', 'PUBLIC', new Date().toISOString()]
      );
      db.run(
        'INSERT OR IGNORE INTO cohort_modules (cohort_id, module_id) VALUES (?, ?)',
        [publicCohortId, 'abl-p7-force-pressure']
      );
      db.run(
        'INSERT OR IGNORE INTO cohort_modules (cohort_id, module_id) VALUES (?, ?)',
        [publicCohortId, 'abl-c1-states-of-matter']
      );
      db.run(
        'INSERT OR IGNORE INTO cohort_modules (cohort_id, module_id) VALUES (?, ?)',
        [publicCohortId, 'abl-m1-triangles']
      );
      console.log('[Database] Seeded Public cohort with id', publicCohortId);
    }

    saveToDisk();
    console.log('[Database] Initialized with tables and indexes');
    return db;
  })();

  return initPromise;
}

function saveToDisk() {
  if (!db) return;
  try {
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (e) {
    console.error('[Database] Failed to save to disk:', e.message);
  }
}

async function saveSession(session, objectiveScore) {
  const database = await getDb();

  const existing = database.exec('SELECT id FROM sessions WHERE id = ?', [session.id]);
  if (existing.length > 0 && existing[0].values.length > 0) {
    await updateSession(session, objectiveScore);
    return;
  }

  const stmt = database.prepare(`
    INSERT INTO sessions (
      id, created_at, ended_at, state,
      user_name, user_group,
      coach_type, cadence, coaching_interval, difficulty,
      objective_score, perceived_score, exchange_count,
      config_json, knowledge_state, knowledge_history, intensity_history,
      transcript, coaching_interventions, scenario_weights,
      initial_choice, pre_survey, post_survey, alpha_primitives,
      dimension_engagement, report_json, annotations, metadata_json,
      weight_prediction,
      mindset_state, mindset_history, used_packets,
      discovery_score, persuasion_score,
      scenario_id, skill_scores, skill_history, skill_weights, archetype, composite_score,
      priority_prediction, user_id
    ) VALUES (
      ?, ?, ?, ?,
      ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?,
      ?, ?, ?,
      ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?
    )
  `);

  stmt.bind([
    session.id,
    session.createdAt,
    new Date().toISOString(),
    'ended',
    session.userName || null,
    session.userGroup || null,
    session.config?.coachType || 'none',
    session.config?.cadence || 'between_rounds',
    session.config?.coachingInterval || 3,
    session.config?.difficulty || 'medium',
    objectiveScore || 0,
    session.perceivedScore || null,
    session.exchangeCount || 0,
    JSON.stringify(session.config || {}),
    JSON.stringify(session.knowledgeState || {}),
    JSON.stringify(session.knowledgeHistory || []),
    JSON.stringify(session.intensityHistory || []),
    JSON.stringify(session.transcript || []),
    JSON.stringify(session.coachingInterventions || []),
    JSON.stringify(session.scenarioWeights || {}),
    JSON.stringify(session.initialChoice || null),
    JSON.stringify(session.preSurvey || null),
    JSON.stringify(session.postSurvey || null),
    JSON.stringify(session.alphaPrimitives || null),
    JSON.stringify(session.dimensionEngagement || {}),
    JSON.stringify(session.report || null),
    JSON.stringify(session.annotations || null),
    JSON.stringify(session.metadata || {}),
    JSON.stringify(session.weightPrediction || null),
    session.mindsetState || 0.15,
    JSON.stringify(session.mindsetHistory || []),
    JSON.stringify(session.usedPackets || []),
    objectiveScore || 0,  // discovery_score placeholder
    0,  // persuasion_score placeholder
    // COACH 2.0: skill tracking data
    session.scenarioId || 'abl-p7-force-pressure',
    JSON.stringify(session.skillScores || {}),
    JSON.stringify(session.skillHistory || []),
    JSON.stringify(session.gammaSkills || []),
    JSON.stringify(session.archetype || null),
    objectiveScore || 0,
    JSON.stringify(session.priorityPrediction || null),
    session.userId || null,
  ]);

  stmt.step();
  stmt.free();
  saveToDisk();
  console.log('[Database] Saved session ' + session.id + ' (Y=' + (objectiveScore || 0) + ')');
}

async function updateSession(session, objectiveScore) {
  const database = await getDb();

  database.run(`
    UPDATE sessions SET
      perceived_score = ?,
      post_survey = ?,
      weight_prediction = ?,
      report_json = ?,
      annotations = ?,
      objective_score = COALESCE(?, objective_score)
    WHERE id = ?
  `, [
    session.perceivedScore || null,
    JSON.stringify(session.postSurvey || null),
    JSON.stringify(session.weightPrediction || null),
    JSON.stringify(session.report || null),
    JSON.stringify(session.annotations || null),
    objectiveScore || null,
    session.id,
  ]);

  saveToDisk();
  console.log('[Database] Updated session ' + session.id);
}

function parseSessionRow(cols, row) {
  const obj = {};
  cols.forEach((col, i) => obj[col] = row[i]);
  return {
    sessionId: obj.id,
    timestamp: obj.created_at,
    endedAt: obj.ended_at,
    userName: obj.user_name,
    userGroup: obj.user_group,
    config: JSON.parse(obj.config_json || '{}'),
    objectiveScore: obj.objective_score,
    perceivedScore: obj.perceived_score,
    exchangeCount: obj.exchange_count,
    knowledgeState: JSON.parse(obj.knowledge_state || '{}'),
    knowledgeHistory: JSON.parse(obj.knowledge_history || '[]'),
    intensityHistory: JSON.parse(obj.intensity_history || '[]'),
    transcript: obj.transcript ? JSON.parse(obj.transcript) : undefined,
    coachingInterventions: obj.coaching_interventions ? JSON.parse(obj.coaching_interventions) : undefined,
    scenarioWeights: JSON.parse(obj.scenario_weights || '{}'),
    initialChoice: JSON.parse(obj.initial_choice || 'null'),
    preSurvey: JSON.parse(obj.pre_survey || 'null'),
    postSurvey: JSON.parse(obj.post_survey || 'null'),
    alphaPrimitives: obj.alpha_primitives ? JSON.parse(obj.alpha_primitives) : null,
    dimensionEngagement: obj.dimension_engagement ? JSON.parse(obj.dimension_engagement) : {},
    report: obj.report_json ? JSON.parse(obj.report_json) : null,
    annotations: obj.annotations ? JSON.parse(obj.annotations) : null,
    metadata: obj.metadata_json ? JSON.parse(obj.metadata_json) : {},
    weightPrediction: obj.weight_prediction ? JSON.parse(obj.weight_prediction) : null,
    mindsetState: obj.mindset_state || 0.15,
    mindsetHistory: obj.mindset_history ? JSON.parse(obj.mindset_history) : [],
    usedPackets: obj.used_packets ? JSON.parse(obj.used_packets) : [],
    discoveryScore: obj.discovery_score || 0,
    persuasionScore: obj.persuasion_score || 0,
    // COACH 2.0 fields
    scenarioId: obj.scenario_id || 'abl-p7-force-pressure',
    skillScores: obj.skill_scores ? JSON.parse(obj.skill_scores) : {},
    skillHistory: obj.skill_history ? JSON.parse(obj.skill_history) : [],
    skillWeights: obj.skill_weights ? JSON.parse(obj.skill_weights) : [],
    archetype: obj.archetype ? JSON.parse(obj.archetype) : null,
    compositeScore: obj.composite_score || obj.objective_score || 0,
    priorityPrediction: obj.priority_prediction ? JSON.parse(obj.priority_prediction) : null,
  };
}

async function getAllSessions(filters = {}) {
  const database = await getDb();

  let sql = 'SELECT * FROM sessions WHERE 1=1';
  const params = [];

  if (filters.coachType) { sql += ' AND coach_type = ?'; params.push(filters.coachType); }
  if (filters.difficulty) { sql += ' AND difficulty = ?'; params.push(filters.difficulty); }
  if (filters.userName) { sql += ' AND user_name = ?'; params.push(filters.userName); }

  sql += ' ORDER BY created_at DESC';

  const result = database.exec(sql, params);
  if (!result.length) return [];

  return result[0].values.map(row => parseSessionRow(result[0].columns, row));
}

async function getSessionById(sessionId) {
  const database = await getDb();
  const result = database.exec('SELECT * FROM sessions WHERE id = ?', [sessionId]);
  if (!result.length || !result[0].values.length) return null;
  return parseSessionRow(result[0].columns, result[0].values[0]);
}

async function getComparisonData(difficulty) {
  const sessions = await getAllSessions(difficulty ? { difficulty } : {});

  const baseline = sessions.filter(s => s.config.coachType === 'none');
  const coached = sessions.filter(s => s.config.coachType === 'ai');

  const mean = arr => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
  const meanBaseline = mean(baseline.map(s => s.objectiveScore));
  const meanCoached = mean(coached.map(s => s.objectiveScore));

  return {
    baselineSessions: baseline,
    coachedSessions: coached,
    stats: {
      meanBaseline: Math.round(meanBaseline),
      meanCoached: Math.round(meanCoached),
      delta: Math.round(meanCoached - meanBaseline),
      nBaseline: baseline.length,
      nCoached: coached.length,
    },
  };
}

async function getSessionCount() {
  const database = await getDb();
  const result = database.exec('SELECT COUNT(*) as count FROM sessions');
  return result.length ? result[0].values[0][0] : 0;
}

async function migrateFromArchive() {
  const archivePath = path.join(__dirname, '..', 'data', 'archive.json');
  if (!fs.existsSync(archivePath)) return 0;

  try {
    const raw = fs.readFileSync(archivePath, 'utf-8');
    const archive = JSON.parse(raw);
    if (!archive.length) return 0;

    const database = await getDb();
    let migrated = 0;

    for (const s of archive) {
      const existing = database.exec('SELECT id FROM sessions WHERE id = ?', [s.sessionId]);
      if (existing.length > 0 && existing[0].values.length > 0) continue;

      const stmt = database.prepare(`
        INSERT INTO sessions (
          id, created_at, ended_at, state,
          coach_type, cadence, coaching_interval, difficulty,
          objective_score, perceived_score, exchange_count,
          config_json, knowledge_state, knowledge_history, intensity_history,
          scenario_weights, initial_choice, pre_survey, post_survey,
          weight_prediction
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.bind([
        s.sessionId,
        s.timestamp,
        s.timestamp,
        'ended',
        s.config?.coachType || 'none',
        s.config?.cadence || 'between_rounds',
        s.config?.coachingInterval || 3,
        s.config?.difficulty || 'medium',
        s.objectiveScore || 0,
        s.perceivedScore || null,
        s.exchangeCount || 0,
        JSON.stringify(s.config || {}),
        JSON.stringify(s.knowledgeState || {}),
        JSON.stringify(s.knowledgeHistory || []),
        JSON.stringify(s.intensityHistory || []),
        JSON.stringify(s.scenarioWeights || {}),
        JSON.stringify(s.initialChoice || null),
        JSON.stringify(s.preSurvey || null),
        JSON.stringify(s.postSurvey || null),
        JSON.stringify(s.weightPrediction || null),
      ]);

      stmt.step();
      stmt.free();
      migrated++;
    }

    saveToDisk();
    console.log('[Database] Migrated ' + migrated + ' sessions from archive.json');
    return migrated;
  } catch (e) {
    console.error('[Database] Migration failed:', e.message);
    return 0;
  }
}

// ══════════════════════════════════════════════════════════════
// AUTH & COHORT QUERY FUNCTIONS (synchronous sql.js)
// ══════════════════════════════════════════════════════════════

function createUser(id, email, name, role, token, expiresAt) {
  if (!db) throw new Error('Database not initialized');
  db.run(
    'INSERT INTO users (id, email, name, role, auth_token, token_expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, email.toLowerCase(), name, role || 'student', token, expiresAt, new Date().toISOString()]
  );
  saveToDisk();
  return { id, email: email.toLowerCase(), name, role: role || 'student' };
}

function getUserByEmail(email) {
  if (!db) return null;
  const result = db.exec('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (!result.length || !result[0].values.length) return null;
  const cols = result[0].columns;
  const row = result[0].values[0];
  const obj = {};
  cols.forEach((col, i) => obj[col] = row[i]);
  return obj;
}

function getUserByToken(token) {
  if (!db) return null;
  const result = db.exec('SELECT * FROM users WHERE auth_token = ?', [token]);
  if (!result.length || !result[0].values.length) return null;
  const cols = result[0].columns;
  const row = result[0].values[0];
  const obj = {};
  cols.forEach((col, i) => obj[col] = row[i]);
  return obj;
}

function updateUserToken(userId, token, expiresAt) {
  if (!db) return;
  db.run('UPDATE users SET auth_token = ?, token_expires_at = ? WHERE id = ?', [token, expiresAt, userId]);
  saveToDisk();
}

function updateUserLastActive(userId) {
  if (!db) return;
  db.run('UPDATE users SET last_active_at = ? WHERE id = ?', [new Date().toISOString(), userId]);
  // No saveToDisk here — too frequent, will be persisted on next write
}

function createCohort(id, name, description, code, createdBy) {
  if (!db) throw new Error('Database not initialized');
  db.run(
    'INSERT INTO cohorts (id, name, description, code, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, description || null, code.toUpperCase(), createdBy || null, new Date().toISOString()]
  );
  saveToDisk();
  return { id, name, description, code: code.toUpperCase(), created_by: createdBy };
}

function getCohortByCode(code) {
  if (!db) return null;
  const result = db.exec('SELECT * FROM cohorts WHERE code = ?', [code.toUpperCase()]);
  if (!result.length || !result[0].values.length) return null;
  const cols = result[0].columns;
  const row = result[0].values[0];
  const obj = {};
  cols.forEach((col, i) => obj[col] = row[i]);
  return obj;
}

function getCohortById(id) {
  if (!db) return null;
  const result = db.exec('SELECT * FROM cohorts WHERE id = ?', [id]);
  if (!result.length || !result[0].values.length) return null;
  const cols = result[0].columns;
  const row = result[0].values[0];
  const obj = {};
  cols.forEach((col, i) => obj[col] = row[i]);
  return obj;
}

function getAllCohorts() {
  if (!db) return [];
  const result = db.exec('SELECT * FROM cohorts ORDER BY created_at DESC');
  if (!result.length) return [];
  return result[0].values.map(row => {
    const obj = {};
    result[0].columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

function updateCohort(id, name, description) {
  if (!db) return;
  db.run('UPDATE cohorts SET name = ?, description = ? WHERE id = ?', [name, description || null, id]);
  saveToDisk();
}

function deleteCohort(id) {
  if (!db) return;
  db.run('DELETE FROM cohort_modules WHERE cohort_id = ?', [id]);
  db.run('DELETE FROM cohort_members WHERE cohort_id = ?', [id]);
  db.run('DELETE FROM cohorts WHERE id = ?', [id]);
  saveToDisk();
}

function addCohortModules(cohortId, moduleIds) {
  if (!db) return;
  for (const moduleId of moduleIds) {
    db.run('INSERT OR IGNORE INTO cohort_modules (cohort_id, module_id) VALUES (?, ?)', [cohortId, moduleId]);
  }
  saveToDisk();
}

function getCohortModules(cohortId) {
  if (!db) return [];
  const result = db.exec('SELECT module_id FROM cohort_modules WHERE cohort_id = ?', [cohortId]);
  if (!result.length) return [];
  return result[0].values.map(row => row[0]);
}

function removeCohortModules(cohortId) {
  if (!db) return;
  db.run('DELETE FROM cohort_modules WHERE cohort_id = ?', [cohortId]);
  saveToDisk();
}

function enrollUser(userId, cohortId) {
  if (!db) return;
  db.run(
    'INSERT OR IGNORE INTO cohort_members (user_id, cohort_id, enrolled_at) VALUES (?, ?, ?)',
    [userId, cohortId, new Date().toISOString()]
  );
  saveToDisk();
}

function getCohortMembers(cohortId) {
  if (!db) return [];
  const result = db.exec(
    `SELECT u.id, u.email, u.name, u.role, cm.enrolled_at
     FROM cohort_members cm JOIN users u ON cm.user_id = u.id
     WHERE cm.cohort_id = ?
     ORDER BY cm.enrolled_at DESC`,
    [cohortId]
  );
  if (!result.length) return [];
  return result[0].values.map(row => {
    const obj = {};
    result[0].columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

function getUserCohorts(userId) {
  if (!db) return [];
  const result = db.exec(
    `SELECT c.* FROM cohorts c
     JOIN cohort_members cm ON c.id = cm.cohort_id
     WHERE cm.user_id = ?
     ORDER BY c.created_at DESC`,
    [userId]
  );
  if (!result.length) return [];
  return result[0].values.map(row => {
    const obj = {};
    result[0].columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

function getUserModuleIds(userId) {
  if (!db) return [];
  const result = db.exec(
    `SELECT DISTINCT cm2.module_id FROM cohort_members cm
     JOIN cohort_modules cm2 ON cm.cohort_id = cm2.cohort_id
     WHERE cm.user_id = ?`,
    [userId]
  );
  if (!result.length) return [];
  return result[0].values.map(row => row[0]);
}

function getPublicCohort() {
  if (!db) return null;
  const result = db.exec('SELECT * FROM cohorts WHERE is_public = 1 LIMIT 1');
  if (!result.length || !result[0].values.length) return null;
  const cols = result[0].columns;
  const row = result[0].values[0];
  const obj = {};
  cols.forEach((col, i) => obj[col] = row[i]);
  return obj;
}

function getUserSessions(userId) {
  if (!db) return [];
  const result = db.exec('SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  if (!result.length) return [];
  return result[0].values.map(row => parseSessionRow(result[0].columns, row));
}

module.exports = {
  getDb,
  saveToDisk,
  saveSession,
  updateSession,
  getAllSessions,
  getSessionById,
  getComparisonData,
  getSessionCount,
  migrateFromArchive,
  // Auth & Cohort functions
  createUser,
  getUserByEmail,
  getUserByToken,
  updateUserToken,
  updateUserLastActive,
  createCohort,
  getCohortByCode,
  getCohortById,
  getAllCohorts,
  updateCohort,
  deleteCohort,
  addCohortModules,
  getCohortModules,
  removeCohortModules,
  enrollUser,
  getCohortMembers,
  getUserCohorts,
  getUserModuleIds,
  getPublicCohort,
  getUserSessions,
};
