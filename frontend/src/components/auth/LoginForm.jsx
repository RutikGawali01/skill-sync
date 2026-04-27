import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, X, AlertCircle, ArrowRight } from 'lucide-react';
import { login } from '../../services/authService';
import { setAuth } from '../../redux/authSlice';
import { decodeToken } from '../../utils/tokenUtils';
import GoogleAuthButton from './GoogleAuthButton';

/**
 * Detect whether a backend error message is telling the user to use
 * email/password instead of Google. If so, we highlight that section.
 */
const isUseEmailError = (msg = '') =>
  /email|password|local|provider/i.test(msg);

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const emailRef = useRef(null);

  const [form, setForm]         = useState({ email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPass, setShowPass] = useState(false);
  // true when the error is specifically "please use email/password"
  const [highlightEmail, setHighlightEmail] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const dismissError = () => {
    setError('');
    setHighlightEmail(false);
  };

  /**
   * Called by GoogleAuthButton when POST /auth/google returns a 4xx/5xx.
   * Lifting the error up lets LoginForm react — e.g. highlight the email section.
   */
  const handleGoogleError = (msg) => {
    setError(msg);
    if (isUseEmailError(msg)) {
      setHighlightEmail(true);
      // Scroll into view and focus the email field after a short delay
      setTimeout(() => emailRef.current?.focus(), 300);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dismissError();
    setLoading(true);
    try {
      const response = await login(form);
      const { accessToken } = response.data.data;
      const user = decodeToken(accessToken);
      dispatch(setAuth({ token: accessToken, user }));
      navigate('/skills');
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Google OAuth ─────────────────────────────────────────── */}
      <GoogleAuthButton
        label="Continue with Google"
        onError={handleGoogleError}
      />

      {/* ── Divider ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
          or continue with email
        </span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* ── Error banner (dismissible) ────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error-banner"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="relative flex gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-medium leading-snug">{error}</p>
                {/* Contextual hint when Google says "use email/password" */}
                {highlightEmail && (
                  <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 font-medium">
                    <ArrowRight className="w-3 h-3" />
                    Enter your email &amp; password below to sign in
                  </p>
                )}
              </div>
              {/* Dismiss button */}
              <button
                type="button"
                onClick={dismissError}
                aria-label="Dismiss error"
                className="flex-shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Email ────────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={emailRef}
            type="email"
            name="email"
            id="login-email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className={[
              'w-full pl-10 pr-4 py-3 rounded-xl border bg-white dark:bg-gray-800/60',
              'text-gray-900 dark:text-white placeholder-gray-400 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all',
              // Highlight the field when backend says "use email/password"
              highlightEmail
                ? 'border-violet-500 ring-2 ring-violet-500/30'
                : 'border-gray-200 dark:border-gray-700',
            ].join(' ')}
          />
        </div>
      </div>

      {/* ── Password ─────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showPass ? 'text' : 'password'}
            name="password"
            id="login-password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className={[
              'w-full pl-10 pr-11 py-3 rounded-xl border bg-white dark:bg-gray-800/60',
              'text-gray-900 dark:text-white placeholder-gray-400 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all',
              highlightEmail
                ? 'border-violet-500 ring-2 ring-violet-500/30'
                : 'border-gray-200 dark:border-gray-700',
            ].join(' ')}
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Submit ───────────────────────────────────────────────── */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={!loading ? { scale: 1.02 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
        className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Signing in…' : 'Sign in'}
      </motion.button>
    </form>
  );
};

export default LoginForm;
