import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { API_BASE, getWsUrl } from '../utils/api';

const SessionContext = createContext(null);

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}

export function SessionProvider({ children }) {
  const [sessionId, setSessionId]         = useState(null);
  const [joinCode, setJoinCode]           = useState(null);
  const [config, setConfig]               = useState(null);
  const [moduleId, setModuleId]           = useState(null);
  const [sessionState, setSessionState]   = useState('none'); // none, created, active, paused, ended
  const [coachConnected, setCoachConnected] = useState(false);
  const [coachingMessages, setCoachingMessages] = useState([]);
  const [exchangeCount, setExchangeCount] = useState(0);
  const wsRef = useRef(null);
  const sessionStateRef = useRef(sessionState);

  // Keep sessionState ref in sync for WS reconnect closure
  useEffect(() => {
    sessionStateRef.current = sessionState;
  }, [sessionState]);

  // Create a new session
  const createSession = useCallback(async (sessionConfig) => {
    const res = await fetch(`${API_BASE}/api/session`, { credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionConfig),
    });
    if (!res.ok) throw new Error('Failed to create session');
    const data = await res.json();
    setSessionId(data.sessionId);
    setJoinCode(data.joinCode);
    setConfig(data.config);
    if (sessionConfig.scenarioId) setModuleId(sessionConfig.scenarioId);
    setSessionState('created');
    return data;
  }, []);

  // Set initial choice and move to active
  const startSession = useCallback(async (initialChoice, otherApproach) => {
    if (!sessionId) return;
    const res = await fetch(`${API_BASE}/api/session/${sessionId}/briefing`, { credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initialChoice, otherApproach }),
    });
    if (!res.ok) throw new Error('Failed to start session');
    setSessionState('active');
  }, [sessionId]);

  // End session
  const endSession = useCallback(async () => {
    if (!sessionId) return;
    await fetch(`${API_BASE}/api/session/${sessionId}/end`, { credentials: 'include', method: 'POST' });
    setSessionState('ended');
  }, [sessionId]);

  // Connect WebSocket
  const connectWs = useCallback((role) => {
    if (!sessionId || wsRef.current) return;

    const wsUrl = getWsUrl(sessionId, role);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`[WS] Connected as ${role}`);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleWsMessage(msg);
      } catch (_) {}
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected');
      wsRef.current = null;
      // Attempt reconnect after 3 seconds if session still active
      if (sessionStateRef.current === 'active' || sessionStateRef.current === 'paused') {
        setTimeout(() => connectWs(role), 3000);
      }
    };

    wsRef.current = ws;
  }, [sessionId, sessionState]);

  const handleWsMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'coach_connected':
        setCoachConnected(true);
        break;
      case 'coach_disconnected':
        setCoachConnected(false);
        break;
      case 'coaching_feedback':
        setCoachingMessages((prev) => [...prev, {
          content: msg.content,
          source: msg.source,
          focus: msg.focus,
          timestamp: msg.timestamp,
        }]);
        break;
      case 'session_state_change':
        setSessionState(msg.state);
        break;
      case 'pause_for_coaching':
        setSessionState('paused');
        break;
      case 'coaching_requested':
        // For coach client — coaching has been requested
        break;
      default:
        break;
    }
  }, []);

  // Request coaching (on-demand)
  const requestCoaching = useCallback(async () => {
    if (!sessionId) return;
    const res = await fetch(`${API_BASE}/api/coaching/request`, { credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    return res.json();
  }, [sessionId]);

  // Resume after coaching
  const resumeAfterCoaching = useCallback(() => {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'resume_after_coaching' }));
    }
    setSessionState('active');
  }, []);

  // Send WS message
  const sendWsMessage = useCallback((message) => {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // Reset everything
  const resetSession = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setSessionId(null);
    setJoinCode(null);
    setConfig(null);
    setModuleId(null);
    setSessionState('none');
    setCoachConnected(false);
    setCoachingMessages([]);
    setExchangeCount(0);
  }, []);

  return (
    <SessionContext.Provider value={{
      sessionId, joinCode, config, moduleId, sessionState,
      coachConnected, coachingMessages, exchangeCount,
      createSession, startSession, endSession,
      connectWs, requestCoaching, resumeAfterCoaching,
      sendWsMessage, resetSession,
      setExchangeCount, setSessionState,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export default SessionContext;
