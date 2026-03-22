import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginScreen({ cohortCode, cohortName, onSuccess }) {
  const { login, signup, joinCohort } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(cohortCode ? 'signup' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (cohortCode) {
        await joinCohort(cohortCode, name.trim(), email.trim().toLowerCase());
      } else if (mode === 'login') {
        await login(email.trim().toLowerCase());
      } else {
        await signup(name.trim(), email.trim().toLowerCase());
      }
      if (onSuccess) onSuccess();
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-2">
              VidyaSpark
            </div>
            {cohortCode ? (
              <>
                <h2 className="text-text-primary text-xl font-bold">Join {cohortName || 'Cohort'}</h2>
                <p className="text-text-secondary text-sm mt-1">Enter your details to join</p>
              </>
            ) : mode === 'login' ? (
              <>
                <h2 className="text-text-primary text-xl font-bold">Welcome back</h2>
                <p className="text-text-secondary text-sm mt-1">Sign in to continue</p>
              </>
            ) : (
              <>
                <h2 className="text-text-primary text-xl font-bold">Create account</h2>
                <p className="text-text-secondary text-sm mt-1">Get started for free</p>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {(mode === 'signup' || cohortCode) && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-text-primary placeholder-zinc-600 outline-none focus:border-accent/40 transition-colors"
                autoFocus
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-text-primary placeholder-zinc-600 outline-none focus:border-accent/40 transition-colors"
              autoFocus={mode === 'login' && !cohortCode}
            />

            {error && (
              <p className="text-red-400 text-xs px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !email.trim() || ((mode === 'signup' || cohortCode) && !name.trim())}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {cohortCode ? 'Joining...' : mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                cohortCode ? 'Join Cohort' : mode === 'login' ? 'Sign In' : 'Sign Up'
              )}
            </button>
          </form>

          {/* Toggle mode */}
          {!cohortCode && (
            <div className="text-center mt-5">
              {mode === 'login' ? (
                <button
                  onClick={() => { setMode('signup'); setError(''); }}
                  className="text-text-secondary text-xs hover:text-accent transition-colors"
                >
                  New here? <span className="text-accent font-medium">Create an account</span>
                </button>
              ) : (
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-text-secondary text-xs hover:text-accent transition-colors"
                >
                  Already have an account? <span className="text-accent font-medium">Sign in</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
