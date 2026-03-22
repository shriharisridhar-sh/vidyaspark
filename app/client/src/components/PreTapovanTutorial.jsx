import { useState } from 'react';
import AmbientAudio from './AmbientAudio';

/**
 * PreTapovanTutorial — 5-step lesson walkthrough before the Tapovan session.
 * The Ignator must click through all steps before entering the Tapovan.
 * Serene Tapovan ambient music plays during preparation.
 */
export default function PreTapovanTutorial({ module, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const tutorial = module?.tutorial || [];
  const totalSteps = tutorial.length;

  const stepIcons = [
    // Learning Objective
    <svg key="obj" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    // Materials & Setup
    <svg key="mat" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    // The Procedure
    <svg key="proc" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    // Key Messages
    <svg key="key" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    // Common Misconceptions
    <svg key="misc" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  ];

  if (!tutorial.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <p className="text-text-secondary mb-4">No tutorial available for this module.</p>
          <button onClick={onComplete} className="btn-primary">Enter the Tapovan →</button>
        </div>
      </div>
    );
  }

  const step = tutorial[currentStep];
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-12">
      {/* Ambient Tapovan music */}
      <div className="fixed top-4 right-4 z-50">
        <AmbientAudio volume={0.2} playing={true} />
      </div>

      {/* Header */}
      <div className="text-center mb-2">
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-1">
          {module.ablCode} — {module.subject}
        </p>
        <h2 className="text-2xl font-bold text-text-primary">
          {module.name}
        </h2>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 my-6">
        {tutorial.map((_, i) => (
          <button
            key={i}
            onClick={() => i <= currentStep && setCurrentStep(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === currentStep
                ? 'bg-accent w-8'
                : i < currentStep
                  ? 'bg-accent/50 cursor-pointer'
                  : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Step card */}
      <div className="w-full max-w-2xl">
        <div className="card fade-in" key={currentStep}>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-accent/10 text-accent flex-shrink-0">
              {stepIcons[currentStep] || stepIcons[0]}
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                Step {currentStep + 1} of {totalSteps}
              </p>
              <h3 className="text-xl font-semibold text-text-primary">
                {step.title}
              </h3>
            </div>
          </div>

          <div className="text-text-secondary leading-relaxed text-[15px] whitespace-pre-line">
            {step.content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          {isLast ? (
            <button
              onClick={onComplete}
              className="btn-primary flex items-center gap-2"
            >
              Enter the Tapovan
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(s => Math.min(totalSteps - 1, s + 1))}
              className="px-6 py-3 rounded-xl font-medium text-sm bg-surface-light border border-border hover:border-accent/30 text-text-primary transition-all"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
