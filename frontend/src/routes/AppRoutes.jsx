import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import HomePage from '../pages/home/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import SkillsPage from '../pages/skills/SkillsPage';
import ProfilePage from '../pages/ProfilePage';

// Placeholder pages — replace with real components as they are built
const Placeholder = ({ label }) => (
  <div className="flex items-center justify-center min-h-[60vh] text-2xl font-bold text-violet-600 dark:text-violet-400">
    {label} (Coming Soon)
  </div>
);

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* ── Public auth pages: full-screen, no Navbar/Footer ── */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Public pages: shared Navbar + Footer via MainLayout ── */}
      <Route element={<MainLayout />}>
        <Route path="/"        element={<HomePage />} />
        <Route path="/features"  element={<Placeholder label="Features Page" />} />
        <Route path="/community" element={<Placeholder label="Community" />} />
        <Route path="/about"     element={<Placeholder label="About Page" />} />
        <Route path="/contact"   element={<Placeholder label="Contact Page" />} />
      </Route>

      {/* ── Protected pages: require valid auth token ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/skills"        element={<SkillsPage />} />
          <Route path="/matches"       element={<Placeholder label="Matches Page" />} />
          <Route path="/chat"          element={<Placeholder label="Chat" />} />
          <Route path="/profile"       element={<ProfilePage />} />
          <Route path="/notifications" element={<Placeholder label="Notifications" />} />
        </Route>
      </Route>

      {/* ── Catch-all ── */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<Placeholder label="404 — Page Not Found" />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;