import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Compass, AlertCircle, ArrowRight, KeyRound, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'STUDENT') {
        navigate('/dashboard');
      } else if (user.role === 'PLACEMENT_ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'PLATFORM_ADMIN') {
        navigate('/platform/moderation');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Demo@1234');
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/25 mb-3">
          <Compass className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Sign In to PlaceWise
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Multi-College Career & Placement Intelligence
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel py-8 px-6 sm:px-8 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-white/10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Institutional / Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rohan.cse@auk.edu"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-black/30 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-slate-400">Demo: Demo@1234</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-black/30 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/25 mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Fillers */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2.5 flex items-center">
              <KeyRound className="w-3.5 h-3.5 mr-1 text-cyan-500" />
              1-Click Demo Account Autofill:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => fillDemo('rohan.cse@auk.edu', 'STUDENT')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-all"
              >
                Rohan (Tech Student)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('ananya.ece@auk.edu', 'STUDENT')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-all"
              >
                Ananya (Both Domains)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('vikram.me@auk.edu', 'STUDENT')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-all"
              >
                Vikram (Non-Tech)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('placement@auk.placewise.io', 'PLACEMENT_ADMIN')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20 transition-all"
              >
                Placement Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@placewise.io', 'PLATFORM_ADMIN')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-all"
              >
                Platform Admin
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-indigo-600 dark:text-cyan-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
