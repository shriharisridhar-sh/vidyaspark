import { useState, useEffect } from 'react';
import { API_BASE } from '../utils/api';

const STUDENT_COLORS = {
  priya: 'text-student-curious border-student-curious/30',
  ravi: 'text-student-skeptic border-student-skeptic/30',
  lakshmi: 'text-student-shy border-student-shy/30',
  arjun: 'text-student-disengaged border-student-disengaged/30',
  meena: 'text-student-rote border-student-rote/30',
};

const STUDENT_BG = {
  priya: 'bg-student-curious/10',
  ravi: 'bg-student-skeptic/10',
  lakshmi: 'bg-student-shy/10',
  arjun: 'bg-student-disengaged/10',
  meena: 'bg-student-rote/10',
};

const STUDENT_NAMES = {
  priya: 'Priya', ravi: 'Ravi', lakshmi: 'Lakshmi', arjun: 'Arjun', meena: 'Meena',
};

const STUDENT_TRAITS = {
  priya: 'The Curious One',
  ravi: 'The Skeptic',
  lakshmi: 'The Shy One',
  arjun: 'The Disengaged',
  meena: 'The Rote Learner',
};

const QUESTION_TYPE_COLORS = {
  recall: 'bg-blue-500/20 text-blue-400',
  understanding: 'bg-purple-500/20 text-purple-400',
  application: 'bg-amber-500/20 text-amber-400',
  analysis: 'bg-red-500/20 text-red-400',
};

/**
 * PostSessionAssessment — AI students take a 10-question comprehension test.
 * Results reflect how well the Ignator taught each student archetype.
 */
