import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function JoinCohortPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, joinCohort } = useAuth();

  const [cohort, setCohort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetch('/api/cohorts/by-code/' + code, { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error('Cohort not found');
        return r.json();
      })
      .then(data => {
        setCohort(data.cohort || data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Could not find this cohort');
        setLoading(false);
      });
  }, [code]);

  const handleJoin = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    try {
      const joinName = isAuthenticated ? user.name : name.trim();
      const joinEmail = isAuthenticated ? user.email : email.trim().toLowerCase();
      await joinCohort(code, joinName, joinEmail);
      navigate('/dashboard');
    } catch (err) {
      setSubmitError(err.message || 'Failed to join cohort');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading cohort...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <div className="text-3xl mb-3">\u26A0\uFE0F</div>
          <h2 className="text-text-primary text-lg font-bold mb-2">Cohort Not Found</h2>
          <p className="text-text-secondary text-sm mb-4">{error}</p>
          <a href="/" className="text-accent text-sm hover:underline">Back to home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-2">
              VidyaSpark
            </div>
            <h2 className="text-text-primary text-xl font-bold">{cohort?.name || 'Join Cohort'}</h2>
            {cohort?.description && (
              <p className="text-text-secondary text-sm mt-2">{cohort.description}</p>
            )}
            {cohort?.moduleCount != null && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                {cohort.moduleCount} module{cohort.moduleCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          <form onSubmit={handleJoin} className="space-y-3">
            {!isAuthenticated && (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-text-primary placeholder-zinc-600 outline-none focus:border-accent/40 transition-colors"
                  autoFocus
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-text-primary placeholder-zinc-600 outline-none focus:border-accent/40 transition-colors"
                />
              </>
            )}

            {isAuthenticated && (
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-text-secondary">
                Joining as <span className="text-text-primary font-medium">{user.name}</span> ({user.email})
              </div>
            )}

            {submitError && (
              <p className="text-red-400 text-xs px-1">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitting || (!isAuthenticated && (!name.trim() || !email.trim()))}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-accent text-black hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Joining...
                </span>
              ) : (
                'Join this Cohort'
              )}
            </button>
          </form>

          <div className="text-center mt-5">
            <a href="/" className="text-text-secondary text-xs hover:text-accent transition-colors">
              Back to home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
