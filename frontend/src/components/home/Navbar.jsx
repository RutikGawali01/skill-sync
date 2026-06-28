import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import { Menu, X, Sun, Moon, Zap, MessageCircle, UserCircle2, LogOut, ChevronDown, CalendarDays, CalendarClock, Star } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { logout } from '../../redux/authSlice';
import NotificationBell from '../notification/NotificationBell';
import useNotificationSocket from '../../hooks/useNotificationSocket';

// ── Nav links differ based on auth ──────────────────────────────────────────
const guestLinks  = [
  { label: 'Home',           path: '/' },
  { label: 'Explore Skills', path: '/skills' },
  { label: 'Community',      path: '/community' },
  { label: 'Features',       path: '/features' },
  { label: 'Login',          path: '/login' },
];

const authedLinks = [
  { label: 'Home',           path: '/' },
  { label: 'Explore Skills', path: '/skills' },
  { label: 'Community',      path: '/community' },
  { label: 'Availability',   path: '/availability', icon: CalendarDays },
  { label: 'Sessions',       path: '/sessions',     icon: CalendarClock },
  { label: 'Reviews',        path: '/reviews',      icon: Star },
  { label: 'Chat',           path: '/chat', icon: MessageCircle },
];

// ── Profile dropdown component ───────────────────────────────────────────────
const ProfileMenu = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const initial = user?.email?.charAt(0)?.toUpperCase() || user?.id?.toString().charAt(0) || 'U';

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500 transition-all"
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
          {initial}
        </div>
        Profile
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-50"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 dark:text-gray-500">Signed in as</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.email || 'User'}
              </p>
            </div>

            <div className="py-1">
              <button
                onClick={() => { navigate('/profile'); setOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <UserCircle2 className="w-4 h-4" />
                My Profile
              </button>
              <button
                onClick={() => { navigate('/availability'); setOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <CalendarDays className="w-4 h-4" />
                Availability
              </button>
              <button
                onClick={() => { navigate('/sessions'); setOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <CalendarClock className="w-4 h-4" />
                Sessions
              </button>
              <button
                onClick={() => { navigate('/chat'); setOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Messages
              </button>
              <button
                onClick={() => { navigate('/reviews'); setOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <Star className="w-4 h-4" />
                Reviews & Trust
              </button>
            </div>

            <div className="py-1 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => { onLogout(); setOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main Navbar ──────────────────────────────────────────────────────────────
const Navbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  // Auth state from Redux
  const { token, user } = useSelector((state) => state.auth);
  const isLoggedIn = Boolean(token);

  const navLinks = isLoggedIn ? authedLinks : guestLinks;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // ── WebSocket: connect when authenticated ──────────────────────────────────
  useNotificationSocket();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // ── Scroll-driven backdrop ─────────────────────────────────────────────────
  const { scrollY } = useScroll();
  const blurPx      = useTransform(scrollY, [0, 120], [4, 20]);
  const backdropFilter = useMotionTemplate`blur(${blurPx}px)`;

  const bgAlpha   = useTransform(scrollY, [0, 120], [0.65, 0.96]);
  const bgLight   = useMotionTemplate`rgba(255, 255, 255, ${bgAlpha})`;
  const bgDark    = useMotionTemplate`rgba(15, 15, 30, ${bgAlpha})`;

  const borderAlpha = useTransform(scrollY, [0, 120], [0.25, 0.55]);
  const borderLight = useMotionTemplate`rgba(200, 200, 220, ${borderAlpha})`;
  const borderDark  = useMotionTemplate`rgba(60, 60, 80, ${borderAlpha})`;

  const shadowAlpha = useTransform(scrollY, [0, 120], [0, 0.14]);
  const boxShadow   = useMotionTemplate`0 8px 32px rgba(0, 0, 0, ${shadowAlpha})`;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          backgroundColor:   isDark ? bgDark : bgLight,
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
          borderColor:       isDark ? borderDark : borderLight,
          boxShadow,
        }}
        className="pointer-events-auto w-full max-w-7xl rounded-2xl border transition-colors duration-300"
      >
        <div className="px-5 h-14 flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/40">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">
              SkillX
            </span>
          </button>

          {/* ── Desktop nav links ── */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(({ label, path, icon: Icon }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50/70 dark:hover:bg-violet-950/40'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
                {isActive(path) && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-xl bg-violet-100 dark:bg-violet-900/40 -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Right actions ── */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {/* Theme toggle — always visible */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100/80 dark:bg-gray-800 text-gray-500 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

                {isLoggedIn ? (
              <>
                {/* Notifications */}
                <NotificationBell />

                {/* Profile dropdown */}
                <ProfileMenu user={user} onLogout={handleLogout} />
              </>
            ) : (
              /* Guest: "Get Started" CTA */
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-violet-500/30 transition-all duration-200"
              >
                Get Started
              </motion.button>
            )}
          </div>

          {/* ── Mobile controls ── */}
          <div className="md:hidden flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100/80 dark:bg-gray-800 text-gray-500 dark:text-yellow-400 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {isLoggedIn && (
              <NotificationBell />
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100/80 dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            >
              {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-gray-100/60 dark:border-gray-800/60"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map(({ label, path, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => { navigate(path); setIsOpen(false); }}
                    className={`flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive(path)
                        ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/50'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {label}
                  </button>
                ))}

                {isLoggedIn ? (
                  <div className="pt-2 space-y-1 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => { navigate('/profile'); setIsOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-600 dark:hover:text-violet-400 transition-all"
                    >
                      <UserCircle2 className="w-4 h-4" /> My Profile
                    </button>
                    <button
                      onClick={() => { navigate('/availability'); setIsOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-600 dark:hover:text-violet-400 transition-all"
                    >
                      <CalendarDays className="w-4 h-4" /> Availability
                    </button>
                    <button
                      onClick={() => { navigate('/sessions'); setIsOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-600 dark:hover:text-violet-400 transition-all"
                    >
                      <CalendarClock className="w-4 h-4" /> Sessions
                    </button>
                    <button
                      onClick={() => { navigate('/reviews'); setIsOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-600 dark:hover:text-violet-400 transition-all"
                    >
                      <Star className="w-4 h-4" /> Reviews & Trust
                    </button>
                    <button
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { navigate('/login'); setIsOpen(false); }}
                    className="block w-full mt-2 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center rounded-xl font-semibold text-sm"
                  >
                    Get Started
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

export default Navbar;
