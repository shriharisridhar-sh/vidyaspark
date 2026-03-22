'use strict';

const { WebSocketServer } = require('ws');
const url = require('url');
const sessionStore = require('../session/SessionStore');
const { AGENT_PRIMITIVES, COACHING_PARAMETERS, ASSESSMENT_WEIGHTS, CONTEXT_FUNCTION } = require('../prompts/systemPrompts');

/**
 * Attach WebSocket server to an existing HTTP server.
 *
 * Clients connect with: ws://host:port/ws?sessionId=xxx&role=manager|coach
 *
 * The coach role is used by the Administrator Dashboard, which sees the entire
 * COACH model system: H1 primitives (alpha), Agent primitives (theta), K(t), A(t),
 * coaching parameters, assessment weights, and the full context function.
 */
function attach(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const params = new url.URL(req.url, 'http://localhost').searchParams;
    const sessionId = params.get('sessionId');
    const role = params.get('role');

    if (!sessionId || !role || !['manager', 'coach'].includes(role)) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid sessionId or role' }));
      ws.close(1008, 'Invalid params');
      return;
    }

    const session = sessionStore.getSession(sessionId);
    if (!session) {
      ws.send(JSON.stringify({ type: 'error', message: 'Session not found' }));
      ws.close(1008, 'Session not found');
      return;
    }

    // Close old connection if reconnecting
    const existingWs = sessionStore.getWebSocket(sessionId, role);
    if (existingWs && existingWs.readyState === 1) {
      existingWs.close(1000, 'Replaced by new connection');
    }

    sessionStore.setWebSocket(sessionId, role, ws);
    console.log('[WS] ' + role + ' connected to session ' + sessionId);

    // Notify the other party
    if (role === 'coach') {
      sessionStore.sendToRole(sessionId, 'manager', {
        type: 'coach_connected',
        timestamp: new Date().toISOString(),
      });

      // Build theta for this session's difficulty
      const difficulty = session.config && session.config.difficulty || 'medium';
      const theta = {
        disclosureResistance: AGENT_PRIMITIVES.disclosureResistance[difficulty],
        warmth: AGENT_PRIMITIVES.warmth[difficulty],
        pressureIntensity: AGENT_PRIMITIVES.pressureIntensity[difficulty],
        rewardSensitivity: AGENT_PRIMITIVES.rewardSensitivity[difficulty],
      };

      // Send FULL system state to admin on connect
      ws.send(JSON.stringify({
        type: 'session_sync',
        transcript: session.transcript,
        coachingInterventions: session.coachingInterventions,
        state: session.state,
        exchangeCount: session.exchangeCount,
        config: session.config,

        // COACH model dynamic state
        coachModelState: {
          knowledgeState: session.knowledgeState,
          coachingIntensity: session.coachingIntensity,
          learningVelocity: session.learningVelocity,
          knowledgeHistory: session.knowledgeHistory,
          intensityHistory: session.intensityHistory,
          dimensionEngagement: session.dimensionEngagement,
          intensityLabel: sessionStore.getCoachingIntensityLabel(sessionId),
        },

        // H1 Primitives (alpha) — from pre-survey
        alphaPrimitives: session.alphaPrimitives || null,
        preSurvey: session.preSurvey || null,

        // Agent Primitives (theta) — for this difficulty level
        thetaPrimitives: theta,

        // System parameters (static across runs)
        systemParameters: {
          coachingParameters: COACHING_PARAMETERS,
          assessmentWeights: ASSESSMENT_WEIGHTS,
          contextFunction: {
            dimensions: CONTEXT_FUNCTION.dimensions,
            J: CONTEXT_FUNCTION.J,
            hiddenTruth: CONTEXT_FUNCTION.hiddenTruth,
            informationArchitecture: CONTEXT_FUNCTION.informationArchitecture,
            roles: CONTEXT_FUNCTION.roles,
          },
        },
      }));
    }

    if (role === 'manager') {
      const coachWs = sessionStore.getWebSocket(sessionId, 'coach');
      if (coachWs && coachWs.readyState === 1) {
        ws.send(JSON.stringify({
          type: 'coach_connected',
          timestamp: new Date().toISOString(),
        }));
      }
    }

    ws.send(JSON.stringify({
      type: 'connected',
      role,
      sessionId,
      state: session.state,
    }));

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(sessionId, role, message);
      } catch (err) {
        console.error('[WS] Invalid message from ' + role + ':', err.message);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('[WS] ' + role + ' disconnected from session ' + sessionId);
      sessionStore.setWebSocket(sessionId, role, null);

      if (role === 'coach') {
        sessionStore.sendToRole(sessionId, 'manager', {
          type: 'coach_disconnected',
          timestamp: new Date().toISOString(),
        });
      }
    });

    ws.on('error', (err) => {
      console.error('[WS] Error for ' + role + ' in session ' + sessionId + ':', err.message);
    });
  });

  console.log('[WS] WebSocket server attached at /ws');
  return wss;
}

function handleMessage(sessionId, role, message) {
  switch (message.type) {
    case 'coaching_feedback':
      if (role !== 'coach') return;
      sessionStore.addCoachingIntervention(sessionId, {
        content: message.content,
        source: 'human',
      });
      sessionStore.sendToRole(sessionId, 'manager', {
        type: 'coaching_feedback',
        content: message.content,
        source: 'human',
        timestamp: new Date().toISOString(),
      });
      break;

    case 'resume_after_coaching':
      if (role !== 'manager') return;
      sessionStore.updateState(sessionId, 'active');
      sessionStore.broadcast(sessionId, {
        type: 'session_state_change',
        state: 'active',
        reason: 'coaching_complete',
      });
      break;

    case 'request_coaching':
      if (role !== 'manager') return;
      sessionStore.updateState(sessionId, 'paused');
      sessionStore.broadcast(sessionId, {
        type: 'pause_for_coaching',
        exchangeNumber: sessionStore.getSession(sessionId) && sessionStore.getSession(sessionId).exchangeCount,
        reason: 'on_demand',
      });
      break;

    case 'ping':
      var ws = sessionStore.getWebSocket(sessionId, role);
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
      break;

    default:
      console.warn('[WS] Unknown message type: ' + message.type);
  }
}

module.exports = { attach };
