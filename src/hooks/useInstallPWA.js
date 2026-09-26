import { useState, useEffect, useCallback } from 'react';

/**
 * Comprueba de forma síncrona si la ventana actual se está ejecutando
 * en modo aplicación independiente (PWA instalada).
 */
export function checkIsStandalone() {
  if (typeof window === 'undefined') return false;

  try {
    const isStandaloneMedia =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.matchMedia?.('(display-mode: window-controls-overlay)').matches ||
      window.matchMedia?.('(display-mode: minimal-ui)').matches ||
      window.matchMedia?.('(display-mode: fullscreen)').matches;

    const isNavigatorStandalone = window.navigator?.standalone === true;

    const hasDomClass =
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('is-pwa-standalone');

    const searchParams = new URLSearchParams(window.location.search);
    const hasSourceParam =
      searchParams.get('source') === 'pwa' ||
      searchParams.get('mode') === 'standalone' ||
      searchParams.get('utm_source') === 'pwa';

    const isAndroidApp =
      typeof document !== 'undefined' &&
      document.referrer?.startsWith('android-app://');

    return Boolean(
      isStandaloneMedia ||
      isNavigatorStandalone ||
      hasDomClass ||
      hasSourceParam ||
      isAndroidApp
    );
  } catch {
    return false;
  }
}

/**
 * Comprueba de forma síncrona el estado de instalación inicial conocido.
 */
export function checkInitialInstalledStatus() {
  if (typeof window === 'undefined') return false;

  // 1. Si estamos dentro de la ventana de la app standalone, 100% instalada
  if (checkIsStandalone()) {
    try {
      localStorage.setItem('cal_pwa_installed', 'true');
    } catch {}
    return true;
  }

  // 2. Si previamente se registró la instalación en localStorage en este navegador
  try {
    if (localStorage.getItem('cal_pwa_installed') === 'true') {
      return true;
    }
  } catch {}

  return false;
}

export function useInstallPWA() {
  const [isStandalone, setIsStandalone] = useState(() => checkIsStandalone());
  const [isInstalled, setIsInstalled] = useState(() => checkInitialInstalledStatus());
  const [deferredPrompt, setDeferredPrompt] = useState(() => {
    return typeof window !== 'undefined' ? window.__deferredPrompt || null : null;
  });
  const [isInstallable, setIsInstallable] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (checkIsStandalone()) return false;
    if (checkInitialInstalledStatus()) return false;
    return !!window.__deferredPrompt;
  });

  // Re-evaluar estado completo de instalación
  const syncStatus = useCallback(() => {
    if (typeof window === 'undefined') return;

    const standalone = checkIsStandalone();
    setIsStandalone(standalone);

    let installed = standalone;
    if (!installed) {
      try {
        installed = localStorage.getItem('cal_pwa_installed') === 'true';
      } catch {}
    }

    setIsInstalled(installed);

    const hasPrompt = Boolean(window.__deferredPrompt);
    setDeferredPrompt(window.__deferredPrompt || null);

    // Solo es instalable si NO está en standalone, NO está instalada y tenemos prompt disponible
    setIsInstallable(!standalone && !installed && hasPrompt);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Si estamos en modo standalone, asegurar marca en localStorage
    if (checkIsStandalone()) {
      try {
        localStorage.setItem('cal_pwa_installed', 'true');
      } catch {}
      setIsInstalled(true);
      setIsStandalone(true);
      setIsInstallable(false);
    }

    // 2. Comprobar API nativa de Chromium navigator.getInstalledRelatedApps()
    if ('getInstalledRelatedApps' in navigator) {
      navigator.getInstalledRelatedApps()
        .then((relatedApps) => {
          if (Array.isArray(relatedApps) && relatedApps.length > 0) {
            setIsInstalled(true);
            setIsInstallable(false);
            try {
              localStorage.setItem('cal_pwa_installed', 'true');
            } catch {}
          } else if (!checkIsStandalone()) {
            // Si el navegador afirma que no hay ninguna app instalada y tenemos prompt
            if (window.__deferredPrompt) {
              setIsInstalled(false);
              setIsInstallable(true);
              try {
                localStorage.removeItem('cal_pwa_installed');
              } catch {}
            }
          }
        })
        .catch(() => {
          // Ignorar si el navegador restringe la API
        });
    }

    // 3. Manejadores de eventos
    const handlePrompt = (e) => {
      e.preventDefault();
      window.__deferredPrompt = e;
      setDeferredPrompt(e);

      // Si se dispara el prompt nativo y no estamos en standalone,
      // significa que el navegador considera que se puede instalar
      if (!checkIsStandalone()) {
        // Si no teníamos confirmado getInstalledRelatedApps, reactivamos installable
        setIsInstallable(true);
      }
    };

    const handlePromptReady = () => {
      if (window.__deferredPrompt && !checkIsStandalone()) {
        setDeferredPrompt(window.__deferredPrompt);
        if (!checkInitialInstalledStatus()) {
          setIsInstallable(true);
        }
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      window.__deferredPrompt = null;
      setDeferredPrompt(null);
      try {
        localStorage.setItem('cal_pwa_installed', 'true');
      } catch {}
    };

    const handleCustomInstalledChange = (e) => {
      const isInst = Boolean(e?.detail?.isInstalled ?? true);
      setIsInstalled(isInst);
      if (isInst) {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === 'cal_pwa_installed') {
        const val = e.newValue === 'true';
        setIsInstalled(val || checkIsStandalone());
        if (val) setIsInstallable(false);
      }
    };

    // 4. Escuchar cambios de resolución/display-mode
    const standaloneMql = window.matchMedia?.('(display-mode: standalone)');
    const handleMqlChange = (e) => {
      if (e.matches) {
        setIsStandalone(true);
        setIsInstalled(true);
        setIsInstallable(false);
        try {
          localStorage.setItem('cal_pwa_installed', 'true');
        } catch {}
      }
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-installed-change', handleCustomInstalledChange);
    window.addEventListener('storage', handleStorageChange);
    standaloneMql?.addEventListener?.('change', handleMqlChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-installed-change', handleCustomInstalledChange);
      window.removeEventListener('storage', handleStorageChange);
      standaloneMql?.removeEventListener?.('change', handleMqlChange);
    };
  }, []);

  const promptInstall = async () => {
    // Si ya está en modo app o instalada
    if (isStandalone || isInstalled) {
      return { success: false, alreadyInstalled: true };
    }

    const prompt = deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPrompt : null);
    if (!prompt) {
      return { success: false, noPrompt: true };
    }

    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        if (typeof window !== 'undefined') {
          window.__deferredPrompt = null;
        }
        setDeferredPrompt(null);
        try {
          localStorage.setItem('cal_pwa_installed', 'true');
        } catch {}

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('pwa-installed-change', { detail: { isInstalled: true } })
          );
        }
        return { success: true, outcome: 'accepted' };
      }
      return { success: false, outcome: choice?.outcome || 'dismissed' };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    promptInstall,
    deferredPrompt,
    syncStatus,
  };
}

export default useInstallPWA;
