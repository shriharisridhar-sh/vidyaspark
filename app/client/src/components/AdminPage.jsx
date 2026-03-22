import { useState, useEffect } from 'react';
import { API_BASE } from '../utils/api';
import CohortManager from './admin/CohortManager';

/**
 * AdminPage — Single admin portal at /admin.
 * Sessions grouped by module, build new modules, coached vs solo comparison.
 */
export default function AdminPage() {
  const [health, setHealth] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('sessions');
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    fetch(API_BASE + '/health', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setHealth(d))
      .catch(() => setHealth(null));

    Promise.all([
      fetch(API_BASE + '/api/session/db/all', { credentials: 'include' }).then(r => r.json()).catch(() => ({ sessions: [] })),
      fetch(API_BASE + '/api/modules/available', { credentials: 'include' }).then(r => r.json()).catch(() => ({ modules: [] })),
    ]).then(([sessionData, moduleData]) => {
      setSessions(sessionData.sessions || []);
      setModules(moduleData.modules || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(API_BASE + '/api/session/db/all', { credentials: 'include' }).then(r => r.json()).catch(() => ({ sessions: [] })),
      fetch(API_BASE + '/api/modules/available', { credentials: 'include' }).then(r => r.json()).catch(() => ({ modules: [] })),
    ]).then(([sessionData, moduleData]) => {
      setSessions(sessionData.sessions || []);
      setModules(moduleData.modules || []);
      setLoading(false);
    }).catch(() => { setError('Failed to load'); setLoading(false); });
  };

  // Group sessions by module using available modules from scenarios/
  const moduleGroups = modules.map(mod => ({
    id: mod.id,
    name: mod.name,
    description: mod.description || '',
    sessions: sessions.filter(s => {
      const sid = s.config?.scenarioId || s.scenarioId || 'abl-p7-force-pressure';
      return sid === mod.id;
    }),
  }));

  // Any sessions without a matching module go under the default ABL module
  const assignedSessionIds = new Set(moduleGroups.flatMap(g => g.sessions.map(s => s.sessionId)));
  const unassigned = sessions.filter(s => !assignedSessionIds.has(s.sessionId));
  const defaultGroup = moduleGroups.find(g => g.id === 'abl-p7-force-pressure');
  if (defaultGroup && unassigned.length > 0) {
    defaultGroup.sessions = [...defaultGroup.sessions, ...unassigned];
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="border-b border-border bg-surface/50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/" className="text-text-secondary hover:text-accent text-sm flex items-center gap-1.5 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            VidyaSpark
          </a>
          <div className="flex items-center gap-3">
            {health ? (
              <span className="flex items-center gap-1.5 text-xs text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Online
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-red-500">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Offline
              </span>
            )}
            <div className="text-red-500/70 text-xs font-mono">ADMIN</div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Admin Portal</h1>
            <p className="text-text-secondary text-sm mt-1">Manage training sessions, cohorts, and Ignators</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={refresh} className="btn-secondary text-xs px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors">
              Refresh
            </button>
            <a href="/admin/build" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-accent hover:bg-accent/90 transition-colors">
              + Build New Module
            </a>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {[
            { id: 'sessions', label: 'Sessions' },
            { id: 'cohorts', label: 'Cohorts' },
            { id: 'users', label: 'Ignators' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'users' && allUsers.length === 0) {
                  setUsersLoading(true);
                  fetch(API_BASE + '/api/cohorts/users', { credentials: 'include' })
                    .then(r => r.json())
                    .then(d => { setAllUsers(d.users || []); setUsersLoading(false); })
                    .catch(() => setUsersLoading(false));
                }
              }}
              className={"px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px " +
                (activeTab === tab.id
                  ? 'text-accent border-accent'
                  : 'text-text-secondary border-transparent hover:text-text-primary')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sessions tab */}
        {activeTab === 'sessions' && (
          <>
            {loading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-text-secondary text-sm">Loading...</p>
              </div>
            ) : error ? (
              <div className="card text-center py-12">
                <p className="text-red-500 mb-3">{error}</p>
                <button onClick={refresh} className="btn-primary text-sm px-4 py-2 rounded-lg bg-accent text-white">Retry</button>
              </div>
            ) : (
              <div className="space-y-6">
                {moduleGroups.map(mod => (
                  <ModuleCard key={mod.id} module={mod} />
                ))}
              </div>
            )}
            <CompareSection sessions={sessions} loading={loading} />
          </>
        )}

        {/* Cohorts tab */}
        {activeTab === 'cohorts' && <CohortManager />}

        {/* Users tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-4">All Ignators</h2>
            {usersLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-text-secondary text-sm">Loading Ignators...</p>
              </div>
            ) : allUsers.length > 0 ? (
              <div className="card">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-text-secondary font-medium text-xs">Name</th>
                        <th className="text-left py-2 text-text-secondary font-medium text-xs">Email</th>
                        <th className="text-left py-2 text-text-secondary font-medium text-xs">Cohorts</th>
                        <th className="text-center py-2 text-text-secondary font-medium text-xs">Sessions</th>
                        <th className="text-right py-2 text-text-secondary font-medium text-xs">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((u, i) => (
                        <tr key={i} className="border-b border-border/30">
                          <td className="py-2 text-text-primary text-xs font-medium">{u.name}</td>
                          <td className="py-2 text-text-secondary text-xs">{u.email}</td>
                          <td className="py-2 text-text-secondary text-xs">{(u.cohorts || []).join(', ') || '--'}</td>
                          <td className="py-2 text-center text-text-primary text-xs font-mono">{u.sessionCount || 0}</td>
                          <td className="py-2 text-right text-text-secondary text-xs">{u.lastActive ? new Date(u.lastActive).toLocaleDateString() : '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card text-center py-8">
                <p className="text-text-secondary text-sm">No Ignators found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// ModuleCard — Collapsible module with sessions
// ────────────────────────────────────────────────

function ModuleCard({ module }) {
  const [expanded, setExpanded] = useState(true);
  const sessions = module.sessions || [];
  const avgScore = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + (s.compositeScore || s.objectiveScore || 0), 0) / sessions.length)
    : null;

  // Group sessions by cohort
  const cohorts = {};
  sessions.forEach(s => {
    const group = s.userGroup || 'Ungrouped';
    if (!cohorts[group]) cohorts[group] = [];
    cohorts[group].push(s);
  });
  const cohortKeys = Object.keys(cohorts).sort();

  return (
    <div className="card">
      {/* Module header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">{module.name}</h2>
            <p className="text-text-secondary text-xs mt-0.5">{module.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-mono font-bold text-text-primary">{sessions.length}</div>
            <div className="text-[10px] text-text-secondary">sessions</div>
          </div>
          {avgScore != null && (
            <div className="text-right">
              <div className={"text-sm font-mono font-bold " + (avgScore >= 60 ? 'text-green-600' : avgScore >= 40 ? 'text-yellow-600' : 'text-red-600')}>
                {avgScore}%
              </div>
              <div className="text-[10px] text-text-secondary">avg score</div>
            </div>
          )}
          <svg className={"w-4 h-4 text-text-secondary transition-transform " + (expanded ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded: sessions by cohort */}
      {expanded && sessions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          {cohortKeys.map(cohortName => {
            const cohortSessions = cohorts[cohortName];
            const cohortAvg = Math.round(cohortSessions.reduce((sum, s) => sum + (s.compositeScore || s.objectiveScore || 0), 0) / cohortSessions.length);
            return (
              <CohortSection key={cohortName} name={cohortName} sessions={cohortSessions} avgScore={cohortAvg} />
            );
          })}
        </div>
      )}

      {expanded && sessions.length === 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-text-secondary text-sm text-center py-4">No sessions yet for this module</p>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// CohortSection — Sessions within a cohort
// ────────────────────────────────────────────────

function CohortSection({ name, sessions, avgScore }) {
  const [open, setOpen] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  const viewTranscript = (sessionId) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      setTranscript(null);
      return;
    }
    setExpandedSession(sessionId);
    setLoadingTranscript(true);
    fetch(API_BASE + '/api/session/db/' + sessionId, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setTranscript(data.transcript || []);
        setLoadingTranscript(false);
      })
      .catch(() => { setTranscript([]); setLoadingTranscript(false); });
  };

  return (
    <div className="mb-3">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface/50 transition-colors">
        <div className="flex items-center gap-2">
          <svg className={"w-3 h-3 text-text-secondary transition-transform " + (open ? 'rotate-90' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-medium text-text-primary font-mono">{name}</span>
          <span className="text-xs text-text-secondary">{sessions.length} sessions</span>
        </div>
        <span className={"text-xs font-mono font-bold " + (avgScore >= 60 ? 'text-green-600' : avgScore >= 40 ? 'text-yellow-600' : 'text-red-600')}>
          avg {avgScore}%
        </span>
      </button>

      {open && (
        <div className="ml-5 mt-1 space-y-1">
          {sessions.map(s => {
            const score = s.compositeScore || s.objectiveScore || 0;
            const date = s.endedAt || s.createdAt;
            const dateStr = date ? new Date(date).toLocaleDateString() : '';
            const isCoached = s.config?.coachType === 'ai';
            const archetype = s.archetype;
            const archetypeName = archetype
              ? (typeof archetype === 'string' ? archetype : archetype.name || 'Unknown')
              : null;

            return (
              <div key={s.sessionId}>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface/30 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-text-primary font-medium w-32 truncate">{s.userName || 'Anonymous'}</span>
                    <span className={"font-mono font-bold " + (score >= 60 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600')}>
                      {score}%
                    </span>
                    <span className={"px-1.5 py-0.5 rounded " + (isCoached ? 'bg-accent/10 text-accent' : 'bg-surface text-text-secondary')}>
                      {isCoached ? 'Coached' : 'Solo'}
                    </span>
                    {archetypeName && (
                      <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 dark:bg-accent/10 dark:text-accent">
                        {archetypeName}
                      </span>
                    )}
                    <span className="text-text-secondary">{dateStr}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => viewTranscript(s.sessionId)}
                      className="text-text-secondary hover:text-accent font-medium transition-colors"
                    >
                      {expandedSession === s.sessionId ? 'Hide' : 'Transcript'}
                    </button>
                    <a
                      href={API_BASE + '/api/report/' + s.sessionId + '/download'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline font-medium"
                    >
                      PDF
                    </a>
                  </div>
                </div>

                {/* Expanded transcript */}
                {expandedSession === s.sessionId && (
                  <div className="ml-3 mt-1 mb-2 p-3 rounded-lg bg-surface/50 border border-border/30 max-h-64 overflow-y-auto">
                    {loadingTranscript ? (
                      <p className="text-text-secondary text-xs">Loading transcript...</p>
                    ) : transcript && transcript.length > 0 ? (
                      <div className="space-y-2">
                        {transcript.map((msg, i) => (
                          <div key={i} className="text-xs">
                            <span className={"font-bold " + (msg.role === 'user' || msg.role === 'ignator' ? 'text-accent' : 'text-text-secondary')}>
                              {msg.role === 'user' || msg.role === 'ignator' ? 'Ignator' : msg.role === 'assistant' ? 'AI Student' : msg.role}:
                            </span>{' '}
                            <span className="text-text-primary">{msg.content}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-secondary text-xs">No transcript available for this session.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// CompareSection — Coached vs Solo metrics
// ────────────────────────────────────────────────

function CompareSection({ sessions, loading }) {
  if (loading) return null;
  if (!sessions.length) return null;

  const solo = sessions.filter(s => !s.config?.coachType || s.config.coachType === 'none');
  const coached = sessions.filter(s => s.config?.coachType === 'ai');
  if (!solo.length && !coached.length) return null;

  const avg = (arr, fn) => {
    const vals = arr.map(fn).filter(v => v != null && !isNaN(v));
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  };

  const metrics = [
    { label: 'Sessions', solo: solo.length, coached: coached.length, unit: '' },
    { label: 'Avg Score', solo: avg(solo, s => s.compositeScore || s.objectiveScore), coached: avg(coached, s => s.compositeScore || s.objectiveScore), unit: '%' },
    { label: 'Avg Exchanges', solo: avg(solo, s => s.exchangeCount), coached: avg(coached, s => s.exchangeCount), unit: '' },
  ];

  const delta = (a, b) => {
    if (a == null || b == null) return null;
    const d = a - b;
    return d > 0 ? '+' + d : d === 0 ? '0' : '' + d;
  };

  const deltaColor = (a, b) => {
    if (a == null || b == null) return 'text-text-secondary';
    return a > b ? 'text-green-600' : a < b ? 'text-red-600' : 'text-text-secondary';
  };

  return (
    <div className="mt-8">
      <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Coached vs Solo</h2>
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-text-secondary font-medium">Metric</th>
                <th className="text-center py-3 text-text-secondary font-medium">
                  <span className="px-2 py-0.5 rounded-full bg-surface border border-border text-xs">Solo</span>
                </th>
                <th className="text-center py-3 text-text-secondary font-medium">
                  <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs">AI Coached</span>
                </th>
                <th className="text-center py-3 text-text-secondary font-medium text-xs">Effect</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map(m => (
                <tr key={m.label} className="border-b border-border/50">
                  <td className="py-3 text-text-primary font-medium">{m.label}</td>
                  <td className="py-3 text-center font-mono text-text-primary">
                    {m.solo != null ? m.solo + m.unit : '\u2014'}
                  </td>
                  <td className="py-3 text-center font-mono text-accent font-bold">
                    {m.coached != null ? m.coached + m.unit : '\u2014'}
                  </td>
                  <td className={"py-3 text-center font-mono text-sm font-bold " + deltaColor(m.coached, m.solo)}>
                    {m.label === 'Sessions' ? '' : (delta(m.coached, m.solo) != null ? delta(m.coached, m.solo) : '\u2014')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
