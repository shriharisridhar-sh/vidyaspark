import { useState, useEffect } from 'react';
import { API_BASE } from '../utils/api';

export default function ModuleSelectionScreen({ onSelect }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_BASE + '/api/modules/available', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setModules(d.modules || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8">
      <div className="max-w-lg w-full">
        <div className="text-center fade-in mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Choose Your Simulation</h1>
          <p className="text-text-secondary text-sm">Select a module to begin practicing.</p>
        </div>

        <div className="space-y-3 fade-in" style={{ animationDelay: '200ms' }}>
          {modules.map(mod => (
            <button
              key={mod.id}
              onClick={() => onSelect(mod.id)}
              className="w-full text-left card hover:border-accent/50 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-text-primary group-hover:text-accent transition-colors">
                    {mod.name}
                  </h3>
                  <p className="text-text-secondary text-xs mt-1 leading-relaxed">{mod.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-text-secondary">
                    <span>{mod.category || 'Simulation'}</span>
                    <span>~{mod.estimatedMinutes || 20} min</span>
                    <span className={"capitalize px-1.5 py-0.5 rounded " + (
                      mod.difficulty === 'hard' ? 'bg-red-500/10 text-red-400' :
                      mod.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    )}>{mod.difficulty || 'medium'}</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-text-secondary/30 group-hover:text-accent transition-colors flex-shrink-0 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {modules.length === 0 && (
          <div className="card text-center py-8">
            <p className="text-text-secondary">No modules available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
