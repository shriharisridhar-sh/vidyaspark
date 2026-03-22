import { useEffect, useState } from 'react';
import { API_BASE } from '../utils/api';

/**
 * LoadingScreen — Generates the Tapovan teaching performance report.
 *
 * Props:
 *   sessionId   — the session to generate a report for
 *   onReportReady — callback with report data when generation completes
 *   moduleId    — (optional) for display purposes
 */
export default function LoadingScreen({ sessionId, onReportReady, moduleId }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID available. Cannot generate report.');
      return;
    }

    let cancelled = false;

    async function generateReport() {
      try {
        const res = await fetch(`${API_BASE}/api/report`, {
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to generate report');
        }

        const data = await res.json();
        if (!cancelled) {
          onReportReady(data.report);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      }
    }

    generateReport();

    return () => { cancelled = true; };
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const reflectionPrompts = [
    'Analyzing your teaching session...',
    'Evaluating student engagement patterns...',
    'Measuring curiosity sparking...',
    'Assessing inclusion and reach...',
    'Generating your personalized Tapovan report...',
  ];

  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIndex(prev => (prev + 1) % reflectionPrompts.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [reflectionPrompts.length]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="fade-in max-w-md text-center space-y-6">
        <div className="flex items-center gap-3 justify-center">
          <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
            <svg className="w-3 h-3 text-bg" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-success font-medium text-sm">Teaching session complete</span>
        </div>

        <div className="card border-accent/20">
          <p className="text-text-secondary text-xs uppercase tracking-wider mb-3">While you wait</p>
          <p className="text-text-primary text-base leading-relaxed font-medium fade-in" key={promptIndex}>
            {reflectionPrompts[promptIndex]}
          </p>
        </div>

        <div className="flex items-center gap-3 justify-center">
          <div className="spinner" />
          <span className="text-text-secondary text-sm">Building your Tapovan report...</span>
        </div>
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
