import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';
import { setAuth } from '../../redux/authSlice';
import { refreshAccessToken } from '../../services/authService';
import { tokenService, decodeToken } from '../../utils/tokenUtils';

/**
 * SilentRefresh
 *
 * Runs once on app load (before any page renders).
 *
 * Strategy:
 *  1. Call POST /auth/refresh — backend reads HttpOnly refreshToken cookie
 *  2. If valid cookie  → get new accessToken → store → dispatch to Redux → render app
 *  3. If no cookie / expired → clear stale token → render app as guest
 *
 * This restores the session on hard refresh without requiring login again.
 */
const SilentRefresh = ({ children }) => {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const res = await refreshAccessToken();
        const { accessToken } = res.data.data;
        const user = decodeToken(accessToken);
        tokenService.set(accessToken);
        dispatch(setAuth({ token: accessToken, user }));
      } catch {
        // No valid refresh token (guest) — clear any stale access token
        tokenService.clear();
      } finally {
        setReady(true);
      }
    };

    tryRefresh();
  }, [dispatch]);

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Logo */}
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/30">
            <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
          <p className="text-violet-300/60 text-sm">Starting SkillX…</p>
        </motion.div>
      </div>
    );
  }

  return children;
};

export default SilentRefresh;
