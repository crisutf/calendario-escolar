import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from './components/Calendar';
import { useCalendar } from './hooks/useCalendar';
import { useThemeMode } from './hooks/useThemeMode';
import { useTheme } from './context/ThemeContext';
import { useMaintenance } from './hooks/useMaintenance';
import { useAnnouncements } from './hooks/useAnnouncements';
import { Link } from 'react-router-dom';
import {
  Sun,
  Moon,
  Monitor,
  Wrench,
  X,
  Megaphone,
  AlertTriangle,
  Bell,
  Flame,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  InstallFloatingButton,
  InstallHeroBanner,
} from './components/InstallAppPrompt';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed top-3 sm:top-4 right-3 sm:right-4 z-50 glass rounded-full p-0.5 sm:p-1 flex items-center gap-0.5 sm:gap-1 shadow-lg border border-white/40 dark:border-white/10 dark:bg-slate-900/50">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 sm:p-2 rounded-full transition-all ${theme === 'light' ? 'bg-white text-yellow-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        title="Modo Claro"
      >
        <Sun className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 sm:p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-slate-700 text-purple-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        title="Modo Oscuro"
      >
        <Moon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 sm:p-2 rounded-full transition-all ${theme === 'system' ? 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        title="Sistema"
      >
        <Monitor className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
      </button>
    </div>
  );
}

function MaintenanceBanner() {
  const maintenance = useMaintenance();
  const [dismissed, setDismissed] = React.useState(false);
  if (!maintenance?.mode || dismissed) return null;
  const message =
    maintenance.message?.trim() ||
    'El calendario se encuentra en mantenimiento temporal. Algunas funciones pueden estar limitadas.';

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 w-full mx-auto max-w-7xl px-4 pt-4 pb-2"
    >
      <div className="relative rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-xl shadow-orange-500/20 dark:shadow-orange-500/10 overflow-hidden border border-orange-400/40">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_0%,#fff_0%,transparent_50%)]" />
        <div className="relative flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-4">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Wrench className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-xs sm:text-sm font-black uppercase tracking-widest opacity-90">
                Modo Mantenimiento Activo
              </p>
            </div>
            <p className="text-sm sm:text-base font-semibold leading-relaxed">{message}</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            title="Cerrar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function priorityConfig(priority) {
  switch (priority) {
    case 'urgent':
      return {
        icon: <Flame className="w-4 h-4" />,
        label: 'Urgente',
        pill: 'bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/30 ring-red-500/20',
        border: 'border-l-red-500',
        hover: 'hover:border-red-400/50',
      };
    case 'high':
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        label: 'Importante',
        pill: 'bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-500/30 ring-orange-500/20',
        border: 'border-l-orange-500',
        hover: 'hover:border-orange-400/50',
      };
    case 'low':
      return {
        icon: <Bell className="w-4 h-4" />,
        label: 'Información',
        pill: 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30 ring-sky-500/20',
        border: 'border-l-sky-400',
        hover: 'hover:border-sky-400/50',
      };
    default:
      return {
        icon: <Megaphone className="w-4 h-4" />,
        label: 'Comunicado',
        pill: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 ring-emerald-500/20',
        border: 'border-l-emerald-500',
        hover: 'hover:border-emerald-400/50',
      };
  }
}

function AnnouncementsSection() {
  const announcements = useAnnouncements();
  if (!Array.isArray(announcements) || announcements.length === 0) return null;

  const visible = announcements.slice(0, 5);

  return (
    <section className="max-w-7xl mx-auto px-4 mb-12 sm:mb-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex items-center gap-3 mb-5"
      >
        <div className="h-px w-8 bg-slate-400 dark:bg-slate-600" />
        <span className="text-[10px] sm:text-xs font-black tracking-[0.3em] uppercase text-slate-500 dark:text-slate-400">
          Comunicados
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
          {announcements.length}
        </span>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <AnimatePresence mode="popLayout">
          {visible.map((a, i) => {
            const cfg = priorityConfig(a.priority);
            const created = a.createdAt ? parseISO(a.createdAt) : null;
            const expires = a.expiresAt ? parseISO(a.expiresAt) : null;
            return (
              <motion.article
                key={a.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className={`group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 ${cfg.border} ${cfg.hover} p-4 sm:p-5 shadow-sm hover:shadow-md transition-all overflow-hidden`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ring-2 ring-opacity-30 ${cfg.pill}`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </span>
                    {created && (
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                        {format(created, "d MMM · HH:mm", { locale: es })}
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg mb-1.5 leading-snug">
                  {a.title}
                </h3>
                {a.body && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-3">
                    {a.body}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between gap-2">
                  {expires && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isFuture(expires)
                      ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      : 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300 line-through'
                      }`}>
                      ⏳ Vence: {format(expires, "d MMM yyyy", { locale: es })}
                    </span>
                  )}
                  {a.url && (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                    >
                      Abrir enlace <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}

export function Layout() {
  const { currentDate, events } = useCalendar();
  const theme = useThemeMode(currentDate, events);

  return (
    <div className={`min-h-screen pt-16 sm:pt-10 pb-10 px-0 sm:px-4 font-sans selection:bg-slate-900 selection:text-white transition-colors duration-500 bg-slate-50 dark:bg-slate-950`}>
      {/* Botones flotantes superiores: Panel de Control e Instalar App */}
      <div className="fixed top-3 sm:top-4 left-3 sm:left-4 z-50 flex items-center gap-1.5 sm:gap-2">
        <Link
          to="/panel"
          className="glass rounded-full px-2.5 sm:px-3.5 py-1.5 flex items-center gap-1.5 sm:gap-2 shadow-lg border border-white/40 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:scale-105 active:scale-95"
          title="Acceder al Panel de Control"
        >
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden xs:inline sm:inline">Panel</span>
        </Link>
        <InstallFloatingButton />
      </div>

      <ThemeToggle />
      <MaintenanceBanner />

      <div className="max-w-7xl mx-auto mb-8 sm:mb-14 text-left relative z-10 px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="h-px w-8 bg-slate-400 dark:bg-slate-600" />
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-slate-500 dark:text-slate-400">
                Curso Académico
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white"
            >
              Calendario <span className="text-slate-400 dark:text-slate-500 font-light">Digital</span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-full sm:w-auto"
          >
            <div className="text-right flex-1 sm:flex-none">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Período Lectivo</p>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-200">2026 — 2027</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shrink-0">
              <Monitor className="w-5 h-5" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Banner destacado para instalar la aplicación en el inicio */}
      <InstallHeroBanner />

      <AnnouncementsSection />

      <div className="px-4">
        <Calendar />
      </div>

      <footer className="max-w-7xl mx-auto mt-16 pb-8 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 dark:text-slate-600 text-[10px] font-bold tracking-[0.3em] uppercase border-t border-slate-200 dark:border-slate-800 pt-8">
        <div>Crisutf · Calendario Escolar</div>
      </footer>
    </div>
  );
}

function App() {
  return <Layout />;
}

export default App;
