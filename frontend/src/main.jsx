import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import './index.css';
import App from './App.jsx';
import store from './redux/store.js';
import { ThemeProvider } from './context/ThemeContext.jsx';
import SilentRefresh from './components/auth/SilentRefresh.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*
      Provider        — Redux store available globally
      MantineProvider — Required root wrapper for ALL Mantine components
      ThemeProvider   — dark/light mode on document.documentElement
      SilentRefresh   — calls /auth/refresh on load, restores session from cookie
      App             — BrowserRouter + AppRoutes
    */}
    <Provider store={store}>
      <MantineProvider>
        <Notifications position="top-right" zIndex={9999} />
        <ThemeProvider>
          <SilentRefresh>
            <App />
          </SilentRefresh>
        </ThemeProvider>
      </MantineProvider>
    </Provider>
  </StrictMode>,
);
