import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { googleAuth } from '../../services/authService';
import { setAuth } from '../../redux/authSlice';
import { tokenService, decodeToken } from '../../utils/tokenUtils';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

//catch missing env var 

if (!GOOGLE_CLIENT_ID) {
  console.error(
    '[GoogleAuthButton] ❌ VITE_GOOGLE_CLIENT_ID is undefined.\n' +
    'Steps to fix:\n' +
    '  1. Open d:/skill-sync/frontend/.env\n' +
    '  2. Set: VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com\n' +
    '  3. Restart the Vite dev server (Ctrl+C then npm run dev)\n' +
    '  4. Verify: console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID) should print your ID'
  );
}


const GoogleAuthButton = ({ label }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const initialised = useRef(false);
  const [error, setError] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(() => Boolean(window.google?.accounts?.id));
  const [scriptFailed, setScriptFailed] = useState(false);

  // Show a clear dev error card instead of rendering a broken button
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="w-full px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs space-y-1">
        <p className="font-semibold">⚠️ Google Client ID not configured</p>
        <p>Set <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> in your <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">.env</code> file and restart the dev server.</p>
      </div>
    );
  }

  /**
   * Wrapped in useCallback so the reference stays stable across re-renders.
   * GIS.initialize() captures this callback at init time — a stale ref would
   * silently break auth after the component re-renders.
   */
  const handleCredentialResponse = useCallback(async (credentialResponse) => {
    setError('');
    try {
      const res = await googleAuth(credentialResponse.credential);
      const { accessToken } = res.data.data;

      // 1. Persist token to localStorage via tokenService abstraction
      tokenService.set(accessToken);
      // 2. Decode JWT payload { id, email, role } and hydrate Redux
      const user = decodeToken(accessToken);
      dispatch(setAuth({ token: accessToken, user }));
      // 3. Navigate to the protected dashboard
      navigate('/skills');
    } catch (err) {
      const msg = 'Google sign-in failed. Please try again.';
      console.error('[GoogleAuthButton] OAuth error:', msg);
      setError(msg);
    }
  }, [dispatch, navigate]);

  const initGIS = useCallback(() => {
    if (initialised.current || !containerRef.current || !window.google?.accounts?.id) return;
    initialised.current = true;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,   // must never be undefined — guarded above
      callback: handleCredentialResponse,
      ux_mode: 'popup',            // popup flow, NOT redirect
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      shape: 'rectangular',
      logo_alignment: 'left',
      text: label?.toLowerCase().includes('sign up') ? 'signup_with' : 'continue_with',
      width: containerRef.current.offsetWidth || 400,
    });
  }, [handleCredentialResponse, label]);

  useEffect(() => {
    // Already loaded before mount (e.g. hot reload)
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      initGIS();
      return;
    }

    // GIS script loads with `async defer` — poll until available
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer);
        clearTimeout(timeout);
        setScriptLoaded(true);
        initGIS();
      }
    }, 100);

    // Safety net: if Google's script hasn't loaded in 8s, show error
    const timeout = setTimeout(() => {
      clearInterval(timer);
      if (!window.google?.accounts?.id) {
        setScriptFailed(true);
      }
    }, 8000);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [initGIS]);

  return (
    <div className="w-full space-y-2">
      {/* GIS SDK renders its own pixel-perfect button inside this div */}
      <div
        ref={containerRef}
        id="google-signin-button"
        className="w-full flex justify-center"
        style={{ minHeight: '44px' }}
      />

      {/* Spinner: only while waiting for GIS script — disappears once loaded */}
      {!scriptLoaded && !scriptFailed && (
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading Google Sign-In…
        </div>
      )}

      {/* Shown if Google's script fails to load after 8 seconds */}
      {scriptFailed && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          Google Sign-In failed to load. Check your internet connection or disable any ad blocker.
        </div>
      )}

      {/* Error banner shown if POST /auth/google fails */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;
