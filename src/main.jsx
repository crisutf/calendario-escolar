import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';
import './index.css';
import App from './App.jsx';
import Login from './pages/Login.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PanelLayout from './components/panel/PanelLayout.jsx';
import Dashboard from './pages/panel/Dashboard.jsx';
import EventsPage from './pages/panel/EventsPage.jsx';
import AnnouncementsPage from './pages/panel/AnnouncementsPage.jsx';
import UsersPage from './pages/panel/UsersPage.jsx';
import SettingsPage from './pages/panel/SettingsPage.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CalendarProvider } from './context/CalendarProvider.jsx';

// Garantizar captura del evento de instalación nativa de la PWA
if (typeof window !== 'undefined' && !window.__pwaListenersRegistered) {
  window.__pwaListenersRegistered = true;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
  });
  window.addEventListener('appinstalled', () => {
    try {
      localStorage.setItem('cal_pwa_installed', 'true');
    } catch {}
    window.__deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed-change', { detail: { isInstalled: true } }));
  });
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <CalendarProvider>
              <Toaster
                position="top-right"
                richColors
                closeButton
                pauseWhenPageIsHidden
                toastOptions={{
                  classNames: {
                    toast: '!rounded-2xl !shadow-lg !border !border-slate-200/60 dark:!border-slate-800/60 !backdrop-blur-xl !bg-white/90 dark:!bg-slate-900/90',
                  },
                }}
              />
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="/login" element={<Login />} />
                <Route path="/panel" element={<ProtectedRoute />}>
                  <Route element={<PanelLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="eventos" element={<EventsPage />} />
                    <Route path="comunicados" element={<AnnouncementsPage />} />
                    <Route path="usuarios" element={<UsersPage />} />
                    <Route path="configuracion" element={<SettingsPage />} />
                  </Route>
                </Route>
              </Routes>
            </CalendarProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
);
