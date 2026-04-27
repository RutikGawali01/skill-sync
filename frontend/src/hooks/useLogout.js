import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import { tokenService } from '../utils/tokenUtils';

/**
 * useLogout — centralised logout handler.
 *
 * Clears:
 *  1. localStorage token via tokenService
 *  2. Redux auth state via dispatch(logout())
 *  3. Navigates to /login
 *
 * Note: The HttpOnly refreshToken cookie is cleared by the backend when you call
 *       POST /auth/logout (implement that endpoint to invalidate the server-side session).
 *       For now, the cookie will expire naturally (7 days) or on browser close if session-only.
 */
const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return () => {
    tokenService.clear();          // Remove accessToken from localStorage
    dispatch(logout());            // Clear Redux state (pure — no side effects in reducer)
    navigate('/login', { replace: true });
  };
};

export default useLogout;
