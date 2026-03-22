'use strict';

const fs = require('fs');
const path = require('path');

/**
 * SCENARIO STORE — Persistent storage for simulation scenarios.
 *
 * Each scenario defines a complete COACH model instantiation:
 *   Gamma (Context Function): dimensions, hidden truth F, information architecture
 *   Theta (Agent Primitives): disclosure resistance, warmth, pressure, reward sensitivity
 *   Delta (Difficulty Modifiers): easy/medium/hard behavioral calibration
 *   Omega (Assessment Weights): per-dimension scoring weights
 *
 * The default scenario is always available.
 * Custom scenarios created via God Mode are stored here.
 */
class ScenarioStore {
  constructor() {
    // Ensure data directory exists
    const dataDir = require('path').join(__dirname, '..', 'data');
    if (!require('fs').existsSync(dataDir)) {
      require('fs').mkdirSync(dataDir, { recursive: true });
    }
    this.scenariosPath = path.join(__dirname, '..', 'data', 'scenarios.json');
    this.scenarios = [];
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.scenariosPath)) {
        const raw = fs.readFileSync(this.scenariosPath, 'utf-8');
        this.scenarios = JSON.parse(raw);
        console.log('[ScenarioStore] Loaded ' + this.scenarios.length + ' custom scenarios');
      }
    } catch (e) {
      console.warn('[ScenarioStore] Failed to load scenarios:', e.message);
      this.scenarios = [];
    }
  }

  _save() {
    try {
      const tempPath = this.scenariosPath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(this.scenarios, null, 2), 'utf-8');
      try {
        fs.renameSync(tempPath, this.scenariosPath);
      } catch (renameErr) {
        // OneDrive sometimes blocks rename — fallback to direct write
        fs.writeFileSync(this.scenariosPath, JSON.stringify(this.scenarios, null, 2), 'utf-8');
        try { fs.unlinkSync(tempPath); } catch (_) { /* ignore */ }
      }
    } catch (e) {
      console.error('[ScenarioStore] Failed to save:', e.message);
    }
  }

  /**
   * Save a new scenario.
   */
  saveScenario(scenario) {
    // Don't save duplicates
    const existing = this.scenarios.findIndex(s => s.id === scenario.id);
    if (existing >= 0) {
      this.scenarios[existing] = { ...scenario, updatedAt: new Date().toISOString() };
    } else {
      this.scenarios.push({
        ...scenario,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this._save();
    return scenario;
  }

  /**
   * Get all scenarios (custom only — default scenario is always implicit).
   */
  getAll() {
    return [...this.scenarios];
  }

  /**
   * Get a scenario by ID. Returns null if not found.
   * The default scenario is handled by systemPrompts.js — not stored here.
   */
  getById(id) {
    return this.scenarios.find(s => s.id === id) || null;
  }

  /**
   * Delete a scenario by ID.
   */
  deleteById(id) {
    const idx = this.scenarios.findIndex(s => s.id === id);
    if (idx < 0) return false;
    this.scenarios.splice(idx, 1);
    this._save();
    return true;
  }

  get count() {
    return this.scenarios.length;
  }
}

module.exports = new ScenarioStore();
