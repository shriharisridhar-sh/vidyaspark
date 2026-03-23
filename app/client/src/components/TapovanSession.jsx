import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '../utils/api';
import StudentRoster from './StudentRoster';
import AmbientAudio from './AmbientAudio';

// Dynamic canvas imports
import P7ForcePressureCanvas from './canvas/P7ForcePressureCanvas';
import P3SoundCanvas from './canvas/P3SoundCanvas';
import C1StatesOfMatterCanvas from './canvas/C1StatesOfMatterCanvas';
import C2SeparationCanvas from './canvas/C2SeparationCanvas';
import M1TrianglesCanvas from './canvas/M1TrianglesCanvas';
import M1QuadrilateralsCanvas from './canvas/M1QuadrilateralsCanvas';
import B1CellMicroscopeCanvas from './canvas/B1CellMicroscopeCanvas';
import B2PhotosynthesisCanvas from './canvas/B2PhotosynthesisCanvas';

const CANVAS_MAP = {
  'abl-p7-force-pressure': P7ForcePressureCanvas,
  'abl-p3-sound': P3SoundCanvas,
  'abl-c1-states-of-matter': C1StatesOfMatterCanvas,
  'abl-c2-separation': C2SeparationCanvas,
  'abl-m1-triangles': M1TrianglesCanvas,
  'abl-m1-quadrilaterals': M1QuadrilateralsCanvas,
  'abl-b1-cell-microscope': B1CellMicroscopeCanvas,
  'abl-b2-photosynthesis': B2PhotosynthesisCanvas,
};

/**
 * TapovanSession — The CPU of VidyaSpark.
 *
 * 65/35 split: Experiment Canvas (left) + AI Classroom Panel (right)
 * The visual canvas is the HERO. The conversation is secondary.
 */
