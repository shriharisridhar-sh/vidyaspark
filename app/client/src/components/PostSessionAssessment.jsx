import { useState, useEffect } from 'react';
import { API_BASE } from '../utils/api';

const STUDENT_COLORS = {
  priya: 'text-student-curious border-student-curious/30',
  ravi: 'text-student-skeptic border-student-skeptic/30',
  lakshmi: 'text-student-shy border-student-shy/30',
  arjun: 'text-student-disengaged border-student-disengaged/30',
  meena: 'text-student-rote border-student-rote/30',
};

const STUDENT_NAMES = {
  priya: 'Priya', ravi: 'Ravi', lakshmi: 'Lakshmi', arjun: 'Arjun', meena: 'Meena',
};

/**
 * PostSessionAssessment — AI students take a comprehension test.
 * Results reflect how well the Ignator taught each student.
 */
export default function PostSessionAssessment({ sessionId, module, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [assessmentData, setAssessmentData] = useState(null);
  const [selfRating, setSelfRating] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [revealIndex, setRevealIndex] = useState(-1);

  // Fetch assessment from server
  useEffect(() => {
    if (!sessionId) return;

    fetch(`${API_BASE}/api/assessment/${sessionId}`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(r => r.json())
      .then(data => {
        setAssessmentData(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('[Assessment] Failed:', err.message);
        // Fallback assessment
        setAssessmentData({
          questions: [
            { id: 1, question: 'Assessment could not be generated.', type: 'recall', correctAnswer: '-' },
          ],
          studentResults: {
            priya: { score: 0, answers: [], note: 'Assessment unavailable' },
            ravi: { score: 0, answers: [], note: 'Assessment unavailable' },
            lakshmi: { score: 0, answers: [], note: 'Assessment unavailable' },
            arjun: { score: 0, answers: [], note: 'Assessment unavailable' },
            meena: { score: 0, answers: [], note: 'Assessment unavailable' },
          },
          classAverage: 0,
        });
        setLoading(false);
      });
  }, [sessionId]);

  // Reveal student results one by one
  useEffect(() => {
    if (!showResults || !assessmentData) return;
    const students = Object.keys(assessmentData.studentResults);
    if (revealIndex >= students.length) return;

    const timer = setTimeout(() => {
      setRevealIndex(prev => prev + 1);
    }, 800);
    return () => clearTimeout(timer);
  }, [showResults, revealIndex, assessmentData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-text-secondary">Your students are taking the test...</p>
          <p className="text-xs text-text-muted mt-2">Generating comprehension questions based on your teaching session</p>
        </div>
      </div>
    );
  }

  const students = assessmentData ? Object.entries(assessmentData.studentResults) : [];
  const questions = assessmentData?.questions || [];
  const totalQs = questions.length;

  return (
    <div className="min-h-screen bg-bg px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-2">Post-Session Assessment</p>
          <h2 className="text-2xl font-bold text-text-primary mb-2">How Did Your Students Do?</h2>
          <p className="text-text-secondary text-sm">
            Your 5 AI students answered {totalQs} comprehension questions. Their results reflect how well they were taught.
          </p>
        </div>

        {!showResults ? (
          <>
            {/* Questions preview */}
            <div className="space-y-3 mb-8">
              {questions.map((q, i) => (
                <div key={q.id} className="card">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono text-text-muted bg-surface-light px-2 py-1 rounded">
                      Q{i + 1}
                    </span>
                    <div>
                      <p className="text-sm text-text-primary">{q.question}</p>
                      <p className="text-xs text-text-muted mt-1 capitalize">{q.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => { setShowResults(true); setRevealIndex(0); }}
                className="btn-primary"
              >
                Reveal Student Results →
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Student Results */}
            <div className="space-y-3 mb-8">
              {students.map(([id, result], i) => (
                <div
                  key={id}
                  className={`card border-l-4 transition-all duration-500 ${STUDENT_COLORS[id] || ''} ${
                    i <= revealIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold ${STUDENT_COLORS[id]?.split(' ')[0]}`}>
                        {STUDENT_NAMES[id]}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-text-primary">{result.score}/{totalQs}</span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary">{result.note}</p>
                </div>
              ))}
            </div>

            {/* Class Average */}
            {revealIndex >= students.length - 1 && (
              <div className="card bg-surface-light text-center mb-8 fade-in">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Class Average</p>
                <p className="text-3xl font-bold text-accent">
                  {assessmentData.classAverage?.toFixed(1)}/{totalQs}
                </p>
              </div>
            )}

            {/* Self Assessment */}
            {revealIndex >= students.length - 1 && (
              <div className="card mb-8 fade-in">
                <p className="text-sm text-text-primary mb-4">
                  How confident do you feel to deliver this module to live students?
                </p>
                <div className="flex items-center justify-center gap-3">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setSelfRating(n)}
                      className={`w-12 h-12 rounded-xl text-lg font-semibold transition-all ${
                        selfRating === n
                          ? 'bg-accent text-white scale-110'
                          : selfRating > 0 && n <= selfRating
                            ? 'bg-accent/20 text-accent'
                            : 'bg-surface-light text-text-muted hover:bg-white/[0.06]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-text-muted mt-2 px-2">
                  <span>Not confident</span>
                  <span>Very confident</span>
                </div>
              </div>
            )}

            {/* Continue */}
            {selfRating > 0 && (
              <div className="text-center fade-in">
                <button
                  onClick={() => onComplete({ ...assessmentData, selfRating })}
                  className="btn-primary"
                >
                  View Your Report →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
