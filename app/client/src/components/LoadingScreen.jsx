import { useEffect, useState } from 'react';

/**
 * LoadingScreen — Brief transition between Assessment and Report.
 *
 * The full report is now built from assessmentData (generated in PostSessionAssessment).
 * This screen just shows a polished 2-second transition with reflective prompts,
 * then calls onReportReady to advance to ReportScreen.
 */
export default function LoadingScreen({ sessionId, onReportReady, moduleId }) {
  const [promptIndex, setPromptIndex] = useState(0);

  const reflectionPrompts = [
    'Compiling your teaching report...',
    'Analyzing concept coverage...',
    'Building personalized coaching tips...',
    'Preparing your VidyaSpark score...',
    'Almost ready...',
  ];

  // Cycle through prompts
  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIndex(prev => (prev + 1) % 5);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // After 3 seconds, advance to report
  useEffect(() => {
    const timer = setTimeout(() => {
      onReportReady({}); // Report data comes from assessmentData, not here
    }, 3000);
    return () => clearTimeout(timer);
  }, [onReportReady]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="fade-in max-w-md text-center space-y-8">
        <div className="flex items-center gap-3 justify-center">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-green-400 font-semibold text-base">Teaching session complete</span>
        </div>

        <div className="card border-accent/20">
          <p className="text-text-secondary text-sm uppercase tracking-wider mb-4">Preparing your report</p>
          <p className="text-text-primary text-lg leading-relaxed font-medium fade-in" key={promptIndex}>
            {reflectionPrompts[promptIndex]}
          </p>
        </div>

        <div className="flex items-center gap-3 justify-center">
          <div className="spinner" />
          <span className="text-text-secondary text-base">Building your VidyaSpark report...</span>
        </div>
      </div>
    </div>
  );
}
