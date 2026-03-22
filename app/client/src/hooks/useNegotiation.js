import { useState, useCallback, useRef, useEffect } from 'react';
import { API_BASE } from '../utils/api';
import { useSession } from '../contexts/SessionContext';

/**
 * useNegotiation — SSE streaming conversation with the Customer Agent.
 *
 * Discovery Model additions:
 *   - Fetches VP opening line on mount (customer starts first)
 *   - Exposes suggested response starters
 *   - Tracks discovery-related metadata
 */
export default function useNegotiation() {
  const { sessionId, setExchangeCount, setSessionState, coachingMessages } = useSession();

  const [history, setHistory]                 = useState([]);
  const [isLoading, setIsLoading]             = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [error, setError]                     = useState(null);
  const [isPaused, setIsPaused]               = useState(false);
  const [suggestedStarters, setSuggestedStarters] = useState([]);
  const [initialized, setInitialized]         = useState(false);
  const [packets, setPackets]                 = useState([]);
  const [mindsetState, setMindsetState]       = useState(0.15);
  const [activePacket, setActivePacket]       = useState(null);

  const abortRef = useRef(null);

  // Fetch VP opening line when negotiation starts
  useEffect(() => {
    if (!sessionId || initialized) return;

    fetch(`${API_BASE}/api/negotiation/start/${sessionId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.openingLine) {
          setHistory([{ role: 'assistant', content: data.openingLine }]);
        }
        if (data.suggestedStarters) {
          setSuggestedStarters(data.suggestedStarters);
        }
        setInitialized(true);

        // Fetch info packets
        fetch(`${API_BASE}/api/negotiation/packets/${sessionId}`, { credentials: 'include' })
          .then(r => r.json())
          .then(pData => {
            if (pData.packets) setPackets(pData.packets);
            if (pData.mindsetState != null) setMindsetState(pData.mindsetState);
          })
          .catch(() => {});
      })
      .catch(err => {
        console.warn('[useNegotiation] Failed to fetch opening:', err.message);
        setInitialized(true);
      });
  }, [sessionId, initialized]);


  const sendMessage = useCallback(async (text, packetId = null) => {
    if (!text.trim() || isLoading || !sessionId) return;

    setError(null);
    setIsLoading(true);
    setCurrentResponse('');

    const userMsg = { role: 'user', content: text };
    setHistory((prev) => [...prev, userMsg]);

    try {
      abortRef.current = new AbortController();

      const response = await fetch(`${API_BASE}/api/negotiation`, { credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text,
          packetId: packetId || activePacket || null,
          conversationHistory: [...history, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errBody.error || `HTTP ${response.status}`);
      }

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer      = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);
            if (event.type === 'token') {
              accumulated += event.token ?? '';
              setCurrentResponse(accumulated);
            } else if (event.type === 'error') {
              setError(event.message ?? 'An error occurred');
            } else if (event.type === 'metadata') {
              setExchangeCount(event.exchangeCount);
              if (event.mindsetState != null) setMindsetState(event.mindsetState);
            } else if (event.type === 'coaching_feedback') {
              // AI coaching delivered via SSE
            } else if (event.type === 'coaching_pause') {
              setIsPaused(true);
              setSessionState('paused');
            }
          } catch (_) {}
        }
      }

      if (accumulated) {
        setHistory((prev) => [...prev, { role: 'assistant', content: accumulated }]);
      }
      setCurrentResponse('');

      // Clear active packet and refresh packet list
      setActivePacket(null);
      fetch(`${API_BASE}/api/negotiation/packets/${sessionId}`, { credentials: 'include' })
        .then(r => r.json())
        .then(pData => { if (pData.packets) setPackets(pData.packets); })
        .catch(() => {});
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [history, isLoading, sessionId, activePacket, setExchangeCount, setSessionState]);

  const resumeFromPause = useCallback(() => {
    setIsPaused(false);
    setSessionState('active');
  }, [setSessionState]);

  const resetConversation = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setHistory([]);
    setCurrentResponse('');
    setError(null);
    setIsLoading(false);
    setIsPaused(false);
    setSuggestedStarters([]);
    setInitialized(false);
    setPackets([]);
    setMindsetState(0.15);
    setActivePacket(null);
  }, []);

  // Smart Text Assist: polish manager's rough input
  const polishMessage = useCallback(async (rawInput) => {
    if (!rawInput.trim() || !sessionId) return null;

    try {
      const response = await fetch(`${API_BASE}/api/negotiation/text-assist`, { credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          rawInput,
          conversationHistory: history.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.polished || null;
    } catch (err) {
      console.warn('[useNegotiation] Text assist failed:', err.message);
      return null;
    }
  }, [sessionId, history]);

  return {
    history,
    isLoading,
    currentResponse,
    error,
    isPaused,
    suggestedStarters,
    packets,
    mindsetState,
    activePacket,
    setActivePacket,
    sendMessage,
    polishMessage,
    resumeFromPause,
    resetConversation,
  };
}
