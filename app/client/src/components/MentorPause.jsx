import { useState } from 'react';
import { API_BASE } from '../utils/api';

/**
 * MentorPause — Feedback choice screen at the 5-minute mark.
 * Ignator chooses AI Mentor (instant) or Human Mentor (async).
 */
export default function MentorPause({ sessionId, onComplete }) {
  const [choice, setChoice] = useState(null); // 'ai' | 'human'
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [humanSent, setHumanSent] = useState(false);

  const requestAIFeedback = async () => {
    setChoice('ai');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/coaching/request`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, type: 'mentor_pause' }),
      });
      if (!res.ok) throw new Error('Failed to get feedback');

      const data = await res.json();

      // The coaching/request endpoint returns { status, coaching, intervention }
      // coaching has { coaching: string, focus: string }
      // intervention has { content, source, focus, timestamp }
      if (data.coaching || data.intervention) {
        const coachingText = data.coaching?.coaching || data.intervention?.content || '';
        const focus = data.coaching?.focus || data.intervention?.focus || '';

        // Structure feedback items from the coaching text
        const feedbackItems = [];
        if (coachingText) {
          // Split coaching text into bullet points or paragraphs for display
          const lines = coachingText.split('\n').filter(l => l.trim());
          for (const line of lines) {
            const isStrength = /strength|well|good|great|excellent/i.test(line);
            feedbackItems.push({
              type: isStrength ? 'strength' : 'suggestion',
              message: line.replace(/^[-*•]\s*/, ''),
              moment: focus || 'Session',
            });
          }
        }

        if (feedbackItems.length === 0) {
          feedbackItems.push({
            type: 'note',
            message: coachingText || 'Feedback generated successfully.',
            moment: 'Session',
          });
        }

        setFeedback({
          feedback: feedbackItems,
          overallNote: focus ? `Focus area: ${focus}` : 'Review complete.',
        });
      } else {
        setFeedback({
          feedback: [{ type: 'note', message: 'Feedback generated. Continue teaching with renewed focus.', moment: 'Session' }],
          overallNote: 'Review complete.',
        });
      }
    } catch (err) {
      setFeedback({
        feedback: [{ type: 'note', message: 'Could not generate feedback. Please continue teaching.', moment: '' }],
        overallNote: 'Connection issue occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  const requestHumanFeedback = async () => {
    setChoice('human');
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/session/${sessionId}/mentor-request`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorRequested: true }),
      });
    } catch (_) {}
    setHumanSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <span className="text-lg">⏸</span>
            <span className="text-sm font-medium text-accent">Session Paused</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Mentor Review</h2>
          <p className="text-text-secondary">
            You've been teaching for 5 minutes. Time to get some feedback before you continue.
          </p>
        </div>

        {/* Choice cards */}
        {!choice && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button onClick={requestAIFeedback} className="card text-left hover:border-accent/30 transition-all group">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">AI Mentor</h3>
              <p className="text-sm text-text-secondary mb-4">
                Instant feedback based on your session transcript, ABL handbook, and student engagement.
              </p>
              <span className="text-xs text-accent font-medium group-hover:underline">Get AI Feedback →</span>
            </button>

            <button onClick={requestHumanFeedback} className="card text-left hover:border-secondary/30 transition-all group">
              <div className="text-3xl mb-3">👤</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Human Mentor</h3>
              <p className="text-sm text-text-secondary mb-4">
                Send your transcript to a Catalyzer for personal feedback within 24 hours.
              </p>
              <span className="text-xs text-secondary font-medium group-hover:underline">Request Human Review →</span>
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-text-secondary">
              {choice === 'ai' ? 'AI Mentor is reviewing your session...' : 'Sending transcript...'}
            </p>
          </div>
        )}

        {/* AI Feedback */}
        {feedback && !loading && (
          <div className="space-y-3 mb-8">
            {(feedback.feedback || []).map((item, i) => (
              <div
                key={i}
                className={`card border-l-4 ${
                  item.type === 'strength' ? 'border-l-success' : 'border-l-accent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">
                    {item.type === 'strength' ? '✅' : '💡'}
                  </span>
                  <div>
                    <p className="text-sm text-text-primary leading-relaxed">{item.message}</p>
                    {item.moment && (
                      <p className="text-xs text-text-muted mt-1">{item.moment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {feedback.overallNote && (
              <div className="card bg-surface-light">
                <p className="text-sm text-text-secondary italic">{feedback.overallNote}</p>
              </div>
            )}
          </div>
        )}

        {/* Human feedback sent */}
        {humanSent && !loading && (
          <div className="card text-center mb-8">
            <div className="text-3xl mb-3">📨</div>
            <p className="text-text-primary font-medium mb-2">Transcript sent!</p>
            <p className="text-sm text-text-secondary">
              Your assigned Catalyzer will review your session and provide feedback within 24 hours.
              In the meantime, continue practicing.
            </p>
          </div>
        )}

        {/* Resume button */}
        {(feedback || humanSent) && !loading && (
          <div className="text-center">
            <button
              onClick={() => onComplete(feedback)}
              className="btn-primary"
            >
              Resume Session →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
