'use strict';

const { v4: uuidv4 } = require('uuid');
const { generateJoinCode } = require('./generateJoinCode');
const sessionArchive = require('./SessionArchive');
const database = require('../db/database');
const { generateRandomWeights, loadScenario, DEFAULT_SCENARIO_ID, getDimensionKeywords } = require('../prompts/systemPrompts');
const { loadModule } = require('../modules/ModuleRegistry');

/**
 * SESSION STORE — COACH Model State Management
 *
 * Tracks the complete simulation state including COACH model variables:
 *   K(t) = knowledge state per dimension (evolves during simulation)
 *   A(t) = coaching adaptation intensity (evolves during simulation)
 *   dK/dt = learning velocity (computed from K trajectory)
 *
 * Architecture:
 *   H1 (learner) -> exchanges -> Agent (customer) -> information signal
 *   H2 (coach) -> coaching interventions -> A(t) adaptation
 *   K(t) updated after each exchange based on dimension engagement
 */

class SessionStore {
  constructor() {
    this.sessions = new Map();
  }

  createSession(config = {}) {
    const id = uuidv4();
    const existingCodes = new Set(Array.from(this.sessions.values()).map(s => s.joinCode));

    const session = {
      id,
      createdAt: new Date().toISOString(),
      state: 'created',
      userName: config.userName || null,
      userGroup: config.userGroup || null,
      userId: config.userId || null,
      config: {
        coachType: config.coachType || 'none',       // none | ai | human
        cadence: config.coachingCadence || config.cadence || 'between_rounds',  // between_rounds | real_time | on_demand
        coachingInterval: config.coachingInterval || 3,
        difficulty: config.difficulty || 'medium',
      },
      joinCode: generateJoinCode(existingCodes),
      transcript: [],
      coachingInterventions: [],
      exchangeCount: 0,
      initialChoice: null,
      report: null,
      quizResults: null,
      debriefViewed: false,
      postSurvey: null,
      perceivedScore: null,
      annotations: null,

      // Metadata for research tracking
      metadata: {
        startTime: null,
        pauseCount: 0,
      },

      // ── COACH 2.0: Gamma-Driven Skill Tracking ─────────────
      scenarioId: config.scenarioId || DEFAULT_SCENARIO_ID,
      gammaSkills: [],          // Skill definitions from Gamma (set below)
      skillScores: {},          // Current skill scores { skillId: 0-100 }
      skillHistory: [],         // Snapshots after each exchange
      archetype: null,          // Computed from skill vector

      // ── Randomized Scenario Weights ────────────────────────
      scenarioWeights: null,  // Set after creation
      weightPrediction: null, // Filled by post-survey

      // ── COACH Model State Variables ──────────────────────────
      // K(t): Knowledge state per dimension [0, 1]
      // Initialized dynamically from scenarioWeights below
      knowledgeState: {},

      // K(t) history: snapshots after each exchange for trajectory analysis
      knowledgeHistory: [],

      // A(t): Current coaching intensity [0, A_max]
      // Adapts based on learning velocity vs target rate
      coachingIntensity: 0.3,  // A_0 = base level

      // A(t) history: snapshots for research
      intensityHistory: [],

      // dK/dt: Learning velocity (rolling average across dimensions)
      learningVelocity: 0,

      // Per-dimension engagement counts (initialized dynamically)
      dimensionEngagement: {},

      // WebSocket references (not serialized)
      ws: {},
    };

    // Generate randomized weights for this session (module-aware)
    const rw = generateRandomWeights(session.scenarioId);
    session.scenarioWeights = rw;

    // ── Module-aware K(0) initialization ──
    // Try loading dimensions from module config; fall back to hardcoded defaults
    const mod = loadModule(session.scenarioId);
    const moduleDimensions = mod && mod.dimensions ? mod.dimensions : null;

    if (moduleDimensions) {
      // Initialize K(t) from module dimension definitions
      moduleDimensions.forEach(d => {
        if (d.visibility === 'decoy') session.knowledgeState[d.shortName] = 0.4;
        else if (d.visibility === 'obvious') session.knowledgeState[d.shortName] = 0.15;
        else session.knowledgeState[d.shortName] = 0.1;
        session.dimensionEngagement[d.shortName] = 0;
      });
    } else {
      // Fallback: hardcoded dimensions (backward compat)
      const allDims = ['reliability', 'hse', 'technical', 'service', 'price'];
      allDims.forEach(dim => {
        if (rw.visibility[dim] === 'decoy') session.knowledgeState[dim] = 0.4;
        else if (rw.visibility[dim] === 'obvious') session.knowledgeState[dim] = 0.15;
        else session.knowledgeState[dim] = 0.1;
        session.dimensionEngagement[dim] = 0;
      });
    }

    // ── COACH 2.0: Load Gamma and initialize skill scores ──
    // Try module config first, then fall back to legacy scenario JSON
    const gamma = loadScenario(session.scenarioId);
    const skillSource = (mod && mod.skills) ? mod.skills : (gamma && gamma.skills) ? gamma.skills : null;
    if (skillSource) {
      session.gammaSkills = skillSource;
      skillSource.forEach(skill => {
        session.skillScores[skill.id] = 0;
      });
    } else {
      // Fallback for default scenario
      session.gammaSkills = [
        { id: 'discovery', name: 'Discovery', weight: 0.60 },
        { id: 'persuasion', name: 'Persuasion', weight: 0.40 },
      ];
      session.skillScores = { discovery: 0, persuasion: 0 };
    }

    // ── M(t): Customer Mindset State ─────────────────────
    // Tracks how much the customer has shifted from price-focused to value-balanced
    // M(0) = 0.15 (heavily price-focused at start)
    // M(T) → 1.0 means fully value-oriented thinking
    session.mindsetState = 0.15;
    session.mindsetHistory = [];
    session.usedPackets = [];  // Track which evidence packets have been used
    session.packetImpactLog = [];  // Track impact of each packet use

    this.sessions.set(id, session);
    return session;
  }

