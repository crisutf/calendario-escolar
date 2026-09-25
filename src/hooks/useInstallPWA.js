import { useState, useEffect } from 'react';

export function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(
    typeof window !== 'undefined' ? window.__deferredPrompt || null : null
  );
  const [isInstallable, setIsInstallable] = useState(
    typeof window !== 'undefined' ? !!window.__deferredPrompt : false
  );
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(!!standalone);

    if (window.__deferredPrompt) {
      setDeferredPrompt(window.__deferredPrompt);
      setIsInstallable(true);
    }

    const handler = (e) => {
      e.preventDefault();
      window.__deferredPrompt = e;
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const promptReadyHandler = () => {
      if (window.__deferredPrompt) {
        setDeferredPrompt(window.__deferredPrompt);
        setIsInstallable(true);
      }
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      window.__deferredPrompt = null;
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('pwa-prompt-ready', promptReadyHandler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('pwa-prompt-ready', promptReadyHandler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const promptInstall = async () => {
    const prompt = deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPrompt : null);
    if (!prompt) return false;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        if (typeof window !== 'undefined') window.__deferredPrompt = null;
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return { isInstallable, isInstalled, promptInstall, deferredPrompt };
}

export default useInstallPWA;
