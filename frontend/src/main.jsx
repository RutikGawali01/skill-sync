import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import App from './App.jsx';
import store from './redux/store.js';
import { ThemeProvider } from './context/ThemeContext.jsx';
import SilentRefresh from './components/auth/SilentRefresh.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*
      Provider     — Redux store available globally
      ThemeProvider — dark/light mode on document.documentElement
      SilentRefresh — calls /auth/refresh on load, restores session from cookie
      App          — BrowserRouter + AppRoutes
    */}
    <Provider store={store}>
      <ThemeProvider>
        <SilentRefresh>
          <App />
        </SilentRefresh>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
