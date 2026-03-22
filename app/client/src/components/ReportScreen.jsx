import { useState } from 'react';
import { API_BASE } from '../utils/api';

const STUDENT_NAMES = {
  priya: 'Priya', ravi: 'Ravi', lakshmi: 'Lakshmi', arjun: 'Arjun', meena: 'Meena',
};

const STUDENT_COLORS = {
  priya: { text: 'text-student-curious', bg: 'bg-student-curious/10', border: 'border-student-curious/30' },
  ravi: { text: 'text-student-skeptic', bg: 'bg-student-skeptic/10', border: 'border-student-skeptic/30' },
  lakshmi: { text: 'text-student-shy', bg: 'bg-student-shy/10', border: 'border-student-shy/30' },
  arjun: { text: 'text-student-disengaged', bg: 'bg-student-disengaged/10', border: 'border-student-disengaged/30' },
  meena: { text: 'text-student-rote', bg: 'bg-student-rote/10', border: 'border-student-rote/30' },
};

const STUDENT_TRAITS = {
  priya: 'Curious', ravi: 'Skeptic', lakshmi: 'Shy', arjun: 'Disengaged', meena: 'Rote Learner',
};

const QUESTION_TYPE_LABELS = {
  recall: { label: 'Recall', color: 'text-blue-400' },
  understanding: { label: 'Understanding', color: 'text-purple-400' },
  application: { label: 'Application', color: 'text-amber-400' },
  analysis: { label: 'Analysis', color: 'text-red-400' },
};

const STUDENT_ORDER = ['priya', 'ravi', 'lakshmi', 'arjun', 'meena'];

/**
 * ReportScreen — Single scrolling VidyaSpark teaching performance report.
 *
 * Section A: Your Score (composite + formula breakdown)
 * Section B: How Your Students Did (per-student cards with scores and notes)
 * Section C: The 10 Questions & Answers (question × student matrix)
 * Section D: What You Taught Well (from Claude analysis)
 * Section E: What To Improve (coaching pairs)
 * Section F: Going Forward (tips + Super Class framework)
 */
