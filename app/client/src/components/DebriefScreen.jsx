import { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { API_BASE } from '../utils/api';

/**
 * DebriefScreen -- Post-simulation framework reveal
 *
 * Module-aware: adapts content for B2B Negotiation vs Difficult Conversations.
 * For B2B Negotiation: shows prediction reveal, hidden truth, competitive mapping, takeaway.
 * For Difficult Conversations: shows prediction reveal, priority structure, conversation analysis, takeaway.
 */
export default function DebriefScreen({ reportData, onComplete, moduleId }) {
  const { sessionId } = useSession();
  const [sessionData, setSessionData] = useState(null);
  const [moduleConfig, setModuleConfig] = useState(null);

  useEffect(() => {
    const id = moduleId || 'abl-p7-force-pressure';
    fetch(API_BASE + '/api/modules/config/' + id, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setModuleConfig(d.module))
      .catch(() => {});
  }, [moduleId]);

  useEffect(() => {
    if (!sessionId) return;
    fetch(API_BASE + '/api/export/' + sessionId, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setSessionData(data))
      .catch(err => console.warn('Failed to fetch session data:', err));
  }, [sessionId]);

  const isNegotiation = !moduleConfig?.category || moduleConfig?.category === 'B2B Negotiation';
  const isDifficultConvo = !isNegotiation;
  const frameworkTeaching = reportData?.frameworkTeaching || {};

  // Use session-specific weights or fall back to defaults
  const sw = sessionData?.scenarioWeights || sessionData?.coachModelMetrics?.scenarioWeights || null;
  const defaultWeights = isNegotiation
    ? { reliability: 35, hse: 28, technical: 18, service: 12, price: 7 }
    : { clarity: 25, empathy: 25, listening: 20, judgment: 15, boundaries: 15 };
  const weights = sw?.weights || defaultWeights;
  const weightPrediction = sessionData?.postSurvey?.weightPrediction || sessionData?.weightPrediction || null;

  // Pre-simulation priority prediction from StrategyCheckScreen
  const priorityPrediction = sessionData?.priorityPrediction || sessionData?.coachModelMetrics?.priorityPrediction || null;

  const DIM_LABELS = moduleConfig?.dimensions
    ? Object.fromEntries(moduleConfig.dimensions.map(d => [d.shortName, d.name]))
    : isNegotiation
      ? { reliability: 'Reliability / Uptime', hse: 'HSE Compliance', technical: 'Technical Support', service: 'Service Response', price: 'Pricing' }
      : { clarity: 'Clarity & Composure', empathy: 'Empathetic Judgment', listening: 'Active Listening', judgment: 'Situational Judgment', boundaries: 'Professional Boundaries' };

  const DIM_COLORS_DEFAULT = isNegotiation
    ? { reliability: 'bg-accent', hse: 'bg-blue-400', technical: 'bg-purple-400', service: 'bg-yellow-400', price: 'bg-red-400' }
    : { clarity: 'bg-accent', empathy: 'bg-blue-400', listening: 'bg-purple-400', judgment: 'bg-yellow-400', boundaries: 'bg-red-400' };
  const DIM_COLORS = DIM_COLORS_DEFAULT;

  // Sort dimensions by weight, descending
  const sortedDims = isNegotiation
    ? Object.entries(weights)
        .filter(([k]) => k !== 'price')
        .sort((a, b) => b[1] - a[1])
        .concat([['price', weights.price]])
    : Object.entries(weights)
        .sort((a, b) => b[1] - a[1]);

  const topDimName = sortedDims[0] ? DIM_LABELS[sortedDims[0][0]] : 'Unknown';
  const topDimKey = sortedDims[0] ? sortedDims[0][0] : '';
  const topDimWeight = sortedDims[0] ? sortedDims[0][1] : 0;
  const secondDimName = sortedDims[1] ? DIM_LABELS[sortedDims[1][0]] : '';
  const secondDimWeight = sortedDims[1] ? sortedDims[1][1] : 0;
  const topTwoTotal = topDimWeight + secondDimWeight;

  // Dynamic performance grades from module config (only for negotiation modules)
  const perfGrades = moduleConfig?.performanceGrades || {};
  const companyNames = Object.keys(perfGrades);
  const company1 = companyNames[0] || 'Company A';
  const company2 = companyNames[1] || 'Company B';
  const company1Grades = perfGrades[company1] || {};
  const company2Grades = perfGrades[company2] || {};

  const PERF = {};
  const allDimKeys = Object.keys(weights);
  allDimKeys.forEach(dim => {
    PERF[dim] = {
      c1: company1Grades[dim] !== undefined ? company1Grades[dim] : 80,
      c2: company2Grades[dim] !== undefined ? company2Grades[dim] : 70,
    };
  });

  // Build prediction comparison
  const buildPredictionReveal = () => {
    if (!priorityPrediction) return null;
    const predictedFirst = priorityPrediction.first;
    const predictedSecond = priorityPrediction.second;
    const actualFirst = topDimKey;
    const actualSecond = sortedDims[1] ? sortedDims[1][0] : null;

    const firstCorrect = predictedFirst === actualFirst;
    const secondCorrect = predictedSecond === actualSecond;
    const bothCorrect = firstCorrect && secondCorrect;

    return {
      predictedFirst,
      predictedSecond,
      actualFirst,
      actualSecond,
      firstCorrect,
      secondCorrect,
      bothCorrect,
    };
  };

  const predictionReveal = buildPredictionReveal();

  // Module-aware text helpers
  const subjectLabel = isDifficultConvo ? 'the founder' : 'the customer';
  const contextLabel = isDifficultConvo ? 'conversation' : 'negotiation';

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center fade-in">
          <div className="text-text-secondary text-sm font-mono tracking-widest uppercase mb-2">The Reveal</div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">What the Data Reveals</h1>
          <p className="text-text-secondary text-sm">
            {isDifficultConvo
              ? 'Scroll down to see what actually mattered in this conversation'
              : 'Scroll down to see the hidden truth behind your negotiation'}
          </p>
        </div>

        {/* Section 1: Prediction vs Reality */}
        <div className="card fade-in" style={{ animationDelay: '100ms' }}>
          {predictionReveal && isNegotiation && predictionReveal.predictedFirst === 'price' ? (
            <div className="text-center py-4 mb-6">
              <p className="text-2xl font-bold text-text-primary leading-snug">
                You thought Pricing was #1.<br/>
                <span className="text-red-600">It was #{sortedDims.findIndex(([d]) => d === 'price') + 1}.</span>
              </p>
              <p className="text-text-secondary text-sm mt-3">This is the price trap. The loudest signal in the room was the least important factor.</p>
            </div>
          ) : predictionReveal ? (
            <div className="text-center py-4 mb-6">
              <p className="text-2xl font-bold text-text-primary leading-snug">
                You predicted {DIM_LABELS[predictionReveal.predictedFirst]} was #1.<br/>
                <span className={predictionReveal.firstCorrect ? 'text-success' : 'text-red-600'}>
                  {predictionReveal.firstCorrect ? 'You were right.' : 'It was actually ' + topDimName + '.'}
                </span>
              </p>
            </div>
          ) : null}

          <div className="space-y-5">
            {predictionReveal ? (
              <>
                <p className="text-text-secondary leading-relaxed">
                  {isDifficultConvo
                    ? "Before the conversation, you predicted what would matter most. Here's how your instinct compared to the hidden truth:"
                    : "Before the negotiation, you predicted what this customer values most. Here's how your instinct compared to the hidden truth:"}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className={"rounded-xl p-4 border " + (predictionReveal.firstCorrect ? 'bg-success/5 border-success/30' : 'bg-red-500/10 border-red-500/20')}>
                    <div className="text-xs font-medium uppercase tracking-wider mb-2 text-text-secondary">
                      You Predicted #1
                    </div>
                    <div className={"text-lg font-bold mb-1 " + (predictionReveal.firstCorrect ? 'text-success' : 'text-red-600')}>
                      {DIM_LABELS[predictionReveal.predictedFirst] || predictionReveal.predictedFirst}
                    </div>
                    <div className="text-xs">
                      {predictionReveal.firstCorrect
                        ? <span className="text-success font-medium">Correct!</span>
                        : <span className="text-red-600">Actually #{sortedDims.findIndex(([d]) => d === predictionReveal.predictedFirst) + 1}</span>
                      }
                    </div>
                  </div>
                  <div className={"rounded-xl p-4 border " + (predictionReveal.secondCorrect ? 'bg-success/5 border-success/30' : 'bg-red-500/10 border-red-500/20')}>
                    <div className="text-xs font-medium uppercase tracking-wider mb-2 text-text-secondary">
                      You Predicted #2
                    </div>
                    <div className={"text-lg font-bold mb-1 " + (predictionReveal.secondCorrect ? 'text-success' : 'text-red-600')}>
                      {DIM_LABELS[predictionReveal.predictedSecond] || predictionReveal.predictedSecond || 'None'}
                    </div>
                    <div className="text-xs">
                      {predictionReveal.secondCorrect
                        ? <span className="text-success font-medium">Correct!</span>
                        : <span className="text-red-600">Actually #{sortedDims.findIndex(([d]) => d === predictionReveal.predictedSecond) + 1 || '?'}</span>
                      }
                    </div>
                  </div>
                </div>

                <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                  <div className="text-accent text-xs font-semibold uppercase tracking-wider mb-1">The Actual Ranking</div>
                  <p className="text-text-primary text-sm">
                    <span className="font-bold">#{1}</span> {topDimName} ({topDimWeight}%){' '}
                    <span className="font-bold">#{2}</span> {secondDimName} ({secondDimWeight}%)
                    {isNegotiation && weights.price !== undefined && (
                      <span> ...and Pricing was only <span className="text-red-600 font-bold">{weights.price}%</span>.</span>
                    )}
                  </p>
                </div>

                {predictionReveal.bothCorrect ? (
                  <div className="bg-success/10 border border-success/30 rounded-xl p-4 text-center">
                    <p className="text-success font-semibold">
                      {isDifficultConvo
                        ? "Impressive! You correctly identified both top priorities before the conversation. That level of awareness is rare."
                        : "Impressive! You correctly identified both top priorities before the conversation. That's rare - most people get trapped by the price signal."}
                    </p>
                  </div>
                ) : isNegotiation && predictionReveal.predictedFirst === 'price' ? (
                  <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                    <p className="text-text-secondary text-sm">
                      You predicted <span className="text-warning font-semibold">Pricing</span> was #1.
                      It was actually <span className="text-red-600 font-bold">#{sortedDims.findIndex(([d]) => d === 'price') + 1}</span> -
                      the least important factor. This is the price trap: the loudest signal is not always the most important one.
                    </p>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="space-y-4">
                {isDifficultConvo ? (
                  <>
                    <p className="text-text-secondary leading-relaxed">
                      What seemed most important on the surface may not have been what mattered most underneath.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                        <div className="text-warning text-xs font-medium uppercase tracking-wider mb-2">Surface Level</div>
                        <div className="text-2xl font-bold text-warning mb-1">The Outcome</div>
                        <p className="text-text-secondary text-xs">What the founder heard first. High emotional charge.</p>
                      </div>
                      <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                        <div className="text-success text-xs font-medium uppercase tracking-wider mb-2">Hidden Need</div>
                        <div className="text-2xl font-bold text-success mb-1">{topDimName}</div>
                        <p className="text-text-secondary text-xs">{topDimWeight}% of what mattered. The deeper priority.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-text-secondary leading-relaxed">
                      The customer led with <span className="text-warning font-semibold">price</span> -
                      it was the loudest signal in the room. But was it the most important driver?
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                        <div className="text-warning text-xs font-medium uppercase tracking-wider mb-2">Observable Signal</div>
                        <div className="text-2xl font-bold text-warning mb-1">Pricing</div>
                        <p className="text-text-secondary text-xs">What procurement pushed. High salience, low importance.</p>
                      </div>
                      <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                        <div className="text-success text-xs font-medium uppercase tracking-wider mb-2">Hidden Driver</div>
                        <div className="text-2xl font-bold text-success mb-1">{topDimName}</div>
                        <p className="text-text-secondary text-xs">{topDimWeight}% of satisfaction. Low salience, high importance.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Priority Structure / Hidden Truth */}
        <div className="card fade-in" style={{ animationDelay: '200ms' }}>
          <div className="text-xs text-accent font-mono uppercase tracking-wider mb-1">
            {isDifficultConvo ? 'Priority Structure' : 'Dimension Prioritization'}
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-5">
            {isDifficultConvo ? 'What Actually Mattered Most' : 'The Hidden Truth: What Actually Mattered'}
          </h2>
          <div className="space-y-5">
            <p className="text-text-secondary leading-relaxed">
              {isDifficultConvo
                ? <>Every difficult conversation has a hidden <span className="text-accent font-semibold">priority structure</span>. Here is what actually mattered most in this one:</>
                : <>Every customer has a hidden <span className="text-accent font-semibold">value equation</span>. Here is what this customer's equation actually looked like:</>
              }
            </p>
            <div className="space-y-3">
              {sortedDims.map(([dim, w]) => (
                <div key={dim}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-primary text-sm font-medium">{DIM_LABELS[dim]}</span>
                    <span className="text-text-primary text-sm font-bold font-mono">{w}%</span>
                  </div>
                  <div className="h-3 bg-border rounded-full overflow-hidden">
                    <div className={"h-full rounded-full transition-all duration-1000 " + (DIM_COLORS[dim] || 'bg-accent')}
                      style={{ width: Math.max(w, 2) + '%' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
              <p className="text-text-primary text-sm">
                {topDimName} ({topDimWeight}%) and {secondDimName} ({secondDimWeight}%) account
                for <span className="font-bold text-accent">{topTwoTotal}%</span> of what mattered.
                {isNegotiation && weights.price !== undefined && (
                  <> Price? Just <span className="font-bold text-red-600">{weights.price}%</span>.</>
                )}
              </p>
            </div>

            {/* Post-survey Weight Prediction Comparison (if available) */}
            {weightPrediction && (
              <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                <h3 className="text-warning text-sm font-semibold mb-3">Your Post-Simulation Prediction vs. Reality</h3>
                <div className="space-y-2">
                  {sortedDims.map(([dim, actualW]) => {
                    const predictedW = weightPrediction[dim] || 0;
                    const gap = Math.abs(predictedW - actualW);
                    const gapColor = gap <= 5 ? 'text-success' : gap <= 15 ? 'text-warning' : 'text-red-600';
                    const gapIcon = gap <= 5 ? '\u2713' : gap <= 15 ? '~' : '\u2717';
                    return (
                      <div key={dim} className="flex items-center gap-3 text-xs">
                        <span className="text-text-primary w-28 truncate">{DIM_LABELS[dim]}</span>
                        <span className="text-warning font-mono w-12 text-right">{predictedW}%</span>
                        <span className="text-text-secondary">{'\u2192'}</span>
                        <span className="text-accent font-mono w-12 text-right">{actualW}%</span>
                        <span className={gapColor + " font-mono w-16 text-right"}>{gapIcon} {gap}pt</span>
                      </div>
                    );
                  })}
                </div>
                {(() => {
                  const totalGap = sortedDims.reduce((sum, [dim, actualW]) => sum + Math.abs((weightPrediction[dim] || 0) - actualW), 0);
                  const avgGap = Math.round(totalGap / sortedDims.length);
                  return (
                    <div className={"mt-3 text-xs font-medium " + (avgGap <= 8 ? 'text-success' : avgGap <= 15 ? 'text-warning' : 'text-red-600')}>
                      Average gap: {avgGap} pts - {avgGap <= 8 ? 'Excellent calibration!' : avgGap <= 15 ? 'Good intuition, room to sharpen.' : 'Significant gap - this is your growth area.'}
                    </div>
                  );
                })()}
              </div>
            )}

            {frameworkTeaching.valueEquation && (
              <div className="bg-surface rounded-xl p-4 border border-border text-sm text-text-secondary">
                {frameworkTeaching.valueEquation}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Competitive Mapping (negotiation only) OR Conversation Analysis (difficult convo) */}
        {isNegotiation ? (
          <div className="card fade-in" style={{ animationDelay: '300ms' }}>
            <div className="text-xs text-accent font-mono uppercase tracking-wider mb-1">Competitive Mapping</div>
            <h2 className="text-xl font-bold text-text-primary mb-5">Where You Actually Win</h2>
            <div className="space-y-5">
              <p className="text-text-secondary leading-relaxed">
                On every dimension that matters most, where does each company stand?
              </p>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface">
                      <th className="text-left px-4 py-3 text-text-secondary font-medium">Dimension</th>
                      <th className="text-center px-3 py-3 text-text-secondary font-medium text-xs">Weight</th>
                      <th className="text-center px-3 py-3 text-accent font-medium">{company1}</th>
                      <th className="text-center px-3 py-3 text-warning font-medium">{company2}</th>
                      <th className="text-center px-3 py-3 text-text-secondary font-medium">Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDims.map(([dim, w], i) => {
                      const perf = PERF[dim] || { c1: 80, c2: 70 };
                      const lead = perf.c1 - perf.c2;
                      return (
                        <tr key={dim} className={i % 2 === 0 ? '' : 'bg-surface/50'}>
                          <td className="px-4 py-3 text-text-primary font-medium">{DIM_LABELS[dim]}</td>
                          <td className="text-center px-3 py-3 text-text-secondary text-xs">{w}%</td>
                          <td className="text-center px-3 py-3">
                            <span className={"font-bold font-mono " + (lead > 0 ? 'text-success' : 'text-text-secondary')}>{perf.c1}</span>
                          </td>
                          <td className="text-center px-3 py-3">
                            <span className={"font-bold font-mono " + (lead < 0 ? 'text-success' : 'text-text-secondary')}>{perf.c2}</span>
                          </td>
                          <td className="text-center px-3 py-3">
                            <span className={"font-bold font-mono text-xs px-2 py-0.5 rounded-full " + (lead > 0 ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-400')}>
                              {lead > 0 ? '+' : ''}{lead}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                <p className="text-text-primary text-sm">
                  On the <span className="font-bold">#1 dimension</span> ({topDimName}, {topDimWeight}% weight),
                  {company1} leads by <span className="text-success font-bold">{(PERF[sortedDims[0]?.[0]]?.c1 || 91) - (PERF[sortedDims[0]?.[0]]?.c2 || 74)} points</span>.
                  {company2} only wins on the <span className="text-red-600 font-bold">least important</span> factor.
                </p>
              </div>
              {frameworkTeaching.competitiveMapping && (
                <div className="bg-surface rounded-xl p-4 border border-border text-sm text-text-secondary">
                  {frameworkTeaching.competitiveMapping}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card fade-in" style={{ animationDelay: '300ms' }}>
            <div className="text-xs text-accent font-mono uppercase tracking-wider mb-1">Conversation Priorities</div>
            <h2 className="text-xl font-bold text-text-primary mb-5">How Your Behavior Mapped to Priorities</h2>
            <div className="space-y-5">
              <p className="text-text-secondary leading-relaxed">
                In this conversation, some dimensions carried far more weight than others.
                Here is how the importance was distributed:
              </p>
              <div className="space-y-3">
                {sortedDims.map(([dim, w], i) => (
                  <div key={dim} className="flex items-center gap-4">
                    <span className="text-text-primary text-sm font-medium w-40 flex-shrink-0">
                      <span className="text-accent font-bold mr-2">#{i + 1}</span>
                      {DIM_LABELS[dim]}
                    </span>
                    <div className="flex-1 h-3 bg-border rounded-full overflow-hidden">
                      <div className={"h-full rounded-full transition-all duration-1000 " + (DIM_COLORS[dim] || 'bg-accent')}
                        style={{ width: Math.max(w, 2) + '%' }} />
                    </div>
                    <span className="text-text-primary text-sm font-bold font-mono w-12 text-right">{w}%</span>
                  </div>
                ))}
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                <p className="text-text-primary text-sm">
                  The most important dimensions were <span className="font-bold text-accent">{topDimName}</span> and{' '}
                  <span className="font-bold text-accent">{secondDimName}</span>, accounting for{' '}
                  <span className="font-bold text-accent">{topTwoTotal}%</span> of the overall score.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Takeaway */}
        <div className="card fade-in" style={{ animationDelay: '400ms' }}>
          <div className="text-xs text-accent font-mono uppercase tracking-wider mb-1">Your Takeaway</div>
          <h2 className="text-xl font-bold text-text-primary mb-5">What This Means for You</h2>
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 text-center">
            {isDifficultConvo ? (
              <p className="text-text-primary leading-relaxed text-base">
                In every difficult conversation, there is a <span className="text-accent font-semibold">surface reaction</span> and
                a <span className="text-accent font-semibold">deeper need</span>. The surface is what you see first -
                frustration, disappointment, confusion. The skill is recognizing and addressing the{' '}
                <span className="font-bold">deeper need</span> without losing clarity on the message.
              </p>
            ) : (
              <p className="text-text-primary leading-relaxed text-base">
                In every negotiation, there is a <span className="text-accent font-semibold">loudest signal</span> -
                the thing that dominates the conversation. Today it was price. In real life, it might be timeline,
                features, or budget. The skill is learning to hear the <span className="font-bold">quiet ones</span>.
              </p>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center fade-in" style={{ animationDelay: '500ms' }}>
          <button onClick={onComplete} className="btn-primary px-10 py-3 text-base">
            See Your Full Report
          </button>
        </div>
      </div>
    </div>
  );
}
