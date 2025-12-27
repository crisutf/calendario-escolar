import React from 'react';
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

  const bgClasses = {
    calm: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    stress: 'bg-gradient-to-br from-red-50 to-orange-50',
    aggressive: 'bg-gradient-to-br from-orange-50 to-amber-50',
    holiday: 'bg-gradient-to-br from-emerald-50 to-teal-50',
  };

  return (
    <div className={`min-h-screen py-10 px-4 font-sans selection:bg-apple-blue selection:text-white transition-colors duration-700 ${bgClasses[theme] || bgClasses.calm} dark:bg-slate-900`}>
      <ThemeToggle />
      <div className="max-w-5xl mx-auto mb-12 text-center relative z-10">
        <div className="inline-block relative">
          <span className="
            text-sm sm:text-base font-bold tracking-[0.3em] uppercase 
            bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent 
            mb-4 block animate-slide-in
          ">
            Calendario Escolar
          </span>
          <h1 className="
            text-6xl sm:text-8xl font-extrabold tracking-tighter 
            text-slate-900 dark:text-white mb-6 
            drop-shadow-sm animate-fade-in
          " style={{ animationDelay: '0.1s' }}>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              2025/26
            </span>
          </h1>

          <div className="h-1 w-24 mx-auto bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full animate-scale-up" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
      <Calendar />
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
