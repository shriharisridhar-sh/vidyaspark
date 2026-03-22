'use strict';

/**
 * ModuleRegistry — Loads and caches scenario module packages
 *
 * Each module lives in app/server/scenarios/<moduleId>/ and contains:
 *   - module.json         (required) Master config with dimensions, skills, archetypes, etc.
 *   - customer-persona.json (optional) Agent persona and difficulty modifiers
 *   - evidence-packets.json (optional) Evidence cards for the learner
 *   - pre-survey.json       (optional) Pre-simulation survey questions
 *
 * The registry provides:
 *   - loadModule(moduleId)  Load a full module with all attached files
 *   - listModules()         List all available modules (summary only)
 *   - clearCache()          Clear the in-memory cache
 */

const fs = require('fs');
const path = require('path');

const SCENARIOS_DIR = path.join(__dirname, '..', 'scenarios');
const moduleCache = {};

/**
 * Load a single JSON file from a module directory.
 * Returns parsed JSON or null if the file doesn't exist.
 */
function loadModuleFile(moduleId, filename) {
  const filePath = path.join(SCENARIOS_DIR, moduleId, filename);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.warn(`[ModuleRegistry] Failed to parse ${moduleId}/${filename}:`, e.message);
    return null;
  }
}

/**
 * Load a complete module package by ID.
 * Returns the module.json contents with optional files attached as properties.
 * Uses in-memory cache for repeat loads.
 */
function loadModule(moduleId) {
  if (moduleCache[moduleId]) return moduleCache[moduleId];

  const moduleDir = path.join(SCENARIOS_DIR, moduleId);
  if (!fs.existsSync(moduleDir)) {
    console.warn(`[ModuleRegistry] Module directory not found: ${moduleId}`);
    return null;
  }

  const mod = loadModuleFile(moduleId, 'module.json');
  if (!mod) {
    console.warn(`[ModuleRegistry] module.json not found for: ${moduleId}`);
    return null;
  }

  // Attach optional files
  mod.customerPersona = loadModuleFile(moduleId, 'customer-persona.json');
  mod.evidencePackets = loadModuleFile(moduleId, 'evidence-packets.json') || [];
  mod.preSurvey = loadModuleFile(moduleId, 'pre-survey.json');

  // Validate required fields
  const required = ['id', 'name', 'dimensions', 'importanceWeights', 'skills', 'archetypes'];
  const missing = required.filter(f => !mod[f]);
  if (missing.length > 0) {
    console.warn(`[ModuleRegistry] Module ${moduleId} missing required fields: ${missing.join(', ')}`);
  }

  moduleCache[moduleId] = mod;
  return mod;
}

/**
 * List all available modules (directories containing module.json).
 * Returns summary objects suitable for a module selection UI.
 */
function listModules() {
  if (!fs.existsSync(SCENARIOS_DIR)) return [];

  return fs.readdirSync(SCENARIOS_DIR)
    .filter(entry => {
      const dir = path.join(SCENARIOS_DIR, entry);
      try {
        return fs.statSync(dir).isDirectory() && fs.existsSync(path.join(dir, 'module.json'));
      } catch {
        return false;
      }
    })
    .map(moduleId => {
      const mod = loadModule(moduleId);
      if (!mod) return null;
      return {
        id: mod.id,
        name: mod.name,
        description: mod.description || '',
        subject: mod.subject || mod.category || '',
        category: mod.category || mod.subject || '',
        ablCode: mod.ablCode || '',
        difficulty: mod.difficulty || 'medium',
        gradeLevel: mod.gradeLevel || '',
        estimatedMinutes: mod.estimatedMinutes || 20,
        dimensionCount: mod.dimensions ? mod.dimensions.length : 0,
        skillCount: mod.skills ? mod.skills.length : 0,
      };
    })
    .filter(Boolean);
}

/**
 * Clear the module cache. Pass a moduleId to clear a single entry,
 * or call with no arguments to clear everything.
 */
function clearCache(moduleId) {
  if (moduleId) {
    delete moduleCache[moduleId];
  } else {
    Object.keys(moduleCache).forEach(k => delete moduleCache[k]);
  }
}

module.exports = { loadModule, listModules, clearCache };
