import { useState } from 'react';
import { useSession } from '../contexts/SessionContext';
import { API_BASE } from '../utils/api';

const STUDENT_NAMES = {
  priya: 'Priya', ravi: 'Ravi', lakshmi: 'Lakshmi', arjun: 'Arjun', meena: 'Meena',
};

const STUDENT_COLORS = {
  priya: 'border-student-curious bg-student-curious/10',
  ravi: 'border-student-skeptic bg-student-skeptic/10',
  lakshmi: 'border-student-shy bg-student-shy/10',
  arjun: 'border-student-disengaged bg-student-disengaged/10',
  meena: 'border-student-rote bg-student-rote/10',
};

const ARCHETYPES = {
  ignitor:   { name: 'The Ignitor', desc: 'Masterful balance of curiosity and inclusion. You spark wonder AND reach every student.', color: 'text-accent' },
  performer: { name: 'The Performer', desc: 'Exciting teaching but talks AT students, not WITH them. Great spark, but some students are left behind.', color: 'text-student-curious' },
  caretaker: { name: 'The Caretaker', desc: 'Warm and inclusive but lacks "Aha!" moments. Every student feels seen, but the curiosity fire needs more fuel.', color: 'text-secondary' },
  lecturer:  { name: 'The Lecturer', desc: 'Clear explanations but limited engagement. The science is right, but the classroom needs more energy.', color: 'text-student-skeptic' },
  learner:   { name: 'The Learner', desc: 'Still developing your Ignator skills. Keep practicing — every session makes you stronger.', color: 'text-text-muted' },
};

/**
 * ReportScreen — VidyaSpark 3-page teaching performance report.
 *
 * Page 1: Your Tapovan Session (scores + archetype)
 * Page 2: Your Students (per-student results)
 * Page 3: Your Growth Path (coaching tips)
 */
