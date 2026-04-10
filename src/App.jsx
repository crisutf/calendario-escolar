import React from 'react';
import { motion } from 'framer-motion';
import { CalendarProvider } from './context/CalendarProvider';
import { Calendar } from './components/Calendar';
import { useCalendar } from './hooks/useCalendar';
import { useThemeMode } from './hooks/useThemeMode';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-50 glass rounded-full p-1 flex items-center gap-1 shadow-lg border border-white/40 dark:border-white/10 dark:bg-slate-900/50">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-white text-yellow-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        title="Modo Claro"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-slate-700 text-purple-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        title="Modo Oscuro"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-full transition-all ${theme === 'system' ? 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        title="Sistema"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}

function Layout() {
  const { currentDate, events } = useCalendar();
  const theme = useThemeMode(currentDate, events);

  return (
    <div className={`min-h-screen py-6 sm:py-12 px-4 font-sans selection:bg-slate-900 selection:text-white transition-colors duration-500 bg-slate-50 dark:bg-slate-950`}>
      <ThemeToggle />
      
      <div className="max-w-7xl mx-auto mb-8 sm:mb-16 text-left relative z-10 px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="h-px w-8 bg-slate-400 dark:bg-slate-600" />
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-slate-500 dark:text-slate-400">
                Hecho por Crisutf
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-7xl font-black tracking-tight text-slate-900 dark:text-white"
            >
              Calendario <span className="text-slate-400 dark:text-slate-500 font-light">Digital</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Periodo Lectivo</p>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-200">2025 — 2026</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900">
              <Monitor className="w-5 h-5" />
            </div>
          </motion.div>
        </div>
      </div>

      <Calendar />
      
      <footer className="max-w-7xl mx-auto mt-16 pb-8 px-4 text-center text-slate-400 dark:text-slate-600 text-[10px] font-bold tracking-[0.4em] uppercase border-t border-slate-200 dark:border-slate-800 pt-8">
        <div>Calendario Digital hecho por Crisutf</div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <CalendarProvider>
        <Layout />
      </CalendarProvider>
    </ThemeProvider>
  );
}

export default App;
