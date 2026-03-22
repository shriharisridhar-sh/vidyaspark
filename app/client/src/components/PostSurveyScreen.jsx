import { useState, useEffect } from 'react';
import { API_BASE } from '../utils/api';

/**
 * PostSurveyScreen — Self-assessment + Weight Prediction (Discovery Model)
 *
 * Two-step assessment:
 *   Step 1: Self-rating question (module-aware)
 *   Step 2: "What do you think the customer's value equation looks like?" (sliders summing to ~100%)
 *
 * Loads dimensions dynamically from module config, falls back to Module 1 defaults.
 */
export default function PostSurveyScreen({ onComplete, moduleId }) {
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step1Question, setStep1Question] = useState('How well did you perform in the simulation?');
  const [moduleCategory, setModuleCategory] = useState(null);
  const [weights, setWeights] = useState({
    reliability: 20, hse: 20, technical: 20, service: 20, price: 20,
  });

  const scaleOptions = Array.from({ length: 10 }, (_, i) => i + 1);
  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleWeightChange = (dim, value) => {
    setWeights(prev => ({ ...prev, [dim]: parseInt(value) }));
  };

  const handleSubmit = () => {
    if (step === 1) {
      if (rating === null) return;
      setStep(2);
      return;
    }
    onComplete({ discoveryRating: rating, weightPrediction: weights });
  };

  const fallbackDimLabels = {
    reliability: { name: 'Reliability / Uptime', icon: '\u2699\uFE0F', hint: 'Equipment uptime, avoiding NPT' },
    hse: { name: 'HSE Compliance', icon: '\uD83D\uDEE1\uFE0F', hint: 'Safety record, regulatory compliance' },
    technical: { name: 'Technical Support', icon: '\uD83D\uDD27', hint: 'Engineering expertise, wellbore knowledge' },
    service: { name: 'Service Response', icon: '\u26A1', hint: 'Speed of mobilization and response' },
    price: { name: 'Pricing', icon: '\uD83D\uDCB0', hint: 'Cost competitiveness' },
  };

  const [dimLabels, setDimLabels] = useState(fallbackDimLabels);

  // Load module dimensions dynamically
  useEffect(() => {
    const id = moduleId || 'price-war';
    fetch(API_BASE + '/api/modules/config/' + id, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const mod = data.module;
        if (mod && mod.dimensions) {
          const labels = {};
          const w = {};
          mod.dimensions.forEach(d => {
            labels[d.shortName] = {
              name: d.name,
              icon: d.icon || '\uD83D\uDCCA',
              hint: d.hint || d.description || '',
            };
            w[d.shortName] = Math.floor(100 / mod.dimensions.length);
          });
          setDimLabels(labels);
          setWeights(w);
        }
        // Set module-aware step 1 question
        setModuleCategory(mod?.category || null);
        const question = mod?.category === 'B2B Negotiation'
          ? 'How well did you discover what the customer truly values?'
          : mod?.category
          ? 'How well did you handle the conversation?'
          : 'How well did you perform in the simulation?';
        setStep1Question(question);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to hardcoded Module 1 dimensions
        setDimLabels(fallbackDimLabels);
        setWeights({ reliability: 20, hse: 20, technical: 20, service: 20, price: 20 });
        setStep1Question('How well did you discover what the customer truly values?');
        setLoading(false);
      });
  }, [moduleId]);

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

        {/* Header */}
        <div className="text-center fade-in mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Before you see your results...
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed">
            {step === 1
              ? (moduleCategory && moduleCategory !== 'B2B Negotiation'
                ? 'Rate your own performance. Your self-assessment will be compared to your objective score.'
                : 'Rate your own performance. Your self-assessment will be compared to the objective Discovery Score.')
              : (moduleCategory && moduleCategory !== 'B2B Negotiation'
                ? 'Now predict what mattered most in this conversation. Allocate 100% across the dimensions.'
                : 'Now predict what you think the customer actually valued. Allocate 100% across the five dimensions.')}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={"w-2 h-2 rounded-full transition-all " + (step === 1 ? 'bg-accent w-6' : 'bg-border')} />
            <div className={"w-2 h-2 rounded-full transition-all " + (step === 2 ? 'bg-accent w-6' : 'bg-border')} />
          </div>
        </div>

        {step === 1 && (
          <div className="card fade-in mb-8" style={{ animationDelay: '200ms' }}>
            <label className="text-text-primary font-medium block mb-2 text-center">
              {step1Question}
            </label>
            <p className="text-text-secondary text-xs text-center mb-6">
              {moduleCategory && moduleCategory !== 'B2B Negotiation'
                ? 'How well did you balance clarity with empathy throughout the conversation?'
                : 'Beyond what they said out loud - did you uncover their hidden priorities?'}
            </p>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-text-secondary text-xs mr-2">Not at all</span>
              {scaleOptions.map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={"w-10 h-10 rounded-xl text-sm font-medium transition-all " + (
                    rating === n
                      ? 'bg-accent text-white scale-110 shadow-lg shadow-accent/30'
                      : 'bg-surface border border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
                  )}
                >
                  {n}
                </button>
              ))}
              <span className="text-text-secondary text-xs ml-2">Completely</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card fade-in mb-4">
            <label className="text-text-primary font-medium block mb-1 text-center">
              {moduleCategory && moduleCategory !== 'B2B Negotiation'
                ? 'What mattered most in this conversation?'
                : "What was the customer's value equation?"}
            </label>
            <p className="text-text-secondary text-xs text-center mb-6">
              {moduleCategory && moduleCategory !== 'B2B Negotiation'
                ? 'How important was each element? Drag sliders to allocate 100%.'
                : 'How much did each factor REALLY matter to them? Drag sliders to allocate 100%.'}
            </p>

            <div className="space-y-5">
              {Object.entries(dimLabels).map(([dim, info]) => (
                <div key={dim}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{info.icon}</span>
                      <span className="text-text-primary text-sm font-medium">{info.name}</span>
                    </div>
                    <span className={"text-sm font-bold font-mono " + (
                      weights[dim] >= 25 ? 'text-accent' : weights[dim] >= 15 ? 'text-text-primary' : 'text-text-secondary'
                    )}>
                      {weights[dim]}%
                    </span>
                  </div>
                  <p className="text-text-secondary text-xs mb-1.5">{info.hint}</p>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={weights[dim]}
                    onChange={(e) => handleWeightChange(dim, e.target.value)}
                    className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-accent"
                  />
                </div>
              ))}
            </div>

            <div className={"mt-6 text-center py-2 rounded-lg text-sm font-medium " + (
              total === 100
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            )}>
              Total: {total}% {total === 100 ? '\u2713' : total < 100 ? '- add ' + (100 - total) + '% more' : '- remove ' + (total - 100) + '%'}
            </div>
          </div>
        )}

        <div className="text-center fade-in" style={{ animationDelay: '400ms' }}>
          <button
            onClick={handleSubmit}
            disabled={step === 1 ? rating === null : total !== 100}
            className={"btn-primary px-8 py-3 text-sm transition-all " + (
              (step === 1 ? rating !== null : total === 100) ? 'opacity-100' : 'opacity-30 cursor-not-allowed'
            )}
          >
            {step === 1
              ? (moduleCategory && moduleCategory !== 'B2B Negotiation' ? 'Next: Predict the Priorities' : 'Next: Predict the Value Equation')
              : (moduleCategory && moduleCategory !== 'B2B Negotiation' ? 'See My Results' : 'See My Discovery Score')}
          </button>
        </div>
      </div>
    </div>
  );
}
