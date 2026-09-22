import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Home,
  CalendarDays,
  Inbox,
  Bell,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  LogIn,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

function Badge({ count, className }) {
  if (!count || count <= 0) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold',
        className || 'bg-amber-500 text-white'
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

function SidebarContent({ onClose, pendingCount }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'profesor';
  const isAdmin = role === 'admin' || role === 'root' || !!user?.isRoot;
  const isTutor = role === 'tutor' || isAdmin;

  const navItems = [
    { path: '/panel', icon: Home, label: 'Panel', end: true, show: true },
    { path: '/panel/eventos', icon: CalendarDays, label: 'Eventos', show: true },
    {
      path: '/panel/propuestas',
      icon: Inbox,
      label: 'Propuestas',
      show: true,
      badge: isTutor ? pendingCount : null,
      badgeClass: 'bg-amber-500 text-white',
    },
    { path: '/panel/comunicados', icon: Bell, label: 'Comunicados', show: true },
    { path: '/panel/usuarios', icon: Users, label: 'Usuarios', show: isAdmin },
    { path: '/panel/configuracion', icon: Settings, label: 'Configuración', show: isAdmin },
  ];

  const visibleNavItems = navItems.filter((item) => item.show);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Error al cerrar sesión');
    }
  };

  const userInitials =
    user?.name
      ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
      : 'U';

  const roleLabel = {
    admin: 'Administrador',
    tutor: 'Tutor',
    profesor: 'Profesor',
  }[role] || role;

  const roleClass = {
    admin: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    tutor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    profesor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  }[role];

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-500 dark:text-indigo-400">
              Calendario
            </p>
            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              Panel Admin
            </h2>
          </div>
        </motion.div>
      </div>

      <nav className="flex-1 px-4 sm:px-5 overflow-y-auto pb-4">
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.06, delayChildren: 0.05 },
            },
          }}
          className="space-y-1.5"
        >
          {visibleNavItems.map((item) => (
            <motion.li
              key={item.path}
              variants={{
                hidden: { opacity: 0, x: -14 },
                show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
              }}
            >
              <NavLink
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        'w-5 h-5 flex-shrink-0 transition-colors',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      )}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge ? (
                      <Badge count={item.badge} className={item.badgeClass} />
                    ) : null}
                    <ChevronRight
                      className={cn(
                        'w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200',
                        isActive ? 'text-white/80 opacity-100 translate-x-0' : 'text-slate-400'
                      )}
                    />
                  </>
                )}
              </NavLink>
            </motion.li>
          ))}
        </motion.ul>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="p-4 sm:p-5 border-t border-slate-200/60 dark:border-slate-800/60"
      >
        <div className="rounded-2xl p-3 bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative flex-shrink-0">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'avatar'}
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-white/60 dark:ring-slate-700/60"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                  {userInitials}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-0">
            <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', roleClass)}>
              {roleLabel}
            </span>
            <button
              onClick={handleLogout}
              className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700/50 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PanelLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { user } = useAuth();
  const role = user?.role || 'profesor';
  const isTutor = role === 'tutor' || role === 'admin' || role === 'root' || !!user?.isRoot;

  useEffect(() => {
    if (!isTutor) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/api/admin/proposals');
        if (cancelled) return;
        const data = res?.data || res?.proposals || res || [];
        const pending = Array.isArray(data) ? data.filter((p) => p.status === 'pending' || !p.status).length : 0;
        setPendingCount(pending);
      } catch {
        if (!cancelled) setPendingCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isTutor]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 xl:w-72 z-30 z-40">
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60" />
        <div className="relative flex-1 flex flex-col">
          <SidebarContent pendingCount={pendingCount} />
        </div>
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 lg:hidden bg-slate-950/50 backdrop-blur-sm"
            />
            <motion.aside
              key="sidebar-mobile"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden w-[85%] max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-r border-slate-200/60 dark:border-slate-800/60 shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
                  Menú
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent onClose={() => setSidebarOpen(false)} pendingCount={pendingCount} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64 xl:pl-72">
        <header className="sticky top-0 z-30">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <input
                    type="search"
                    placeholder="Buscar..."
                    className="w-full pl-10 pr-4 py-2 rounded-2xl text-sm font-medium bg-slate-100/60 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                <TopbarUserMenu />
              </div>
            </div>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto p-4 sm:p-8 min-h-screen">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function TopbarUserMenu() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const ref = React.useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
      toast.success('Sesión cerrada');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Error al cerrar sesión');
    }
  };

  const userInitials =
    user?.name
      ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
      : 'U';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 p-1 pr-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {user?.picture ? (
          <img
            src={user.picture}
            alt=""
            className="w-9 h-9 rounded-xl object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
            {userInitials}
          </div>
        )}
        <span className="hidden sm:inline text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
          {user?.name?.split(' ')[0]}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-xl backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-200/60 dark:border-slate-800/60">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email || ''}
              </p>
            </div>
            <div className="p-1.5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                <LogIn className="w-4 h-4 rotate-180" />
                Cerrar sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
