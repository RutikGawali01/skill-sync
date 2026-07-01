import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { googleAuth } from '../../services/authService';
import { setAuth } from '../../redux/authSlice';
import { tokenService, decodeToken } from '../../utils/tokenUtils';

let gisInitialised = false;


const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;


if (!GOOGLE_CLIENT_ID) {
  console.error(
    '[GoogleAuthButton]  VITE_GOOGLE_CLIENT_ID is undefined.\n'
  );
}


const GoogleAuthButton = ({ label }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [error, setError] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(() => Boolean(window.google?.accounts?.id));
  const [scriptFailed, setScriptFailed] = useState(false);

  const dispatchRef = useRef(dispatch);
  const navigateRef = useRef(navigate);
  const setErrorRef = useRef(setError);
  useEffect(() => { dispatchRef.current = dispatch; }, [dispatch]);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);
  useEffect(() => { setErrorRef.current = setError; }, []);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="w-full px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs space-y-1">
        <p className="font-semibold"> Google Client ID not configured</p>
        <p>Set <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> in your <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">.env</code> file and restart the dev server.</p>
      </div>
    );
  }

  const handleCredentialResponse = useCallback(async (credentialResponse) => {
    setErrorRef.current('');
    try {
      const res = await googleAuth(credentialResponse.credential);
      const { accessToken } = res.data.data;
      tokenService.set(accessToken);
      const user = decodeToken(accessToken);
      dispatchRef.current(setAuth({ token: accessToken, user }));
      navigateRef.current('/skills');
    } catch (err) {
      const msg = 'Google sign-in failed. Please try again.';
      console.error('[GoogleAuthButton] OAuth error:', err);
      setErrorRef.current(msg);
    }
  }, []);
  const initGIS = useCallback(() => {
    if (!containerRef.current || !window.google?.accounts?.id) return;

    if (!gisInitialised) {
      gisInitialised = true;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        ux_mode: 'popup',
      });
    }

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
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      initGIS();
      return;
    }

    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer);
        clearTimeout(timeout);
        setScriptLoaded(true);
        initGIS();
      }
    }, 100);

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
      <div
        ref={containerRef}
        id="google-signin-button"
        className="w-full flex justify-center"
        style={{ minHeight: '44px' }}
      />

      {!scriptLoaded && !scriptFailed && (
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading Google Sign-In…
        </div>
      )}

      {scriptFailed && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          Google Sign-In failed to load. Check your internet connection or disable any ad blocker.
        </div>
      )}

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
