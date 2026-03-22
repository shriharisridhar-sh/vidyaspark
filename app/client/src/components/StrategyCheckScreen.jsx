import { useState, useEffect } from 'react';
import { API_BASE } from '../utils/api';

const DEFAULT_APPROACH_OPTIONS = [
  { value: 'match_price', label: 'Match or discount the price to keep the account' },
  { value: 'hold_price', label: 'Hold your price and make the case for value' },
  { value: 'ask_first', label: "Ask the customer what's really driving this before responding" },
  { value: 'partial_concession', label: 'Offer a smaller concession while shifting the conversation' },
  { value: 'other', label: "I'd approach this differently..." },
];

const HARD_CALL_APPROACH_OPTIONS = [
  { value: 'direct_first', label: 'State the outcome clearly and directly at the start' },
  { value: 'empathy_first', label: 'Start with empathy and acknowledgment before delivering the news' },
  { value: 'ask_first', label: 'Ask how they are feeling before sharing any information' },
  { value: 'context_first', label: 'Explain the process and reasoning first, then share the outcome' },
  { value: 'other', label: "I'd approach this differently..." },
];

/**
 * StrategyCheckScreen -- Pre-simulation strategy capture.
 * Module-aware: loads dimensions and approach options from module config.
 */
export default function StrategyCheckScreen({ onStart, moduleId }) {
  const [step, setStep] = useState(1);
  const [approach, setApproach] = useState(null);
  const [otherText, setOtherText] = useState('');
  const [topPriority, setTopPriority] = useState(null);
  const [secondPriority, setSecondPriority] = useState(null);
  const [moduleConfig, setModuleConfig] = useState(null);
  const [dimensions, setDimensions] = useState([]);
  const [approachOptions, setApproachOptions] = useState(DEFAULT_APPROACH_OPTIONS);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const id = moduleId || 'price-war';
    fetch(API_BASE + '/api/modules/config/' + id, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        const mod = d.module;
        if (mod) {
          setModuleConfig(mod);
          // Set dimensions from module
          if (mod.dimensions) {
            setDimensions(mod.dimensions.map(dim => ({
              id: dim.shortName,
              name: dim.name,
              icon: dim.icon || '\u{1F4CA}',
            })));
          }
          // Set approach options from module config, or fallback by category
          if (mod.approachOptions && mod.approachOptions.length > 0) {
            setApproachOptions(mod.approachOptions);
          } else if (mod.category !== 'B2B Negotiation') {
            setApproachOptions(HARD_CALL_APPROACH_OPTIONS);
          }
          // Set skills from module
          if (mod.skills) {
            setSkills(mod.skills.map((s, i) => ({
              name: s.name,
              description: s.description || s.levels?.expert?.description || '',
              color: i === 0 ? 'blue' : i === 1 ? 'purple' : 'amber',
            })));
          }
        }
      })
      .catch(() => {});
  }, [moduleId]);

  const canProceedStep1 = approach && (approach !== 'other' || otherText.trim().length > 0);
  const canProceedStep2 = topPriority && secondPriority;

  const handleStart = () => {
    onStart({
      choice: approach,
      reasoning: approach === 'other' ? otherText.trim() : '',
      priorityPrediction: {
        first: topPriority,
        second: secondPriority,
      },
    });
  };

  const isConversationModule = !!moduleConfig?.category && moduleConfig.category !== 'B2B Negotiation';

  const stepLabels = isConversationModule
    ? ["What's Your Approach?", "What Matters Most?", "What This Reveals About You"]
    : ["What's Your Instinct?", "What Matters Most?", "What This Reveals About You"];

  const stepDescriptions = isConversationModule
    ? [
        'Based on the briefing, how would you start this conversation?',
        "Predict what priorities matter most in this conversation.",
        "After the simulation, you'll see exactly how well you handled it.",
      ]
    : [
        'Based on the briefing, how would you approach this meeting?',
        "Predict what you think this customer values most.",
        "After the negotiation, you'll see exactly how well you read this customer.",
      ];

  const enterButtonText = isConversationModule
    ? 'Start the Conversation \u2192'
    : 'Enter the Meeting \u2192';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8">
      <div className="max-w-lg w-full fade-in">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-text-secondary text-xs font-mono tracking-widest uppercase mb-2">
            Strategy Check
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">
            {stepLabels[step - 1]}
          </h1>
          <p className="text-text-secondary text-sm">
            {stepDescriptions[step - 1]}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={"h-1.5 rounded-full transition-all " + (
                s === step ? 'bg-accent w-8' : s < step ? 'bg-accent/50 w-4' : 'bg-border w-4'
              )} />
            ))}
          </div>
        </div>

        {/* Step 1: Approach */}
        {step === 1 && (
          <div className="fade-in">
            <div className="card mb-6">
              <div className="space-y-2">
                {approachOptions.map(opt => (
                  <label
                    key={opt.value}
                    className={"flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all text-sm " + (
                      approach === opt.value
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-text-secondary/30'
                    )}
                  >
                    <input
                      type="radio"
                      name="approach"
                      value={opt.value}
                      checked={approach === opt.value}
                      onChange={() => setApproach(opt.value)}
                      className="accent-accent"
                    />
                    <span className="text-text-primary">{opt.label}</span>
                  </label>
                ))}
              </div>

              {approach === 'other' && (
                <textarea
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Describe your approach..."
                  className="w-full mt-3 bg-bg border border-border rounded-lg p-3 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent resize-none"
                  rows={3}
                  autoFocus
                />
              )}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className={"btn-primary w-full py-3 transition-all " + (canProceedStep1 ? '' : 'opacity-30 cursor-not-allowed')}
            >
              Next: Predict Priorities
            </button>
          </div>
        )}

        {/* Step 2: Priority Prediction */}
        {step === 2 && (
          <div className="fade-in">
            <div className="card mb-4">
              <label className="text-text-primary font-medium block mb-3 text-sm">
                What do you think is the <span className="text-accent font-bold">#1 priority</span>?
              </label>
              <div className="space-y-1.5">
                {dimensions.map(dim => (
                  <button
                    key={dim.id}
                    onClick={() => {
                      setTopPriority(dim.id);
                      if (secondPriority === dim.id) setSecondPriority(null);
                    }}
                    className={"w-full text-left px-4 py-2.5 rounded-lg border transition-all flex items-center gap-3 text-sm " + (
                      topPriority === dim.id
                        ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                        : 'border-border hover:border-text-secondary/30'
                    )}
                  >
                    <span className="text-base">{dim.icon}</span>
                    <span className="text-text-primary">{dim.name}</span>
                    {topPriority === dim.id && (
                      <span className="ml-auto text-accent text-xs font-bold">#1</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {topPriority && (
              <div className="card mb-4 fade-in">
                <label className="text-text-primary font-medium block mb-3 text-sm">
                  And the <span className="text-accent font-bold">#2 priority</span>?
                </label>
                <div className="space-y-1.5">
                  {dimensions.filter(d => d.id !== topPriority).map(dim => (
                    <button
                      key={dim.id}
                      onClick={() => setSecondPriority(dim.id)}
                      className={"w-full text-left px-4 py-2.5 rounded-lg border transition-all flex items-center gap-3 text-sm " + (
                        secondPriority === dim.id
                          ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                          : 'border-border hover:border-text-secondary/30'
                      )}
                    >
                      <span className="text-base">{dim.icon}</span>
                      <span className="text-text-primary">{dim.name}</span>
                      {secondPriority === dim.id && (
                        <span className="ml-auto text-accent text-xs font-bold">#2</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 text-sm rounded-lg text-text-secondary hover:text-text-primary transition-colors border border-border"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className={"btn-primary flex-1 py-3 transition-all " + (canProceedStep2 ? '' : 'opacity-30 cursor-not-allowed')}
              >
                Next: See What's Measured
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Skills Being Measured + Enter */}
        {step === 3 && (
          <div className="fade-in">
            <div className="card mb-4">
              <div className="text-xs text-accent font-mono uppercase tracking-wider mb-3">
                What You'll Learn About Yourself
              </div>
              <div className="space-y-4">
                {skills.length > 0 ? skills.map((skill, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={"w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 " + (
                      skill.color === 'blue' ? 'bg-blue-500/10' : skill.color === 'purple' ? 'bg-purple-500/10' : 'bg-amber-500/10'
                    )}>
                      <span className={"font-bold text-sm " + (
                        skill.color === 'blue' ? 'text-blue-400' : skill.color === 'purple' ? 'text-purple-400' : 'text-amber-400'
                      )}>{i + 1}</span>
                    </div>
                    <div>
                      <div className="text-text-primary font-semibold text-sm">{skill.name}</div>
                      <p className="text-text-secondary text-xs leading-relaxed">{skill.description}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-text-secondary text-sm">Loading skills...</p>
                )}
              </div>
            </div>

            <div className="bg-surface rounded-xl p-4 border border-border mb-6">
              <p className="text-text-secondary text-xs leading-relaxed text-center">
                Your scores will be compared to your self-assessment after the simulation.
                <span className="text-text-primary font-medium"> Most people are surprised by the gap.</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-3 text-sm rounded-lg text-text-secondary hover:text-text-primary transition-colors border border-border"
              >
                Back
              </button>
              <button onClick={handleStart} className="btn-primary flex-1 py-3 text-base font-semibold">
                {enterButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