export default function TapovanSession({
  module, sessionId, onMentorPause, onEnd,
  mentorFeedback, hasPaused, initialTimer = 0,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studentStates, setStudentStates] = useState({
    priya:   { engagement: 'high', status: 'curious about the materials' },
    ravi:    { engagement: 'medium', status: 'arms crossed, watching' },
    lakshmi: { engagement: 'low', status: 'sitting quietly in back' },
    arjun:   { engagement: 'none', status: 'doodling in notebook' },
    meena:   { engagement: 'medium', status: 'notebook open, ready to copy' },
  });
  const [speakingStudent, setSpeakingStudent] = useState(null);
  const [timer, setTimer] = useState(initialTimer);
  const [sessionEnded, setSessionEnded] = useState(false);
  const chatEndRef = useRef(null);
  const timerRef = useRef(null);

  const canvasSteps = module?.canvasSteps || [];
  const totalSteps = canvasSteps.length;
  const CanvasComponent = CANVAS_MAP[module?.id];

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Mentor pause is now manual only — Ignator decides when to pause or end
  // No automatic interruption at 5 minutes

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add opening scene message
  useEffect(() => {
    if (module) {
      const openingScene = module.classroomConfig?.openingScene || module.openingScene ||
        `Welcome to the Tapovan. You're about to teach "${module.name}" to a class of 5 students. Begin whenever you're ready.`;
      setMessages([{
        id: 'system-0',
        speaker: 'System',
        text: openingScene,
        type: 'system',
      }]);
    }
  }, [module]);

  // If mentor feedback was received, show it as a system message
  useEffect(() => {
    if (mentorFeedback) {
      setMessages(prev => [...prev, {
        id: 'mentor-feedback',
        speaker: 'System',
        text: '⏯ Session resumed. Your mentor feedback is available. Apply it as you continue teaching.',
        type: 'system',
      }]);
    }
  }, [mentorFeedback]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const parseStudentResponses = (text) => {
    // Parse student messages from AI response
    const studentMessages = [];
    const lines = text.split('\n');
    let currentSpeaker = null;
    let currentText = '';

    for (const line of lines) {
      const match = line.match(/^\[(\w+)\]:\s*(.*)$/);
      if (match) {
        if (currentSpeaker) {
          studentMessages.push({ speaker: currentSpeaker, text: currentText.trim() });
        }
        currentSpeaker = match[1];
        currentText = match[2];
      } else if (currentSpeaker && line.trim()) {
        currentText += '\n' + line;
      }
    }
    if (currentSpeaker) {
      studentMessages.push({ speaker: currentSpeaker, text: currentText.trim() });
    }

    return studentMessages.length > 0 ? studentMessages : [{ speaker: 'Classroom', text }];
  };

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading || !sessionId) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      speaker: 'You',
      text: inputText.trim(),
      type: 'user',
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/negotiation/message`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: inputText.trim(),
          currentStep,
        }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      // Stream the response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
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
            const data = JSON.parse(line.slice(6));
            if (data.type === 'token') {
              fullResponse += data.token;
            } else if (data.type === 'done') {
              // Parse the response for student states JSON
              const jsonMatch = fullResponse.match(/\{[\s\S]*"studentStates"[\s\S]*\}/);
              if (jsonMatch) {
                try {
                  const parsed = JSON.parse(jsonMatch[0]);
                  if (parsed.studentStates) {
                    setStudentStates(parsed.studentStates);
                  }
                  if (parsed.canvasStep && parsed.canvasStep !== currentStep) {
                    setCurrentStep(parsed.canvasStep);
                  }
                  // Remove JSON from display text
                  fullResponse = fullResponse.replace(jsonMatch[0], '').trim();
                } catch (_) { /* ignore parse errors */ }
              }

              // Parse individual student messages
              const studentMsgs = parseStudentResponses(fullResponse);
              for (const msg of studentMsgs) {
                const speakerName = msg.speaker.toLowerCase();
                setSpeakingStudent(speakerName);
                setMessages(prev => [...prev, {
                  id: `ai-${Date.now()}-${speakerName}`,
                  speaker: msg.speaker,
                  text: msg.text,
                  type: 'student',
                }]);
              }
              setTimeout(() => setSpeakingStudent(null), 2000);
            }
          } catch (_) { /* skip malformed lines */ }
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        speaker: 'System',
        text: 'Connection issue. Please try again.',
        type: 'system',
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, sessionId, currentStep]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleStepChange = (newStep) => {
    if (newStep >= 1 && newStep <= totalSteps) {
      setCurrentStep(newStep);
    }
  };

  const handleEndSession = () => {
    setSessionEnded(true);
    clearInterval(timerRef.current);
    onEnd();
  };

  const getSpeakerColor = (speaker) => {
    const colors = {
      'Priya': 'text-student-curious',
      'Ravi': 'text-student-skeptic',
      'Lakshmi': 'text-student-shy',
      'Arjun': 'text-student-disengaged',
      'Meena': 'text-student-rote',
      'You': 'text-accent',
      'System': 'text-text-muted',
      'Classroom': 'text-text-secondary',
    };
    return colors[speaker] || 'text-text-secondary';
  };

  const currentStepData = canvasSteps.find(s => s.step === currentStep) || canvasSteps[0];

  return (
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-surface border-b border-border flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono text-accent uppercase tracking-wider font-semibold">
            {module?.ablCode}
          </span>
          <span className="text-base font-semibold text-text-primary">
            {module?.name}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-base text-text-secondary">
            Step {currentStep}/{totalSteps}
          </span>
          <span className="text-base font-mono text-text-primary bg-surface-light px-4 py-1.5 rounded-lg">
            {formatTime(timer)}
          </span>
          <AmbientAudio volume={0.5} playing={true} lowVolume={false} />
          <button
            onClick={handleEndSession}
            className="text-sm px-4 py-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors font-medium"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Main Content: Canvas (65%) + Classroom Panel (35%) */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Experiment Canvas — THE HERO */}
        <div className="w-[65%] flex flex-col bg-bg border-r border-border">
          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
            {CanvasComponent ? (
              <CanvasComponent currentStep={currentStep} />
            ) : (
              <div className="text-center text-text-muted">
                <p className="text-lg mb-2">Experiment Canvas</p>
                <p className="text-sm">{currentStepData?.description || 'Loading...'}</p>
              </div>
            )}
          </div>

          {/* Step Controls */}
          <div className="px-6 py-4 bg-surface border-t border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              {/* Step dots */}
              <div className="flex items-center gap-2">
                {canvasSteps.map((step) => (
                  <button
                    key={step.step}
                    onClick={() => handleStepChange(step.step)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      step.step === currentStep
                        ? 'bg-accent w-6'
                        : step.step < currentStep
                          ? 'bg-accent/40'
                          : 'bg-white/10'
                    }`}
                    title={step.title}
                  />
                ))}
              </div>

              {/* Step title */}
              <p className="text-sm text-text-muted">
                {currentStepData?.title}
              </p>

              {/* Navigation buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStepChange(currentStep - 1)}
                  disabled={currentStep <= 1}
                  className="px-4 py-2 text-sm rounded-lg bg-surface-light border border-border text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => handleStepChange(currentStep + 1)}
                  disabled={currentStep >= totalSteps}
                  className="px-5 py-2 text-sm rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium"
                >
                  Next Step →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: AI Classroom Panel */}
        <div className="w-[35%] flex flex-col bg-surface">
          {/* Student Roster */}
          <div className="flex-shrink-0 p-3 border-b border-border">
            <StudentRoster
              studentStates={studentStates}
              speakingStudent={speakingStudent}
            />
          </div>

          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`fade-in ${msg.type === 'user' ? 'ml-8' : msg.type === 'system' ? 'mx-4' : 'mr-4'}`}
              >
                {msg.type === 'system' ? (
                  <div className="text-sm text-text-muted italic bg-white/[0.02] rounded-lg px-4 py-3 border border-white/[0.04]">
                    {msg.text}
                  </div>
                ) : msg.type === 'user' ? (
                  <div className="bg-accent/10 border border-accent/20 rounded-xl rounded-br-sm px-5 py-3">
                    <p className="text-sm font-semibold text-accent mb-1">[You]</p>
                    <p className="text-base text-text-primary leading-relaxed">{msg.text}</p>
                  </div>
                ) : (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl rounded-bl-sm px-5 py-3">
                    <p className={`text-sm font-semibold mb-1 ${getSpeakerColor(msg.speaker)}`}>
                      [{msg.speaker}]
                    </p>
                    <p className="text-base text-text-secondary leading-relaxed">{msg.text}</p>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 px-4 py-2 text-text-muted">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm">Students are responding...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 p-3 border-t border-border">
            <div className="flex items-end gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What would you say to the class?"
                rows={2}
                className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 text-base text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-accent/40 transition-colors"
              />
              <div className="flex flex-col gap-1">
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className="p-3 rounded-xl bg-accent text-white hover:bg-accent-light disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
                <button
                  disabled
                  title="Voice input coming soon"
                  className="p-3 rounded-xl bg-surface-light text-text-muted cursor-not-allowed opacity-40"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m14 0a7 7 0 00-14 0m14 0v1a7 7 0 01-14 0v-1m7 8v4m-4 0h8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
