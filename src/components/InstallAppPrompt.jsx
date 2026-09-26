import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone, CheckCircle2, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useInstallPWA } from '../hooks/useInstallPWA';

export function InstallFloatingButton() {
  const installPWA = useInstallPWA();

  // Si ya está instalada, en modo app standalone o no es instalable, no mostrar nada
  if (installPWA.isStandalone || installPWA.isInstalled || !installPWA.isInstallable) {
    return null;
  }

  const handleClick = async () => {
    const res = await installPWA.promptInstall();
    if (res?.success) {
      toast.success('¡Instalación completada con éxito!');
    } else if (res?.alreadyInstalled) {
      toast.success('¡La aplicación ya está instalada en tu dispositivo!');
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="glass rounded-full px-2.5 sm:px-3.5 py-1.5 flex items-center gap-1.5 sm:gap-2 shadow-lg border border-cyan-400/40 dark:border-cyan-400/30 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-bold hover:shadow-cyan-500/25 transition-all cursor-pointer whitespace-nowrap active:scale-95"
      title="Instalar la aplicación en tu dispositivo"
    >
      <Download className="w-3.5 h-3.5 animate-bounce shrink-0" />
      <span>Instalar<span className="hidden sm:inline"> App</span></span>
    </motion.button>
  );
}

export function InstallHeroBanner() {
  const installPWA = useInstallPWA();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem('cal_pwa_banner_dismissed') === 'true';
      setDismissed(isDismissed);
    } catch {
      /* ignore */
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem('cal_pwa_banner_dismissed', 'true');
    } catch {
      /* ignore */
    }
  };

  const handleClick = async () => {
    const res = await installPWA.promptInstall();
    if (res?.success) {
      toast.success('¡Instalación completada con éxito!');
    } else if (res?.alreadyInstalled) {
      toast.success('¡La aplicación ya está instalada en tu dispositivo!');
    }
  };

  // Si estamos en la app instalada (standalone), si ya está instalada en el sistema,
  // si no es instalable o si el usuario cerró el banner, no renderizar nada
  if (installPWA.isStandalone || installPWA.isInstalled || !installPWA.isInstallable || dismissed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="max-w-7xl mx-auto px-4 mb-6 sm:mb-12"
    >
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 dark:from-cyan-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-cyan-500/20 dark:border-cyan-400/20 p-4 sm:p-6 backdrop-blur-xl shadow-lg">
        {/* Luces de fondo */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 shrink-0">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
                  Acceso directo
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
                  <Sparkles className="w-3 h-3" /> Gratis
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                Instala la app del Calendario Escolar
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Añade el calendario a la pantalla de inicio de tu móvil o escritorio para abrirlo al instante, sin navegador y con soporte sin conexión.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0 justify-between sm:justify-start shrink-0">
            <button
              onClick={handleClick}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white shadow-md shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Instalar ahora</span>
            </button>
            <button
              onClick={handleDismiss}
              className="shrink-0 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function InstallModal() {
  return null;
}

export default {
  InstallFloatingButton,
  InstallHeroBanner,
  InstallModal,
};
