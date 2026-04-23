import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import { Menu, X, Sun, Moon, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Features', path: '/features' },
  { label: 'Login', path: '/login' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // Smooth scroll-driven motion values
  const { scrollY } = useScroll();

  // Blur: smoothly grows from 4px → 20px as user scrolls 0–120px
  const blurPx   = useTransform(scrollY, [0, 120], [4, 20]);
  const backdropFilter = useMotionTemplate`blur(${blurPx}px)`;

  // Background opacity: 0.65 → 0.95
  const bgAlpha  = useTransform(scrollY, [0, 120], [0.65, 0.96]);
  const bgLight  = useMotionTemplate`rgba(255, 255, 255, ${bgAlpha})`;
  const bgDark   = useMotionTemplate`rgba(15, 15, 30, ${bgAlpha})`;

  // Border opacity: 0.25 → 0.55
  const borderAlpha = useTransform(scrollY, [0, 120], [0.25, 0.55]);
  const borderLight = useMotionTemplate`rgba(200, 200, 220, ${borderAlpha})`;
  const borderDark  = useMotionTemplate`rgba(60, 60, 80, ${borderAlpha})`;

  // Shadow opacity: 0 → 0.14
  const shadowAlpha = useTransform(scrollY, [0, 120], [0, 0.14]);
  const boxShadow   = useMotionTemplate`0 8px 32px rgba(0, 0, 0, ${shadowAlpha})`;

  return (
    /* Outer wrapper — full-width fixed band, centres the pill */
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          backgroundColor: isDark ? bgDark : bgLight,
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
          borderColor: isDark ? borderDark : borderLight,
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
            {navLinks.map(({ label, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50/70 dark:hover:bg-violet-950/40'
                }`}
              >
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
            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100/80 dark:bg-gray-800 text-gray-500 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-violet-500/30 transition-all duration-200"
            >
              Get Started
            </motion.button>
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
                {navLinks.map(({ label, path }) => (
                  <button
                    key={label}
                    onClick={() => { navigate(path); setIsOpen(false); }}
                    className={`block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive(path)
                        ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { navigate('/login'); setIsOpen(false); }}
                  className="block w-full mt-2 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center rounded-xl font-semibold text-sm"
                >
                  Get Started
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

export default Navbar;
