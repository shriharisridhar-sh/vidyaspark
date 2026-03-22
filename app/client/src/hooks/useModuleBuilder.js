import { useState, useRef, useCallback } from 'react';
import { API_BASE } from '../utils/api';

export default function useModuleBuilder() {
  const [phase, setPhase] = useState(1);
  const [moduleIntake, setModuleIntake] = useState({
    phase1: null,
    phase2: null,
    phase3: null,
    generatedModule: null,
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingProgress, setStreamingProgress] = useState([]);
  const [moduleData, setModuleData] = useState(null);
  const [error, setError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const abortRef = useRef(null);

  const parseSSE = useCallback(async (response, onToken, onModuleData, onDone, onProgress, onError) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(line.slice(6));
          if (event.type === 'token') onToken?.(event.content);
          else if (event.type === 'module_data') onModuleData?.(event.content);
          else if (event.type === 'generated_module') onModuleData?.(event.content);
          else if (event.type === 'progress') onProgress?.(event);
          else if (event.type === 'done') onDone?.(event.content);
          else if (event.type === 'error') onError?.(event.content);
        } catch (e) { /* skip malformed lines */ }
      }
    }
  }, []);

  // Phase 1 -> 2: Submit frustration text
  const submitFrustration = useCallback(async (text) => {
    setIsStreaming(true);
    setStreamingContent('');
    setError(null);
    setModuleData(null);

    const newHistory = [{ role: 'user', content: text }];
    setConversationHistory(newHistory);
    setModuleIntake(prev => ({ ...prev, phase1: { rawFrustration: text, timestamp: new Date().toISOString() } }));

    try {
      abortRef.current = new AbortController();
      const response = await fetch(API_BASE + '/api/modules/intake/begin', { credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frustrationText: text }),
        signal: abortRef.current.signal,
      });

      let accumulated = '';
      await parseSSE(
        response,
        (token) => {
          accumulated += token;
          setStreamingContent(accumulated);
        },
        (data) => {
          setModuleData(data);
          setModuleIntake(prev => ({ ...prev, phase2: { ...data, conversationHistory: newHistory } }));
        },
        (cleanResponse) => {
          if (cleanResponse) {
            setConversationHistory(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
          }
          setPhase(2);
          setIsStreaming(false);
        },
        null,
        (errMsg) => { setError(errMsg); setIsStreaming(false); }
      );
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setIsStreaming(false);
      }
    }
  }, [parseSSE]);

  // Phase 2 refinement
  const refineReflection = useCallback(async (text) => {
    setIsStreaming(true);
    setStreamingContent('');
    setError(null);

    const newHistory = [...conversationHistory, { role: 'user', content: text }];
    setConversationHistory(newHistory);

    try {
      abortRef.current = new AbortController();
      const response = await fetch(API_BASE + '/api/modules/intake/refine', { credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationHistory: newHistory }),
        signal: abortRef.current.signal,
      });

      let accumulated = '';
      await parseSSE(
        response,
        (token) => {
          accumulated += token;
          setStreamingContent(accumulated);
        },
        (data) => {
          setModuleData(data);
          setModuleIntake(prev => ({ ...prev, phase2: { ...data, conversationHistory: newHistory } }));
        },
        (cleanResponse) => {
          if (cleanResponse) {
            setConversationHistory(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
          }
          setIsStreaming(false);
        },
        null,
        (errMsg) => { setError(errMsg); setIsStreaming(false); }
      );
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setIsStreaming(false);
      }
    }
  }, [conversationHistory, parseSSE]);

  // Phase 2 -> 3: Confirm reflection
  const confirmReflection = useCallback(() => {
    setPhase(3);
  }, []);

  // Phase 3: Update calibration data (local state only)
  const updateCalibration = useCallback((data) => {
    setModuleIntake(prev => ({ ...prev, phase3: { ...prev.phase3, ...data } }));
  }, []);

  // Phase 3 -> 4: Generate full module
  const generateModule = useCallback(async () => {
    setPhase(4);
    setIsStreaming(true);
    setStreamingProgress([]);
    setError(null);

    const intake = {
      ...moduleIntake.phase2,
      calibration: moduleIntake.phase3,
    };

    try {
      abortRef.current = new AbortController();
      const response = await fetch(API_BASE + '/api/modules/generate', { credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleIntake: intake }),
        signal: abortRef.current.signal,
      });

      await parseSSE(
        response,
        null,
        (generatedModule) => {
          setModuleIntake(prev => ({ ...prev, generatedModule }));
        },
        () => {
          setPhase(5);
          setIsStreaming(false);
        },
        (progressEvent) => {
          setStreamingProgress(prev => {
            const updated = [...prev];
            updated[progressEvent.step] = { label: progressEvent.label, done: true };
            return updated;
          });
        },
        (errMsg) => { setError(errMsg); setIsStreaming(false); }
      );
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setIsStreaming(false);
      }
    }
  }, [moduleIntake, parseSSE]);

  // Phase 5: Save module
  const saveModule = useCallback(async () => {
    try {
      const response = await fetch(API_BASE + '/api/modules/save', { credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...moduleIntake.generatedModule,
          intake: {
            phase1: moduleIntake.phase1,
            phase2: moduleIntake.phase2,
            phase3: moduleIntake.phase3,
          },
        }),
      });
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
    }
  }, [moduleIntake]);

  const resetBuilder = useCallback(() => {
    setPhase(1);
    setModuleIntake({ phase1: null, phase2: null, phase3: null, generatedModule: null });
    setStreamingContent('');
    setStreamingProgress([]);
    setModuleData(null);
    setConversationHistory([]);
    setError(null);
  }, []);

  return {
    phase, moduleIntake, isStreaming, streamingContent, streamingProgress, moduleData, error,
    submitFrustration, refineReflection, confirmReflection, updateCalibration, generateModule, saveModule, resetBuilder,
  };
}