export default function PostSessionAssessment({ sessionId, module, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [assessmentData, setAssessmentData] = useState(null);
  const [selfRating, setSelfRating] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [error, setError] = useState(null);

  // Fetch assessment from server
  useEffect(() => {
    if (!sessionId) return;

    fetch(`${API_BASE}/api/assessment/${sessionId}`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(r => {
        if (!r.ok) throw new Error(`Assessment failed: ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (data.error) throw new Error(data.error);
        setAssessmentData(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('[Assessment] Failed:', err.message);
        setError(err.message);
        setLoading(false);
      });
  }, [sessionId]);

  // Reveal student results one by one
  useEffect(() => {
    if (!showResults || !assessmentData) return;
    const students = Object.keys(assessmentData.studentResults || {});
    if (revealIndex >= students.length) return;

    const timer = setTimeout(() => {
      setRevealIndex(prev => prev + 1);
    }, 600);
    return () => clearTimeout(timer);
  }, [showResults, revealIndex, assessmentData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-6"></div>
          <p className="text-xl text-text-primary font-semibold mb-2">Your students are taking the test...</p>
          <p className="text-base text-text-secondary">Generating 10 comprehension questions based on your teaching session</p>
          <p className="text-sm text-text-muted mt-3">This takes about 10 seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-xl text-danger font-semibold mb-2">Assessment Failed</p>
          <p className="text-base text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => onComplete({ error: true })}
            className="btn-primary"
          >
            Skip to Report →
          </button>
        </div>
      </div>
    );
  }

  const students = assessmentData ? Object.entries(assessmentData.studentResults || {}) : [];
  const questions = assessmentData?.questions || [];
  const totalQs = questions.length;

  // Compute composite score when self-rating is set
  const studentAchievement = assessmentData?.studentAchievement || 0;
  const confidence = selfRating * 20;
  const compositeScore = Math.round(0.70 * studentAchievement + 0.30 * confidence);

  return (
    <div className="min-h-screen bg-bg px-6 py-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-accent font-semibold mb-3">Post-Session Assessment</p>
          <h2 className="text-3xl font-bold text-text-primary mb-3">How Did Your Students Do?</h2>
          <p className="text-lg text-text-secondary">
            Your 5 AI students answered {totalQs} comprehension questions. Their results reflect how well they were taught.
          </p>
        </div>

        {!showResults ? (
          <>
            {/* Questions preview */}
            <div className="space-y-3 mb-10">
              {questions.map((q, i) => (
                <div key={q.id || i} className="card">
                  <div className="flex items-start gap-4">
                    <span className="text-sm font-mono text-text-muted bg-surface-light px-3 py-1.5 rounded flex-shrink-0">
                      Q{i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-base text-text-primary leading-relaxed">{q.question}</p>
                      <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full capitalize font-medium ${QUESTION_TYPE_COLORS[q.type] || 'bg-white/10 text-text-muted'}`}>
                        {q.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Self-confidence rating */}
            <div className="card mb-8">
              <p className="text-lg text-text-primary font-semibold mb-2">
                How confident do you feel to deliver this module to live students?
              </p>
              <p className="text-sm text-text-muted mb-5">
                This counts for 30% of your overall score
              </p>
              <div className="flex items-center justify-center gap-4">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setSelfRating(n)}
                    className={`w-14 h-14 rounded-xl text-lg font-bold transition-all ${
                      selfRating === n
                        ? 'bg-accent text-white scale-110 shadow-lg shadow-accent/30'
                        : selfRating > 0 && n <= selfRating
                          ? 'bg-accent/20 text-accent'
                          : 'bg-surface-light text-text-muted hover:bg-white/[0.06]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-sm text-text-muted mt-3 px-4">
                <span>Not confident at all</span>
                <span>Very confident</span>
              </div>
            </div>

            {selfRating > 0 && (
              <div className="text-center fade-in">
                <button
                  onClick={() => { setShowResults(true); setRevealIndex(0); }}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Reveal Student Results →
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Student Results — revealed one by one */}
            <div className="space-y-4 mb-10">
              {students.map(([id, result], i) => (
                <div
                  key={id}
                  className={`card border-l-4 transition-all duration-500 ${STUDENT_COLORS[id] || ''} ${
                    i <= revealIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${STUDENT_COLORS[id]?.split(' ')[0]}`}>
                        {STUDENT_NAMES[id]}
                      </span>
                      <span className="text-sm text-text-muted">{STUDENT_TRAITS[id]}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-text-primary">{result.score}/{totalQs}</span>
                      <span className="text-sm text-text-muted ml-2">
                        ({Math.round((result.score / totalQs) * 100)}%)
                      </span>
                    </div>
                  </div>

                  {/* Answer grid */}
                  <div className="flex gap-1.5 mb-3">
                    {(result.answers || []).map((a, qi) => (
                      <div
                        key={qi}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          a.correct
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                        title={`Q${a.questionId || qi + 1}: ${a.correct ? '✓' : '✗'}`}
                      >
                        {a.correct ? '✓' : '✗'}
                      </div>
                    ))}
                  </div>

                  <p className="text-base text-text-secondary leading-relaxed">{result.note}</p>
                </div>
              ))}
            </div>

            {/* Class Average + Composite Score */}
            {revealIndex >= students.length - 1 && (
              <div className="grid grid-cols-2 gap-4 mb-10 fade-in">
                <div className="card bg-surface-light text-center">
                  <p className="text-sm text-text-muted uppercase tracking-wider mb-2">Class Average</p>
                  <p className="text-4xl font-bold text-text-primary">
                    {assessmentData.classAverage?.toFixed(1)}/{totalQs}
                  </p>
                  <p className="text-base text-text-secondary mt-1">
                    {Math.round(studentAchievement)}% achievement
                  </p>
                </div>
                <div className="card bg-accent/5 border-accent/20 text-center">
                  <p className="text-sm text-accent uppercase tracking-wider mb-2">Your VidyaSpark Score</p>
                  <p className="text-4xl font-bold text-accent">
                    {compositeScore}
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    70% students ({Math.round(studentAchievement)}%) + 30% confidence ({confidence}%)
                  </p>
                </div>
              </div>
            )}

            {/* Continue to full report */}
            {revealIndex >= students.length - 1 && (
              <div className="text-center fade-in">
                <button
                  onClick={() => onComplete({
                    ...assessmentData,
                    selfRating,
                    compositeScore,
                    confidence,
                  })}
                  className="btn-primary text-lg px-8 py-4"
                >
                  View Your Full Report →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