  getSession(id) {
    return this.sessions.get(id) || null;
  }

  getByJoinCode(code) {
    for (const session of this.sessions.values()) {
      if (session.joinCode === code) return session;
    }
    return null;
  }

  updateState(id, newState) {
    const session = this.sessions.get(id);
    if (!session) return null;

    const validTransitions = {
      created: ['briefing', 'active'],
      briefing: ['active'],
      active: ['paused', 'ended'],
      paused: ['active', 'ended'],
    };

    const allowed = validTransitions[session.state];
    if (!allowed || !allowed.includes(newState)) {
      console.warn(`Invalid state transition: ${session.state} -> ${newState}`);
      return null;
    }

    session.state = newState;

    // Record timing metadata
    if (newState === 'active' && session.metadata && !session.metadata.startTime) {
      session.metadata.startTime = new Date().toISOString();
    }
    if (newState === 'paused' && session.metadata) {
      session.metadata.pauseCount = (session.metadata.pauseCount || 0) + 1;
    }

    // Archive session when it ends (Feature 6)
    if (newState === 'ended') {
      try {
        const score = this.computeCompositeScore(id) || this.computeObjectiveScore(id);
        session.archetype = this.computeArchetype(id);
        sessionArchive.archiveSession(session, score);
        // Also save full session to SQLite database
        database.saveSession(session, score).catch(e =>
          console.warn('[SessionStore] Failed to save session to database:', e.message)
        );
      } catch (e) {
        console.warn('[SessionStore] Failed to archive session:', e.message);
      }
    }

    return session;
  }

  addTranscriptEntry(id, entry) {
    const session = this.sessions.get(id);
    if (!session) return null;

    const enrichedEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      exchangeNumber: session.exchangeCount,
    };

    session.transcript.push(enrichedEntry);

    // Increment exchange count on manager messages (one exchange = one manager turn)
    if (entry.role === 'manager') {
      session.exchangeCount++;
    }

