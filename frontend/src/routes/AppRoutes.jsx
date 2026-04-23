import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/home/HomePage';

// Placeholder pages — replace with real components as they are built
const Placeholder = ({ label }) => (
  <div className="flex items-center justify-center min-h-[60vh] text-2xl font-bold text-violet-600 dark:text-violet-400">
    {label} (Coming Soon)
  </div>
);

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* All routes share Navbar + Footer via MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/"        element={<HomePage />} />
        <Route path="/features" element={<Placeholder label="Features Page" />} />
        <Route path="/matches"  element={<Placeholder label="Matches Page" />} />
        <Route path="/login"    element={<Placeholder label="Login Page" />} />
        <Route path="/about"    element={<Placeholder label="About Page" />} />
        <Route path="/contact"  element={<Placeholder label="Contact Page" />} />
        <Route path="*"         element={<Placeholder label="404 — Page Not Found" />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;