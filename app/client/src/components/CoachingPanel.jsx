import { useRef, useEffect } from 'react';

export default function CoachingPanel({ messages, cadence }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-surface/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <h3 className="text-sm font-semibold text-text-primary">Coach Feedback</h3>
      </div>

      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary text-sm text-center">
            {cadence === 'real_time'
              ? 'Coaching feedback will appear here as the conversation progresses.'
              : 'No coaching feedback yet.'}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className="fade-in card border-accent/20 bg-accent/5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-accent">
                {msg.source === 'ai' ? 'AI COACH' : 'COACH'}
              </span>
              {msg.focus && msg.focus !== 'general' && (
                <span className="text-xs text-text-secondary">
                  {msg.focus === 'salience_vs_importance' ? 'Salience vs Importance'
                    : msg.focus === 'importance_weights' ? 'Importance Weights'
                    : msg.focus === 'competitive_ip' ? 'Competitive IP'
                    : msg.focus}
                </span>
              )}
            </div>
            <p className="text-text-primary text-sm leading-relaxed">{msg.content}</p>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
    </div>
  );
}