    return enrichedEntry;
  }

  addCoachingIntervention(id, intervention) {
    const session = this.sessions.get(id);
    if (!session) return null;

    const enrichedIntervention = {
      ...intervention,
      timestamp: new Date().toISOString(),
      exchangeNumber: session.exchangeCount,
      // Track coaching intensity at time of intervention
      coachingIntensity: session.coachingIntensity,
    };

    session.coachingInterventions.push(enrichedIntervention);
    return enrichedIntervention;
  }

  // ── COACH Model: Update Knowledge State K(t) ────────────────
  // Called after each exchange pair (manager message + customer response)
  // Estimates K_j(t) by analyzing dimension engagement in the transcript
  updateKnowledgeState(id, managerMessage, customerResponse) {
    const session = this.sessions.get(id);
    if (!session) return null;

    // Load keywords from module config if available, otherwise use hardcoded defaults
    const DIMENSION_KEYWORDS = getDimensionKeywords(session.scenarioId);

    const combinedText = (managerMessage + ' ' + customerResponse).toLowerCase();
    const previousK = { ...session.knowledgeState };

    // Update engagement counts and K(t) for each dimension
    Object.keys(DIMENSION_KEYWORDS).forEach(dim => {
      const keywords = DIMENSION_KEYWORDS[dim];
      const hits = keywords.filter(kw => combinedText.includes(kw)).length;

      if (hits > 0) {
        session.dimensionEngagement[dim] += hits;

        // Learning equation: dK/dt = [alpha * I(t)] * (K* - K(t))
        // Simplified discrete update: K(t+1) = K(t) + learningRate * (1 - K(t))
        // learningRate scales with hit count (proxy for information signal I_j)
        const informationSignal = Math.min(hits / keywords.length, 1.0);
        const learningRate = 0.08 * informationSignal;  // alpha_j^0 * I_j(t)
        const knowledgeGap = 1.0 - session.knowledgeState[dim];

        // Add coaching boost if coaching is active: beta * A(t)
        const coachingBoost = session.coachingIntensity * 0.04;

        session.knowledgeState[dim] += (learningRate + coachingBoost) * knowledgeGap;
        session.knowledgeState[dim] = Math.min(session.knowledgeState[dim], 1.0);
      }
    });

    // Compute learning velocity: average dK across dimensions
    const dims = Object.keys(session.knowledgeState);
    const totalDelta = dims.reduce((sum, dim) =>
      sum + (session.knowledgeState[dim] - previousK[dim]), 0);
    session.learningVelocity = totalDelta / dims.length;

    // Record knowledge snapshot for trajectory analysis
    session.knowledgeHistory.push({
      exchange: session.exchangeCount,
      timestamp: new Date().toISOString(),
      K: { ...session.knowledgeState },
      dKdt: session.learningVelocity,
      A: session.coachingIntensity,
    });

    return {
      knowledgeState: session.knowledgeState,
      learningVelocity: session.learningVelocity,
      coachingIntensity: session.coachingIntensity,
    };
  }

  // ── M(t): Update Customer Mindset State ──────────────────────
  // Called when evidence is presented or when good discovery shifts the customer
  updateMindsetState(id, { packetDimension, packetTier, managerMessage, customerResponse }) {
    const session = this.sessions.get(id);
    if (!session) return null;

    const previousM = session.mindsetState;
    const weights = session.scenarioWeights?.weights || {};
    const topDim = session.scenarioWeights?.topDimension;
    const secondDim = session.scenarioWeights?.secondDimension;

    let shift = 0;

    if (packetDimension) {
      // Evidence was presented — calculate impact based on dimension match
      const dimWeight = weights[packetDimension] || 10;
      const isTopPriority = packetDimension === topDim;
      const isSecondPriority = packetDimension === secondDim;
      const isValuePacket = packetDimension === 'value';

      // Base impact scales with dimension importance (REDUCED from v1)
      let baseImpact = dimWeight / 100;  // 0.07 for price, 0.35 for top

      // CRITICAL: Discovery gate — evidence without prior discovery has minimal impact
      // If the learner hasn't explored this dimension, evidence is basically random
      const dimK = session.knowledgeState[packetDimension] || session.knowledgeState[topDim] || 0;
      const discoveryGate = dimK > 0.35 ? 1.0 : dimK > 0.20 ? 0.4 : 0.15;

      // Timing bonus: evidence is more effective after good discovery
      const timingBonus = dimK > 0.35 ? 1.3 : dimK > 0.20 ? 0.8 : 0.3;

      // Tier 2 evidence slight bonus (reduced from 1.4)
      const tierMultiplier = packetTier === 2 ? 1.2 : 1.0;

      // REDUCED multipliers: was 0.6/0.45/0.2, now 0.25/0.18/0.08
      if (isTopPriority || isValuePacket) {
        shift = baseImpact * 0.25 * timingBonus * tierMultiplier * discoveryGate;
      } else if (isSecondPriority) {
        shift = baseImpact * 0.18 * timingBonus * tierMultiplier * discoveryGate;
      } else {
        shift = baseImpact * 0.08 * timingBonus * tierMultiplier * discoveryGate;
      }

      // Diminishing returns (stronger — was just 1-M, now squared)
      shift = shift * Math.pow(1 - session.mindsetState, 1.5);

      // Log packet impact
      session.packetImpactLog.push({
        exchange: session.exchangeCount,
        timestamp: new Date().toISOString(),
        packetDimension,
        packetTier,
        shift: shift,
        timingBonus,
        previousM: previousM,
      });
    } else {
      // No evidence — natural shift from good discovery questions
      // Small positive shift if non-price dimensions were discussed
      const combinedText = ((managerMessage || '') + ' ' + (customerResponse || '')).toLowerCase();
      const nonPriceKeywords = ['reliab', 'uptime', 'safety', 'hse', 'technical', 'engineer', 'response', 'service'];
      const priceKeywords = ['price', 'cost', '12%', 'cheaper', 'discount'];
      const nonPriceHits = nonPriceKeywords.filter(kw => combinedText.includes(kw)).length;
      const priceHits = priceKeywords.filter(kw => combinedText.includes(kw)).length;

      if (nonPriceHits > priceHits) {
        shift = 0.02 * (1 - session.mindsetState);
      }
    }

    session.mindsetState = Math.min(session.mindsetState + shift, 1.0);

    // Record mindset snapshot
    session.mindsetHistory.push({
      exchange: session.exchangeCount,
      timestamp: new Date().toISOString(),
      M: session.mindsetState,
      delta: session.mindsetState - previousM,
      packetUsed: !!packetDimension,
    });

    return {
      mindsetState: session.mindsetState,
      delta: session.mindsetState - previousM,
    };
  }

  // Get available packets for a session (tier 2 unlocks based on K(t))
  getAvailablePackets(id) {
    const session = this.sessions.get(id);
    if (!session) return [];

    const { getInfoPackets } = require('../data/infoPackets');
    const packets = getInfoPackets(session.scenarioId);
    return packets.map(packet => {
      // COACH 2.0: Tier 2 unlocks based on discovery skill score
      const discoveryScore = session.skillScores.discovery || 0;
      const isUnlocked = packet.tier === 1 || discoveryScore >= 50;
      const isUsed = session.usedPackets.includes(packet.id);
      return {
        ...packet,
        unlocked: isUnlocked,
        used: isUsed,
      };
    });
  }

  // ── COACH Model: Adapt Coaching Intensity A(t) ──────────────
  // Implements: dA/dt = phi * max(0, r_bar - dK/dt) * (A_max - A)
  // Called after K(t) is updated
  adaptCoachingIntensity(id) {
    const session = this.sessions.get(id);
    if (!session) return null;

    const TARGET_RATE = 0.12;   // r_bar: target learning rate
    const PHI = 0.15;           // adaptation speed
    const A_MAX = 1.0;          // maximum intensity

    const gap = Math.max(0, TARGET_RATE - session.learningVelocity);
    const headroom = A_MAX - session.coachingIntensity;

    // Adaptation: increase intensity when learning is below target
    const dA = PHI * gap * headroom;
    session.coachingIntensity = Math.min(session.coachingIntensity + dA, A_MAX);

    // If learning is above target, allow slight decay (coaching fading)
    if (session.learningVelocity > TARGET_RATE) {
      session.coachingIntensity = Math.max(
        session.coachingIntensity * 0.95,  // gentle decay
        0.2  // minimum floor
      );
    }

    // Record intensity snapshot
    session.intensityHistory.push({
      exchange: session.exchangeCount,
      timestamp: new Date().toISOString(),
      A: session.coachingIntensity,
      dKdt: session.learningVelocity,
      gap: gap,
    });

    return session.coachingIntensity;
  }

  // ── COACH Model: Get coaching intensity label ───────────────
  getCoachingIntensityLabel(id) {
    const session = this.sessions.get(id);
    if (!session) return 'medium';

    const A = session.coachingIntensity;
    if (A < 0.35) return 'low';
    if (A < 0.65) return 'medium';
    return 'high';
  }

  // ── COACH Model: Compute Objective Score Y ──────────────────
  // Y = 0.6 * Discovery_Score + 0.4 * Persuasion_Score
  // Discovery = K(t) concept mastery
  // Persuasion = M(t) mindset shift achieved
  computeObjectiveScore(id) {
    const session = this.sessions.get(id);
    if (!session) return 0;

    const K = session.knowledgeState;

    // === Discovery Score (same as before) ===
    const asymmetryK = Math.max(K.reliability, K.hse) - K.price * 0.3;
    const prioritizationK = (K.reliability + K.hse + K.technical + K.service) / 4;
    const competitiveK = Math.min(
      (K.reliability + K.hse) / 2,
      prioritizationK
    );

    const discoveryRaw = (
      0.35 * Math.min(asymmetryK, 1) +
      0.35 * Math.min(prioritizationK, 1) +
      0.30 * Math.min(competitiveK, 1)
    ) * 100;

    // === Persuasion Score (M(t) mindset shift) ===
    // How much did the customer shift from price-focused to value-balanced?
    // M(0) starts at 0.15, so max shift is 0.85
    const mindsetShift = (session.mindsetState || 0.15) - 0.15;
    const maxShift = 0.85;
    const persuasionRaw = Math.min(mindsetShift / maxShift, 1.0) * 100;

    // === Combined Score ===
    // 60% discovery + 40% persuasion
    const Y = 0.60 * discoveryRaw + 0.40 * persuasionRaw;

    return Math.round(Math.min(Y, 100));
  }

  // Compute just the discovery sub-score (for detailed reporting)
  computeDiscoveryScore(id) {
    const session = this.sessions.get(id);
    if (!session) return 0;
    const K = session.knowledgeState;
    const asymmetryK = Math.max(K.reliability, K.hse) - K.price * 0.3;
    const prioritizationK = (K.reliability + K.hse + K.technical + K.service) / 4;
    const competitiveK = Math.min((K.reliability + K.hse) / 2, prioritizationK);
    return Math.round((0.35 * Math.min(asymmetryK, 1) + 0.35 * Math.min(prioritizationK, 1) + 0.30 * Math.min(competitiveK, 1)) * 100);
  }

  // Compute just the persuasion sub-score (for detailed reporting)
  computePersuasionScore(id) {
    const session = this.sessions.get(id);
    if (!session) return 0;
    const mindsetShift = (session.mindsetState || 0.15) - 0.15;
    return Math.round(Math.min(mindsetShift / 0.85, 1.0) * 100);
  }

  setInitialChoice(id, choice, reasoning) {
    const session = this.sessions.get(id);
    if (!session) return null;
    session.initialChoice = { choice, reasoning, timestamp: new Date().toISOString() };
    return session;
  }

  setReport(id, report) {
    const session = this.sessions.get(id);
    if (!session) return null;
    session.report = report;
    return session;
  }

  setWebSocket(id, role, ws) {
    const session = this.sessions.get(id);
    if (!session) return;
    if (!session.ws) session.ws = {};
    if (session.ws[role] && session.ws[role] !== ws) {
      try { session.ws[role].close(); } catch (e) { /* ignore */ }
    }
    session.ws[role] = ws;
  }

  getWebSocket(id, role) {
    const session = this.sessions.get(id);
    return session?.ws?.[role] || null;
  }

  sendToRole(id, role, message) {
    const ws = this.getWebSocket(id, role);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  broadcast(id, message, excludeRole = null) {
    const session = this.sessions.get(id);
    if (!session?.ws) return;
    Object.entries(session.ws).forEach(([role, ws]) => {
      if (role !== excludeRole && ws?.readyState === 1) {
        ws.send(JSON.stringify(message));
      }
    });
  }



  // ── COACH 2.0: Update Skill Scores from LLM Judge ──────────
  // Called after each exchange with the judge's assessment
  updateSkillScores(id, judgeResult) {
    const session = this.sessions.get(id);
    if (!session || !judgeResult || !judgeResult.scores) return null;

    // Update current skill scores
    Object.entries(judgeResult.scores).forEach(([skillId, score]) => {
      session.skillScores[skillId] = score;
    });

    // Record snapshot for trajectory analysis
    session.skillHistory.push({
      exchange: session.exchangeCount,
      timestamp: new Date().toISOString(),
      scores: { ...session.skillScores },
      reasoning: judgeResult.reasoning || {},
    });

    return session.skillScores;
  }

  // ── COACH 2.0: Compute Composite Score Y = Σ w_i × S_i ────
  computeCompositeScore(id) {
    const session = this.sessions.get(id);
    if (!session) return 0;

    const skills = session.gammaSkills;
    if (!skills || skills.length === 0) {
      // Fallback to legacy computation
      return this.computeObjectiveScore(id);
    }

    let Y = 0;
    skills.forEach(skill => {
      const score = session.skillScores[skill.id] || 0;
      Y += skill.weight * score;
    });

    // Engagement floor: penalize if too few meaningful exchanges
    const managerMsgCount = session.transcript.filter(t => t.role === 'manager').length;
    if (managerMsgCount < 3) {
      Y = Math.min(Y, 25);  // Can't score above 25 with fewer than 3 exchanges
    } else if (managerMsgCount < 5) {
      Y = Math.min(Y, 45);  // Can't score above 45 with fewer than 5 exchanges
    }

    return Math.round(Math.min(Y, 100));
  }

  // ── COACH 2.0: Compute Archetype from Skill Vector ─────────
  computeArchetype(id) {
    const session = this.sessions.get(id);
    if (!session) return { name: 'Unknown', description: '' };

    const skills = session.gammaSkills;
    const scores = session.skillScores;
    const Y = this.computeCompositeScore(id);

    if (!skills || skills.length === 0) {
      return { name: 'Unknown', description: 'No skills defined' };
    }

    // Find strongest and weakest skills
    let maxSkill = { id: '', score: -1 };
    let minSkill = { id: '', score: 101 };
    let allAbove70 = true;
    let allAbove50 = true;

    skills.forEach(skill => {
      const score = scores[skill.id] || 0;
      if (score > maxSkill.score) maxSkill = { id: skill.id, name: skill.name, score };
      if (score < minSkill.score) minSkill = { id: skill.id, name: skill.name, score };
      if (score < 70) allAbove70 = false;
      if (score < 50) allAbove50 = false;
    });

    // Special case for 2-skill Discovery+Persuasion (backward compat archetypes)
    if (skills.length === 2 && scores.discovery !== undefined && scores.persuasion !== undefined) {
      const d = scores.discovery || 0;
      const p = scores.persuasion || 0;
      if (d >= 70 && p >= 60) return { name: 'Strategist', description: 'Found what matters AND shifted the conversation.' };
      if (d >= 60 && p < 50) return { name: 'Analyst', description: 'Great discovery but didn\'t close the loop with evidence.' };
      if (d < 50 && p >= 60) return { name: 'Charmer', description: 'Persuasive but aimed at the wrong things.' };
      if (Y >= 35 && Y < 60) return { name: 'Explorer', description: 'Started finding signals. Go deeper next time.' };
      return { name: 'Trapped', description: 'Stuck in the price trap. Most people start here.' };
    }

    // General archetype computation for any skill vector
    if (Y >= 70 && allAbove70) {
      return { name: 'Strategist', description: 'Balanced excellence across all skills.' };
    }
    if (Y >= 50 && maxSkill.score >= 70) {
      return { name: 'Strong ' + maxSkill.name, description: 'Excels at ' + maxSkill.name.toLowerCase() + ' but needs work on ' + minSkill.name.toLowerCase() + '.' };
    }
    if (Y >= 30) {
      return { name: 'Explorer', description: 'Making progress. Focus on improving ' + minSkill.name.toLowerCase() + '.' };
    }
    return { name: 'Trapped', description: 'Stuck in initial assumptions. Try a different approach next time.' };
  }

  // ── COACH 2.0: Simple coaching trigger ──────────────────────
  shouldTriggerCoaching(id) {
    const session = this.sessions.get(id);
    if (!session || session.config.coachType === 'none') return false;

    const history = session.skillHistory;
    if (history.length < 3) return false;

    // Check if stuck: no skill improved by 5+ points in last 3 exchanges
    const recent = history.slice(-3);
    const first = recent[0].scores;
    const last = recent[recent.length - 1].scores;

    let anyProgress = false;
    Object.keys(last).forEach(skillId => {
      if ((last[skillId] || 0) - (first[skillId] || 0) >= 5) {
        anyProgress = true;
      }
    });

    return !anyProgress;
  }

  // ── COACH 2.0: Get weakest skill for coaching focus ─────────
  getWeakestSkill(id) {
    const session = this.sessions.get(id);
    if (!session) return null;

    let weakest = null;
    let lowestScore = 101;

    (session.gammaSkills || []).forEach(skill => {
      const score = session.skillScores[skill.id] || 0;
      if (score < lowestScore) {
        lowestScore = score;
        weakest = skill;
      }
    });

    return weakest;
  }

  // Export session data (deep clone without WS references)
  // Includes COACH model state for research analysis
  exportSession(id) {
    const session = this.sessions.get(id);
    if (!session) return null;

    const { ws, ...exportable } = session;
    const exported = JSON.parse(JSON.stringify(exportable));

    // Add computed COACH model metrics (legacy + COACH 2.0)
    exported.coachModelMetrics = {
      // COACH 2.0: Gamma-driven skill scores
      scenarioId: session.scenarioId,
      gammaSkills: session.gammaSkills,
      finalSkillScores: { ...session.skillScores },
      skillTrajectory: session.skillHistory,
      compositeScore: this.computeCompositeScore(id),
      archetype: this.computeArchetype(id),

      // Legacy fields (backward compat)
      finalKnowledgeState: { ...session.knowledgeState },
      knowledgeTrajectory: session.knowledgeHistory,
      coachingAdaptation: session.intensityHistory,
      finalCoachingIntensity: session.coachingIntensity,
      finalLearningVelocity: session.learningVelocity,
      objectiveScore: this.computeObjectiveScore(id),
      discoveryScore: this.computeDiscoveryScore(id),
      persuasionScore: this.computePersuasionScore(id),
      scenarioWeights: session.scenarioWeights,
      weightPrediction: session.weightPrediction,
      priorityPrediction: session.priorityPrediction || null,
      perceivedScore: session.perceivedScore,
      postSurvey: session.postSurvey,
      dimensionEngagement: { ...session.dimensionEngagement },
      finalMindsetState: session.mindsetState,
      mindsetHistory: session.mindsetHistory,
      usedPackets: session.usedPackets,
      packetImpactLog: session.packetImpactLog,
    };

    return exported;
  }

  removeSession(id) {
    const session = this.sessions.get(id);
    if (session?.ws) {
      Object.values(session.ws).forEach(ws => {
        try { ws.close(); } catch (e) { /* ignore */ }
      });
    }
    this.sessions.delete(id);
  }
}

// Singleton
module.exports = new SessionStore();
