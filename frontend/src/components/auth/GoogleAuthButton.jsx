import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { googleAuth } from '../../services/authService';
import { setAuth } from '../../redux/authSlice';
import { tokenService, decodeToken } from '../../utils/tokenUtils';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// ─────────────────────────────────────────────────────────────────────────────
// DEV GUARD — catch missing env var immediately instead of getting a cryptic
// "Missing required parameter: client_id" error from Google's servers.
// ─────────────────────────────────────────────────────────────────────────────
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

/**
 * GoogleAuthButton
 *
 * Uses Google Identity Services (GIS) SDK — NOT redirect-based OAuth.
 *
 * Flow:
 *  1. GIS SDK renders the official "Continue with Google" button
 *  2. User clicks → GIS shows Google account picker POPUP (not redirect)
 *  3. On success → GIS calls our callback with response.credential (ID token)
 *  4. We POST { idToken } to /api/auth/google  (Vite proxy → http://localhost:8080)
 *  5. Backend verifies with Google, returns accessToken + sets HttpOnly cookie
 *  6. We store token → dispatch to Redux → navigate to /skills
 *
 * Prerequisites:
 *  - VITE_GOOGLE_CLIENT_ID must be set in .env (see .env.example)
 *  - http://localhost:5173 must be in "Authorised JavaScript origins" in Google Cloud Console
 *  - GIS script tag in index.html: <script src="https://accounts.google.com/gsi/client" async defer>
 */
/**
 * GoogleAuthButton
 *
 * Props:
 *   label    — button text hint ("Continue with Google" vs "Sign up with Google")
 *   onError  — optional callback(message: string) called when POST /auth/google fails.
 *              The parent component owns the error display so it can react contextually
 *              (e.g. highlight the email/password section when auth provider mismatch).
 */
const GoogleAuthButton = ({ label, onError }) => {
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const containerRef = useRef(null);
  const initialised  = useRef(false);

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
    try {
      const res = await googleAuth(credentialResponse.credential);
      const { accessToken } = res.data.data;

      tokenService.set(accessToken);
      const user = decodeToken(accessToken);
      dispatch(setAuth({ token: accessToken, user }));
      navigate('/skills');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error   ||
        'Google sign-in failed. Please try again.';
      console.error('[GoogleAuthButton] OAuth error:', err?.response?.status, msg);
      // Bubble the error up to the parent (LoginForm / RegisterForm)
      onError?.(msg);
    }
  }, [dispatch, navigate, onError]);

  const initGIS = useCallback(() => {
    if (initialised.current || !containerRef.current || !window.google?.accounts?.id) return;
    initialised.current = true;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,   // must never be undefined — guarded above
      callback:  handleCredentialResponse,
      ux_mode:   'popup',            // popup flow, NOT redirect
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      theme:          'outline',
      size:           'large',
      type:           'standard',
      shape:          'rectangular',
      logo_alignment: 'left',
      text:  label?.toLowerCase().includes('sign up') ? 'signup_with' : 'continue_with',
      width: containerRef.current.offsetWidth || 400,
    });
  }, [handleCredentialResponse, label]);

  useEffect(() => {
    // If the GIS script has already loaded by the time this component mounts
    if (window.google?.accounts?.id) {
      initGIS();
      return;
    }

    // GIS script loads with `async defer` in index.html — poll until available
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer);
        initGIS();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [initGIS]);

  return (
    <div className="w-full">
      {/* GIS SDK renders its own pixel-perfect button inside this div */}
      <div
        ref={containerRef}
        id="google-signin-button"
        className="w-full flex justify-center"
        style={{ minHeight: '44px' }}
      />

      {/* Spinner shown while the GIS SDK script is still loading */}
      {!window.google?.accounts?.id && (
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading Google Sign-In…
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;