export default function ReportScreen({ reportData, assessmentData, moduleId, onPracticeAgain, onExit }) {
  const { sessionId } = useSession();
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(false);

  const report = reportData || {};
  const assessment = assessmentData || {};

  const overallScore = report.compositeScore || report.overallScore || 0;
  const sparkScore = report.skillScores?.spark || report.skillScores?.S1 || 0;
  const reachScore = report.skillScores?.reach || report.skillScores?.S2 || 0;

  // Determine archetype
  const archetypeId = report.archetype?.id || report.archetype ||
    (sparkScore >= 70 && reachScore >= 70 ? 'ignitor'
    : sparkScore >= 60 && reachScore < 50 ? 'performer'
    : reachScore >= 60 && sparkScore < 50 ? 'caretaker'
    : sparkScore < 40 && reachScore < 40 ? 'learner'
    : 'lecturer');
  const archetype = ARCHETYPES[archetypeId] || ARCHETYPES.learner;

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

  const ScoreBar = ({ label, score, color = 'bg-accent' }) => (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-primary font-medium">{Math.round(score)}</span>
      </div>
      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Page tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                page === p
                  ? 'bg-accent text-white'
                  : 'bg-surface text-text-secondary hover:text-text-primary'
              }`}
            >
              {p === 1 ? 'Your Session' : p === 2 ? 'Your Students' : 'Growth Path'}
            </button>
          ))}
        </div>

        {/* PAGE 1: Your Tapovan Session */}
        {page === 1 && (
          <div className="fade-in space-y-6">
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-2">Tapovan Report</p>
              <h2 className="text-3xl font-bold text-text-primary mb-1">{archetype.name}</h2>
              <p className={`text-sm ${archetype.color}`}>{archetype.desc}</p>
            </div>

            {/* Overall Score */}
            <div className="card text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Overall Score</p>
              <p className="text-6xl font-bold text-accent mb-2">{Math.round(overallScore)}</p>
              <p className="text-sm text-text-secondary">out of 100</p>
            </div>

            {/* Spark & Reach */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Spark Score</p>
                <p className="text-3xl font-bold text-accent-warm mb-1">{Math.round(sparkScore)}</p>
                <p className="text-xs text-text-secondary">Curiosity & wonder</p>
              </div>
              <div className="card">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Reach Score</p>
                <p className="text-3xl font-bold text-secondary mb-1">{Math.round(reachScore)}</p>
                <p className="text-xs text-text-secondary">Inclusion & engagement</p>
              </div>
            </div>

            {/* Dimension breakdown */}
            <div className="card">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-4">Dimension Scores</p>
              <ScoreBar label="Curiosity Sparking" score={report.dimensionScores?.D1 || sparkScore * 0.9} color="bg-accent" />
              <ScoreBar label="Student Engagement" score={report.dimensionScores?.D2 || reachScore * 0.9} color="bg-secondary" />
              <ScoreBar label="Concept Clarity" score={report.dimensionScores?.D3 || overallScore * 0.8} color="bg-student-skeptic" />
              <ScoreBar label="Facilitation Quality" score={report.dimensionScores?.D4 || overallScore * 0.75} color="bg-student-shy" />
              <ScoreBar label="Questioning & Listening" score={report.dimensionScores?.D5 || overallScore * 0.7} color="bg-student-curious" />
            </div>

            {report.sessionSummary && (
              <div className="card">
                <p className="text-sm text-text-secondary italic">{report.sessionSummary}</p>
              </div>
            )}
          </div>
        )}

        {/* PAGE 2: Your Students */}
        {page === 2 && (
          <div className="fade-in space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Your Students</h2>
              <p className="text-sm text-text-secondary">How each student experienced your teaching</p>
            </div>

            {Object.entries(assessment.studentResults || {}).map(([id, result]) => (
              <div key={id} className={`card border-l-4 ${STUDENT_COLORS[id] || ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-text-primary">{STUDENT_NAMES[id]}</span>
                    <span className="text-xs text-text-muted ml-2">
                      {id === 'priya' ? 'The Curious One' : id === 'ravi' ? 'The Skeptic' : id === 'lakshmi' ? 'The Shy One' : id === 'arjun' ? 'The Disengaged' : 'The Rote Learner'}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-text-primary">
                    {result.score}/{assessment.questions?.length || 4}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">{result.note}</p>
              </div>
            ))}

            {assessment.classAverage !== undefined && (
              <div className="card bg-surface-light text-center">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Class Average</p>
                <p className="text-2xl font-bold text-accent">
                  {assessment.classAverage?.toFixed(1)}/{assessment.questions?.length || 4}
                </p>
              </div>
            )}
          </div>
        )}

        {/* PAGE 3: Growth Path */}
        {page === 3 && (
          <div className="fade-in space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Your Growth Path</h2>
              <p className="text-sm text-text-secondary">Specific coaching for your next session</p>
            </div>

            {/* Coaching pairs */}
            {(report.coachingPairs || [
              { instead: 'Giving the answer directly', tryThis: 'Ask "What do you think will happen?" before revealing the result' },
              { instead: 'Only calling on Priya (who always volunteers)', tryThis: 'Directly invite Lakshmi by name: "Lakshmi, what do you notice?"' },
              { instead: 'Ignoring Arjun\'s disengagement', tryThis: 'Give Arjun a hands-on role: "Arjun, can you hold the rubber sheet?"' },
              { instead: 'Accepting Meena\'s rote answer', tryThis: 'Challenge with: "Can you explain that in your own words?"' },
              { instead: 'Rushing through experiment steps', tryThis: 'Pause after each step and ask: "What surprised you?"' },
            ]).map((pair, i) => (
              <div key={i} className="card">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-danger text-sm flex-shrink-0">Instead of:</span>
                  <span className="text-sm text-text-secondary">{pair.instead}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-success text-sm flex-shrink-0">Try this:</span>
                  <span className="text-sm text-text-primary font-medium">{pair.tryThis}</span>
                </div>
              </div>
            ))}

            {/* Key insight */}
            <div className="card bg-accent/5 border-accent/20">
              <p className="text-xs text-accent uppercase tracking-wider mb-2">Key Growth Insight</p>
              <p className="text-sm text-text-primary leading-relaxed">
                {report.keyInsight || 'Great Ignators don\'t just explain science — they create moments of wonder where students discover the answer themselves. Your next challenge: ask more, tell less.'}
              </p>
            </div>

            {/* Super Class connection */}
            <div className="card">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Agastya Super Class Framework</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-text-primary"><strong>Super Start:</strong> Create curiosity and hook attention</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-text-primary"><strong>Super Core:</strong> Facilitate the experiment with student participation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-student-skeptic" />
                  <span className="text-text-primary"><strong>Super Finish:</strong> Deliver key messages and check understanding</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={onPracticeAgain} className="btn-primary">
            Practice Again
          </button>
          <button onClick={onExit} className="px-6 py-3 rounded-xl text-sm text-text-secondary hover:text-text-primary border border-border hover:border-white/20 transition-all">
            Back to Dashboard
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-6 py-3 rounded-xl text-sm text-text-secondary hover:text-text-primary border border-border hover:border-white/20 transition-all"
          >
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