export default function ReportScreen({ sessionId, reportData, assessmentData, moduleId, onPracticeAgain, onExit }) {
  const [downloading, setDownloading] = useState(false);

  const assessment = assessmentData || {};
  const questions = assessment.questions || [];
  const studentResults = assessment.studentResults || {};
  const totalQs = questions.length || 10;

  // Score data from assessment
  const compositeScore = assessment.compositeScore || 0;
  const studentAchievement = assessment.studentAchievement || 0;
  const confidence = assessment.confidence || (assessment.selfRating ? assessment.selfRating * 20 : 0);
  const classAverage = assessment.classAverage || 0;
  const totalCorrect = assessment.totalCorrect || 0;
  const maxPossible = assessment.maxPossible || 50;

  // Coaching data from assessment
  const conceptsTaughtWell = assessment.conceptsTaughtWell || [];
  const conceptsToImprove = assessment.conceptsToImprove || [];
  const goingForward = assessment.goingForward || [];
  const sessionSummary = assessment.sessionSummary || '';

  const handleDownloadPDF = async () => {
    if (!sessionId) return;
    setDownloading(true);
    try {
      const res = await fetch(`${API_BASE}/api/report/${sessionId}/download`, { credentials: 'include' });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VidyaSpark-Report-${sessionId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('PDF download failed:', e.message);
    } finally {
      setDownloading(false);
    }
  };

  // Get score color
  const getScoreColor = (score, max) => {
    const pct = (score / max) * 100;
    if (pct >= 70) return 'text-green-400';
    if (pct >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-bg px-6 py-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto">

        {/* ═══════════════════════════════════════════════════════════════
            SECTION A: YOUR SCORE
            ═══════════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-[0.2em] text-accent font-semibold mb-3">VidyaSpark Report</p>
            <h1 className="text-4xl font-bold text-text-primary mb-4">Your Teaching Score</h1>
            {sessionSummary && (
              <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">{sessionSummary}</p>
            )}
          </div>

          {/* Big score */}
          <div className="card text-center py-10 mb-6">
            <p className="text-8xl font-bold text-accent mb-3">{compositeScore}</p>
            <p className="text-lg text-text-secondary">out of 100</p>
            <div className="mt-6 flex items-center justify-center gap-8 text-base">
              <div>
                <span className="text-text-muted">Student Achievement (70%): </span>
                <span className="text-text-primary font-semibold">{Math.round(studentAchievement)}%</span>
              </div>
              <div className="text-text-muted">•</div>
              <div>
                <span className="text-text-muted">Your Confidence (30%): </span>
                <span className="text-text-primary font-semibold">{Math.round(confidence)}%</span>
              </div>
            </div>
            <p className="text-sm text-text-muted mt-3">
              {totalCorrect} correct answers out of {maxPossible} total ({STUDENT_ORDER.length} students × {totalQs} questions)
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION B: HOW YOUR STUDENTS DID
            ═══════════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-2">How Your Students Did</h2>
          <p className="text-base text-text-secondary mb-6">Each student's score reflects how well they were engaged during your session</p>

          <div className="space-y-4">
            {STUDENT_ORDER.map(id => {
              const result = studentResults[id];
              if (!result) return null;
              const colors = STUDENT_COLORS[id] || {};
              const pct = Math.round((result.score / totalQs) * 100);

              return (
                <div key={id} className={`card border-l-4 ${colors.border} ${colors.bg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${colors.text}`}>{STUDENT_NAMES[id]}</span>
                      <span className="text-sm text-text-muted">— {STUDENT_TRAITS[id]}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${getScoreColor(result.score, totalQs)}`}>
                        {result.score}/{totalQs}
                      </span>
                      <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${
                        pct >= 70 ? 'bg-green-500/20 text-green-400'
                        : pct >= 50 ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                      }`}>
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Answer dots */}
                  <div className="flex gap-1.5 mb-3">
                    {(result.answers || []).map((a, qi) => (
                      <div
                        key={qi}
                        className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                          a.correct
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                        title={`Q${a.questionId || qi + 1}: ${a.correct ? 'Correct' : 'Wrong'}`}
                      >
                        {a.correct ? '✓' : '✗'}
                      </div>
                    ))}
                  </div>

                  <p className="text-base text-text-secondary leading-relaxed">{result.note}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION C: THE 10 QUESTIONS & ANSWERS
            ═══════════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-2">The {totalQs} Questions</h2>
          <p className="text-base text-text-secondary mb-6">Each question with correct answer and how each student performed</p>

          <div className="space-y-4">
            {questions.map((q, qi) => {
              const typeInfo = QUESTION_TYPE_LABELS[q.type] || { label: q.type, color: 'text-text-muted' };

              return (
                <div key={q.id || qi} className="card">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-sm font-mono text-text-muted bg-surface-light px-3 py-1.5 rounded flex-shrink-0">
                      Q{qi + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-base text-text-primary leading-relaxed mb-2">{q.question}</p>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium capitalize ${typeInfo.color}`}>{typeInfo.label}</span>
                        <span className="text-xs text-text-muted">•</span>
                        <span className="text-sm text-green-400/80">
                          <strong>Answer:</strong> {q.correctAnswer}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Student answer row */}
                  <div className="flex gap-2 flex-wrap">
                    {STUDENT_ORDER.map(id => {
                      const result = studentResults[id];
                      if (!result) return null;
                      const answer = (result.answers || []).find(a => (a.questionId || 0) === (q.id || qi + 1))
                        || (result.answers || [])[qi];
                      if (!answer) return null;
                      const colors = STUDENT_COLORS[id] || {};

                      return (
                        <div
                          key={id}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                            answer.correct
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          <span className={`font-semibold ${colors.text}`}>{STUDENT_NAMES[id]}</span>
                          <span className="font-bold">{answer.correct ? '✓' : '✗'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION D: WHAT YOU TAUGHT WELL
            ═══════════════════════════════════════════════════════════════ */}
        {conceptsTaughtWell.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-2">What You Taught Well</h2>
            <p className="text-base text-text-secondary mb-6">Concepts your students clearly understood</p>

            <div className="space-y-3">
              {conceptsTaughtWell.map((item, i) => (
                <div key={i} className="card border-l-4 border-green-500/40 bg-green-500/5">
                  <div className="flex items-start gap-3">
                    <span className="text-green-400 text-xl flex-shrink-0 mt-0.5">✓</span>
                    <div>
                      <p className="text-base text-text-primary font-semibold">{typeof item === 'string' ? item : item.concept}</p>
                      {item.evidence && (
                        <p className="text-sm text-text-secondary mt-1">{item.evidence}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SECTION E: WHAT TO IMPROVE
            ═══════════════════════════════════════════════════════════════ */}
        {conceptsToImprove.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-text-primary mb-2">What To Improve</h2>
            <p className="text-base text-text-secondary mb-6">Specific coaching to strengthen your teaching</p>

            <div className="space-y-4">
              {conceptsToImprove.map((item, i) => (
                <div key={i} className="card">
                  {item.concept && (
                    <p className="text-base text-text-primary font-semibold mb-3">{item.concept}</p>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-red-400 text-sm font-semibold flex-shrink-0 mt-0.5 w-20">Instead of:</span>
                      <span className="text-base text-text-secondary">{item.insteadOf || item.instead || (typeof item === 'string' ? item : '')}</span>
                    </div>
                    {(item.tryThis || item.try_this) && (
                      <div className="flex items-start gap-3">
                        <span className="text-green-400 text-sm font-semibold flex-shrink-0 mt-0.5 w-20">Try this:</span>
                        <span className="text-base text-text-primary font-medium">{item.tryThis || item.try_this}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SECTION F: GOING FORWARD
            ═══════════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Going Forward</h2>
          <p className="text-base text-text-secondary mb-6">Your roadmap for the next session</p>

          {goingForward.length > 0 && (
            <div className="space-y-3 mb-8">
              {goingForward.map((tip, i) => (
                <div key={i} className="card border-l-4 border-accent/40">
                  <div className="flex items-start gap-4">
                    <span className="text-accent font-bold text-lg flex-shrink-0">{i + 1}</span>
                    <p className="text-base text-text-primary leading-relaxed">{typeof tip === 'string' ? tip : tip.tip || tip.text || JSON.stringify(tip)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Super Class Framework */}
          <div className="card">
            <p className="text-sm text-text-muted uppercase tracking-wider mb-4 font-semibold">Agastya Super Class Framework</p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="w-3 h-3 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                <div>
                  <span className="text-base text-text-primary font-semibold">Super Start</span>
                  <p className="text-sm text-text-secondary mt-0.5">Create curiosity and hook attention with a surprising question or demonstration</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-3 h-3 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                <div>
                  <span className="text-base text-text-primary font-semibold">Super Core</span>
                  <p className="text-sm text-text-secondary mt-0.5">Facilitate the experiment with active student participation — ask, don't tell</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-3 h-3 rounded-full bg-student-skeptic mt-1.5 flex-shrink-0" />
                <div>
                  <span className="text-base text-text-primary font-semibold">Super Finish</span>
                  <p className="text-sm text-text-secondary mt-0.5">Deliver key messages and check understanding with every student</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            ACTION BUTTONS
            ═══════════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-center gap-4 py-8 border-t border-border">
          <button onClick={onPracticeAgain} className="btn-primary text-base px-8 py-3">
            Practice Again
          </button>
          <button onClick={onExit} className="px-8 py-3 rounded-xl text-base text-text-secondary hover:text-text-primary border border-border hover:border-white/20 transition-all">
            Back to Dashboard
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-8 py-3 rounded-xl text-base text-text-secondary hover:text-text-primary border border-border hover:border-white/20 transition-all"
          >
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
