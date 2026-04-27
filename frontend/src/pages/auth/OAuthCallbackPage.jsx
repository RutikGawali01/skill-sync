import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { setAuth } from '../../redux/authSlice';

/**
 * OAuthCallbackPage
 *
 * Spring Boot redirects here after Google OAuth:
 *   http://localhost:5173/oauth/callback?token=<JWT>&name=John&email=john@gmail.com
 *
 * This page reads URL params, stores the token, and redirects to home.
 */
const OAuthCallbackPage = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const name   = params.get('name')  || '';
    const email  = params.get('email') || '';

    if (!token) {
      setError('OAuth authentication failed. No token received.');
      return;
    }

    // Dispatch to Redux + persist to localStorage via authSlice
    dispatch(setAuth({
      token,
      user: { name, email },
    }));

    navigate('/', { replace: true });
  }, [dispatch, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-950 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full text-center border border-white/50 dark:border-gray-700/50 shadow-2xl"
        >
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Authentication Failed</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold text-sm"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-950">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 text-white"
      >
        <Loader2 className="w-10 h-10 animate-spin text-violet-400" />
        <p className="text-violet-200 text-sm">Completing sign-in…</p>
      </motion.div>
    </div>
  );
};

export default OAuthCallbackPage;
