'use strict';

const fs = require('fs');
const path = require('path');

/**
 * SESSION ARCHIVE — Persistent storage for completed sessions.
 *
 * Stores session summaries to disk (JSON) for:
 *   - Cross-session comparison (Feature 3)
 *   - ROI analysis (coached vs. uncoached)
 *   - Research data export
 *
 * Uses atomic writes (write to temp, rename) to prevent corruption.
 */
class SessionArchive {
  constructor() {
    const dataDir = path.join(__dirname, '..', 'data');
    // Ensure data directory exists (Render deploys from git which may not have empty dirs)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.archivePath = path.join(dataDir, 'archive.json');
    this.archive = [];
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.archivePath)) {
        const raw = fs.readFileSync(this.archivePath, 'utf-8');
        this.archive = JSON.parse(raw);
        console.log('[SessionArchive] Loaded ' + this.archive.length + ' archived sessions');
      }
    } catch (e) {
      console.warn('[SessionArchive] Failed to load archive:', e.message);
      this.archive = [];
    }
  }

  _save() {
    try {
      const tempPath = this.archivePath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(this.archive, null, 2), 'utf-8');
      try {
        fs.renameSync(tempPath, this.archivePath);
      } catch (renameErr) {
        // OneDrive sometimes blocks rename — fallback to direct write
        fs.writeFileSync(this.archivePath, JSON.stringify(this.archive, null, 2), 'utf-8');
        try { fs.unlinkSync(tempPath); } catch (_) { /* ignore */ }
      }
    } catch (e) {
      console.error('[SessionArchive] Failed to save archive:', e.message);
    }
  }

  /**
   * Archive a completed session summary.
   * Called when session state transitions to 'ended'.
   */
  archiveSession(session, objectiveScore) {
    // Don't archive duplicates
    if (this.archive.some(a => a.sessionId === session.id)) return;

    const summary = {
      sessionId: session.id,
      timestamp: new Date().toISOString(),
      config: { ...session.config },
      objectiveScore: objectiveScore || 0,
      perceivedScore: session.perceivedScore || null,
      knowledgeState: { ...session.knowledgeState },
      knowledgeHistory: session.knowledgeHistory ? [...session.knowledgeHistory] : [],
      intensityHistory: session.intensityHistory ? [...session.intensityHistory] : [],
      transcriptLength: session.transcript ? session.transcript.length : 0,
      coachingCount: session.coachingInterventions ? session.coachingInterventions.length : 0,
      exchangeCount: session.exchangeCount || 0,
      preSurvey: session.preSurvey || null,
      postSurvey: session.postSurvey || null,
      initialChoice: session.initialChoice || null,
      scenarioWeights: session.scenarioWeights || null,
      weightPrediction: session.weightPrediction || null,
    };

    this.archive.push(summary);
    this._save();
    console.log('[SessionArchive] Archived session ' + session.id + ' (Y=' + summary.objectiveScore + ')');
    return summary;
  }

  /**
   * Get all archived sessions, optionally filtered.
   */
  getAll(filters = {}) {
    let results = [...this.archive];

    if (filters.coachType) {
      results = results.filter(s => s.config.coachType === filters.coachType);
    }
    if (filters.difficulty) {
      results = results.filter(s => s.config.difficulty === filters.difficulty);
    }

    return results;
  }

  /**
   * Get sessions by coaching condition for comparison.
   */
  getByCondition(coachType, difficulty) {
    return this.archive.filter(s =>
      s.config.coachType === coachType &&
      (!difficulty || s.config.difficulty === difficulty)
    );
  }

  /**
   * Get comparison data: baseline vs coached sessions.
   */
  getComparisonData(difficulty) {
    const baselineSessions = this.getByCondition('none', difficulty);
    const coachedSessions = this.getByCondition('ai', difficulty);

    const mean = arr => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;

    const meanBaseline = mean(baselineSessions.map(s => s.objectiveScore));
    const meanCoached = mean(coachedSessions.map(s => s.objectiveScore));

    return {
      baselineSessions,
      coachedSessions,
      stats: {
        meanBaseline: Math.round(meanBaseline),
        meanCoached: Math.round(meanCoached),
        delta: Math.round(meanCoached - meanBaseline),
        nBaseline: baselineSessions.length,
        nCoached: coachedSessions.length,
      },
    };
  }

  /**
   * Get a single archived session by ID.
   */
  getById(sessionId) {
    return this.archive.find(s => s.sessionId === sessionId) || null;
  }

  get count() {
    return this.archive.length;
  }
}

// Singleton
module.exports = new SessionArchive();
