import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../utils/api';

const SUBJECT_COLORS = {
  Physics:     { bg: 'bg-[#2196F3]/10', text: 'text-[#2196F3]', border: 'border-[#2196F3]/30', solid: '#2196F3' },
  Chemistry:   { bg: 'bg-[#9C27B0]/10', text: 'text-[#9C27B0]', border: 'border-[#9C27B0]/30', solid: '#9C27B0' },
  Mathematics: { bg: 'bg-[#FF9800]/10', text: 'text-[#FF9800]', border: 'border-[#FF9800]/30', solid: '#FF9800' },
};

const TABS = ['All', 'Physics', 'Chemistry', 'Mathematics'];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [userStats, setUserStats] = useState(null);
  const [modules, setModules] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, modulesRes, sessionsRes] = await Promise.all([
          fetch(API_BASE + '/api/dashboard/user-stats', { credentials: 'include' }),
          fetch(API_BASE + '/api/modules/available', { credentials: 'include' }),
          fetch(API_BASE + '/api/dashboard/sessions', { credentials: 'include' }).catch(() => null),
        ]);

        if (!statsRes.ok) throw new Error('Failed to load user stats');
        if (!modulesRes.ok) throw new Error('Failed to load modules');

        const statsData = await statsRes.json();
        const modulesData = await modulesRes.json();
        const sessionsData = sessionsRes && sessionsRes.ok ? await sessionsRes.json() : [];

        setUserStats(statsData);
        setModules(Array.isArray(modulesData) ? modulesData : modulesData.modules || []);
        setSessions(Array.isArray(sessionsData) ? sessionsData.slice(0, 5) : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredModules = activeTab === 'All'
    ? modules
    : modules.filter(m => m.subject === activeTab);

  const userInitial = (user?.name || 'I').charAt(0).toUpperCase();

  // --- Render ---

  return (
    <div className="min-h-screen bg-bg">

      {/* ===== HEADER ===== */}
      <header className="border-b border-border bg-surface/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-accent font-bold text-sm tracking-[0.18em] uppercase">VidyaSpark</span>
          </a>

          {/* User avatar + dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(prev => !prev)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold">
                {userInitial}
              </div>
              <span className="text-text-secondary text-sm hidden sm:block">{user?.name || 'Ignator'}</span>
              <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-1 w-56 bg-surface border border-border rounded-xl shadow-xl z-50 py-2">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-text-primary text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-text-secondary text-xs truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/[0.04] transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* ===== LOADING STATE ===== */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-text-secondary text-sm">Loading your Tapovan...</p>
          </div>
        )}

        {/* ===== ERROR STATE ===== */}
        {!loading && error && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-accent text-black hover:bg-accent/90 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ===== DASHBOARD CONTENT ===== */}
        {!loading && !error && (
          <>
            {/* --- Ignator Profile Section --- */}
            <section className="mb-10">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  {userInitial}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">
                    Namaste, {user?.name || 'Ignator'}
                  </h1>
                  <p className="text-text-secondary text-sm mt-0.5">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  label="Tapovan Sessions"
                  value={userStats?.totalSessions ?? 0}
                />
                <StatCard
                  label="Modules Practiced"
                  value={userStats?.completedModules ?? userStats?.modulesCompleted ?? 0}
                />
                <StatCard
                  label="Avg Spark Score"
                  value={userStats?.avgSparkScore != null ? userStats.avgSparkScore + '%' : '--'}
                  color="text-accent"
                />
                <StatCard
                  label="Avg Reach Score"
                  value={userStats?.avgReachScore != null ? userStats.avgReachScore + '%' : '--'}
                  color="text-emerald-400"
                />
              </div>
            </section>

            {/* --- Module Library --- */}
            <section className="mb-12">
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
                Module Library
              </h2>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 bg-white/[0.03] rounded-xl p-1 w-fit">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' +
                      (activeTab === tab
                        ? 'bg-accent text-black'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]')
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Module Grid */}
              {filteredModules.length === 0 ? (
                <div className="text-center py-16 bg-surface border border-border rounded-2xl">
                  <p className="text-text-secondary text-sm">No modules available in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredModules.map(mod => (
                    <ModuleCard
                      key={mod.id || mod._id}
                      mod={mod}
                      onEnter={() => navigate('/tapovan/' + (mod.id || mod._id))}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* --- Recent Sessions --- */}
            <section>
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
                Recent Tapovan Sessions
              </h2>

              {sessions.length === 0 ? (
                <div className="text-center py-12 bg-surface border border-border rounded-2xl">
                  <svg className="w-10 h-10 text-text-secondary/40 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-text-secondary text-sm">No sessions yet. Enter the Tapovan to begin your practice.</p>
                </div>
              ) : (
                <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                  {sessions.map((session, i) => (
                    <div
                      key={session.id || session._id || i}
                      className={'flex items-center justify-between px-5 py-4 ' + (i < sessions.length - 1 ? 'border-b border-border' : '')}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-text-primary text-sm font-medium truncate">
                            {session.moduleName || session.module?.name || 'Session'}
                          </p>
                          <p className="text-text-secondary text-xs mt-0.5">
                            {session.date ? new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {session.archetype && (
                          <span className="text-text-secondary text-xs hidden sm:block">{session.archetype}</span>
                        )}
                        {session.score != null && (
                          <span className={'text-sm font-mono font-bold ' + (session.score >= 60 ? 'text-emerald-400' : session.score >= 40 ? 'text-yellow-400' : 'text-red-400')}>
                            {session.score}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}


/* ===== Sub-components ===== */

function StatCard({ label, value, color }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 text-center">
      <div className={'text-2xl font-bold font-mono ' + (color || 'text-text-primary')}>{value}</div>
      <div className="text-text-secondary text-xs mt-1.5">{label}</div>
    </div>
  );
}

function ModuleCard({ mod, onEnter }) {
  const subject = mod.subject || 'Physics';
  const colors = SUBJECT_COLORS[subject] || SUBJECT_COLORS.Physics;

  return (
    <div
      className="bg-surface border border-border rounded-2xl p-5 flex flex-col transition-all hover:border-accent/20 group"
      style={{ borderLeftWidth: '3px', borderLeftColor: colors.solid }}
    >
      {/* Subject tag */}
      <span className={'inline-block text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border w-fit mb-3 ' + colors.bg + ' ' + colors.text + ' ' + colors.border}>
        {subject}
      </span>

      {/* Module code + name */}
      <p className="text-text-secondary text-xs font-mono mb-1">{mod.ablCode || mod.code || ''}</p>
      <h3 className="text-text-primary font-bold text-base mb-3 leading-snug">{mod.name || mod.title}</h3>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary mb-4">
        <span>~{mod.estimatedMinutes || mod.duration || 20} min</span>
        {(mod.sessions != null || mod.sessionCount != null) && (
          <span>{mod.sessions ?? mod.sessionCount} session{(mod.sessions ?? mod.sessionCount) !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Score */}
      <div className="mb-4">
        {mod.bestScore != null ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-text-secondary">Best score:</span>
            <span className={'font-mono font-bold ' + (mod.bestScore >= 60 ? 'text-emerald-400' : mod.bestScore >= 40 ? 'text-yellow-400' : 'text-red-400')}>
              {mod.bestScore}%
            </span>
          </div>
        ) : (
          <span className="text-text-secondary text-xs italic">Not yet practiced</span>
        )}
      </div>

      {/* CTA */}
      <div className="mt-auto">
        <button
          onClick={onEnter}
          className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-black hover:bg-accent/90 transition-colors group-hover:shadow-lg group-hover:shadow-accent/10"
        >
          Enter the Tapovan &rarr;
        </button>
      </div>
    </div>
  );
}
