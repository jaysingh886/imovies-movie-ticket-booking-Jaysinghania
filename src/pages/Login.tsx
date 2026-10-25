import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, LogIn, AlertCircle, Sparkles, ShieldAlert, User } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { returnTo?: string; message?: string } | undefined;
  const returnTo = state?.returnTo || '/';
  const customMessage = state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(returnTo, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please verify your email and password.';
      setError(msg);
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#101726] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-md shadow-red-600/30">
            <Film className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Sign In to IMovies</h1>
          <p className="text-xs text-slate-400">
            Access your bookings, reserved seats, and manage your tickets
          </p>
        </div>

        {customMessage && (
          <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300">
            {customMessage}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Fill Buttons for easy evaluation */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block text-center">
            One-Click Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('john@example.com', 'user123')}
              className="p-2 bg-[#0b0f19] hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-semibold mb-0.5">
                <User className="w-3 h-3 text-red-400" />
                <span>John Doe</span>
              </div>
              <span className="text-[10px] text-slate-500 block truncate">john@example.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@imovies.com', 'admin123')}
              className="p-2 bg-[#0b0f19] hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-semibold mb-0.5">
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                <span>Admin User</span>
              </div>
              <span className="text-[10px] text-slate-500 block truncate">admin@imovies.com</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 pt-2">
          Don't have an account yet?{' '}
          <Link to="/register" state={{ returnTo }} className="text-red-400 hover:text-red-300 font-semibold underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
