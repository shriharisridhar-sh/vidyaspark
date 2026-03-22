import { useEffect, useState } from 'react';
import { API_BASE } from '../utils/api';
import { useSession } from '../contexts/SessionContext';

export default function LoadingScreen({ onReportReady, moduleId }) {
  const { sessionId } = useSession();
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function generateReport() {
      try {
        const body = { sessionId };

        const res = await fetch(`${API_BASE}/api/report`, { credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [completionLabel, setCompletionLabel] = useState('Simulation complete');
  const [reflectionPrompts, setReflectionPrompts] = useState([
    "While we analyze your performance, think about this:",
    "What was the first thing you said - and why?",
    "What did you notice about the conversation flow?",
    "What question do you wish you had asked?",
  ]);

  useEffect(() => {
    const id = moduleId || 'abl-p7-force-pressure';
    fetch(API_BASE + '/api/modules/config/' + id, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        const mod = d.module;
        if (mod) {
          setCompletionLabel(
            mod.category !== 'B2B Negotiation' ? 'Conversation complete' : 'Negotiation complete'
          );
          const modulePrompts = [
            'Processing your conversation...',
            `Analyzing your ${mod.skills?.[0]?.name || 'performance'}...`,
            `Evaluating your ${mod.skills?.[1]?.name || 'approach'}...`,
            'Generating your personalized report...',
          ];
          setReflectionPrompts(modulePrompts);
        }
      })
      .catch(() => {});
  }, [moduleId]);

  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIndex(prev => (prev + 1) % reflectionPrompts.length);
    }, 4000);
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
          <span className="text-success font-medium text-sm">{completionLabel}</span>
        </div>

        <div className="card border-accent/20">
          <p className="text-text-secondary text-xs uppercase tracking-wider mb-3">While you wait</p>
          <p className="text-text-primary text-base leading-relaxed font-medium fade-in" key={promptIndex}>
            {reflectionPrompts[promptIndex]}
          </p>
        </div>

        <div className="flex items-center gap-3 justify-center">
          <div className="spinner" />
          <span className="text-text-secondary text-sm">Analyzing your conversation...</span>
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
