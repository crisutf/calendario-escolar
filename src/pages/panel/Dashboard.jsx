import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Users,
  Clock,
  Bell,
  Megaphone,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { addDays, startOfToday, parseISO, format, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

function StatCard({ icon: Icon, label, value, gradient, hint }) {
  return (
    <motion.div
      variants={itemVariants}
      className="group relative overflow-hidden rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-2xl"
        style={{ background: gradient }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1.5">
            {label}
          </p>
          <p className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          {hint && (
            <p className="text-xs mt-2 text-slate-500 dark:text-slate-400 font-medium">{hint}</p>
          )}
        </div>
        <div
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0"
          style={{ background: gradient }}
        >
          <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
      </div>
    </motion.div>
  );
}

function TypePill({ type }) {
  const map = {
    exam: { label: 'Examen', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
    holiday: { label: 'Festivo', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    event: { label: 'Evento', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  };
  const config = map[type] || map.event;
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', config.cls)}>
      {config.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: Clock },
    approved: { label: 'Aprobada', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: CheckCircle2 },
    rejected: { label: 'Rechazada', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', icon: XCircle },
  };
  const config = map[status] || map.pending;
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', config.cls)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || 'admin';
  const isAdmin = role === 'admin' || role === 'root' || !!user?.isRoot;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    approvedEvents: 0,
    announcementsCount: 0,
    users: 0,
    upcomingEvents: 0,
  });
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingList, setUpcomingList] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const today = startOfToday();
        const sevenDaysAhead = addDays(today, 7);

        const [eventsRes, usersRes, announcementsRes] = await Promise.all([
          api.get('/api/admin/events').catch(() => ({ data: [] })),
          isAdmin ? api.get('/api/admin/users').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          api.get('/api/announcements').catch(() => ({ data: [] })),
        ]);

        if (cancelled) return;

        const events = Array.isArray(eventsRes?.data) ? eventsRes.data : Array.isArray(eventsRes?.events) ? eventsRes.events : Array.isArray(eventsRes) ? eventsRes : [];
        const users = Array.isArray(usersRes?.data) ? usersRes.data : Array.isArray(usersRes?.users) ? usersRes.users : Array.isArray(usersRes) ? usersRes : [];
        const annData = Array.isArray(announcementsRes?.data) ? announcementsRes.data : Array.isArray(announcementsRes?.announcements) ? announcementsRes.announcements : Array.isArray(announcementsRes) ? announcementsRes : [];

        const parsedEvents = events.map((e) => ({
          ...e,
          dateObj: typeof e.date === 'string' ? parseISO(e.date) : e.date,
        }));

        const approvedEvents = parsedEvents.filter((e) => !e.status || e.status === 'approved').length;
        const upcomingEvents = parsedEvents.filter((e) => {
          const d = e.dateObj;
          return d && isAfter(d, addDays(today, -1)) && isBefore(d, sevenDaysAhead);
        });

        setStats({
          approvedEvents,
          announcementsCount: annData.length,
          users: users.length,
          upcomingEvents: upcomingEvents.length,
        });

        const sortedAnn = annData
          .slice()
          .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
          .slice(0, 5);
        setAnnouncements(sortedAnn);

        const sortedUpcoming = upcomingEvents
          .slice()
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 6);
        setUpcomingList(sortedUpcoming);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Error al cargar datos');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, user?.id, user?.email]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500 dark:text-indigo-400">
              Dashboard
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Hola, {user?.name?.split(' ')[0] || 'Usuario'} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Resumen general del calendario.
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
      >
        <StatCard
          icon={CalendarDays}
          label="Eventos aprobados"
          value={stats.approvedEvents}
          gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
          hint="En el calendario"
        />
        <StatCard
          icon={Megaphone}
          label="Comunicados"
          value={stats.announcementsCount}
          gradient="linear-gradient(135deg, #f59e0b, #f97316)"
          hint="Publicados"
        />
        <StatCard
          icon={Users}
          label="Administradores"
          value={stats.users}
          gradient="linear-gradient(135deg, #10b981, #059669)"
          hint={isAdmin ? 'Personas autorizadas' : 'Solo admin'}
        />
        <StatCard
          icon={Clock}
          label="Próximos 7 días"
          value={stats.upcomingEvents}
          gradient="linear-gradient(135deg, #f43f5e, #e11d48)"
          hint="Eventos cercanos"
        />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
      >
        <motion.div
          variants={itemVariants}
          className="rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-5 sm:p-7"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Últimos comunicados</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Anuncios del centro</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl p-4 bg-slate-100/60 dark:bg-slate-800/40 animate-pulse">
                  <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                  <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Aún no hay comunicados"
              subtitle="Los anuncios aparecerán aquí cuando se publiquen."
              colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
            />
          ) : (
            <div className="space-y-3">
              {announcements.map((a, i) => {
                const priorityCls = {
                  high: 'border-l-rose-500',
                  medium: 'border-l-amber-500',
                  low: 'border-l-emerald-500',
                }[a.priority] || 'border-l-slate-400';
                return (
                  <motion.div
                    key={a.id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'relative rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-4 border-l-4',
                      priorityCls
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {a.title || 'Sin título'}
                          </h3>
                          <PriorityBadge priority={a.priority} />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          {a.body || a.message || a.content || 'Sin contenido'}
                        </p>
                        {a.createdAt || a.created_at ? (
                          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-2">
                            {format(new Date(a.createdAt || a.created_at), "d 'de' MMM, HH:mm", { locale: es })}
                          </p>
                        ) : null}
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-5 sm:p-7"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Próximos eventos
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  En los siguientes 7 días
                </p>
              </div>
            </div>
            <Link
              to="/panel/eventos"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl p-4 bg-slate-100/60 dark:bg-slate-800/40 animate-pulse">
                  <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                  <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          ) : upcomingList.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Sin eventos próximos"
              subtitle="No hay exámenes ni festivos programados para los próximos 7 días."
              colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
            />
          ) : (
            <div className="space-y-3">
              {upcomingList.map((e, i) => (
                <motion.div
                  key={e.id || i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate flex-1">
                      {e.title || 'Sin título'}
                    </h3>
                    {e.type && <TypePill type={e.type} />}
                  </div>
                  {e.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                      {e.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                      <FileText className="w-3 h-3" />
                      {formatSafe(e.date)}
                    </span>
                    {e.subject && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {e.subject}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}



function PriorityBadge({ priority }) {
  const map = {
    urgent: { label: 'Urgente', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
    high: { label: 'Alta', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    medium: { label: 'Media', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    low: { label: 'Baja', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  };
  const cfg = map[priority] || map.low;
  return (
    <span className={cn('text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full', cfg.cls)}>
      {cfg.label}
    </span>
  );
}

function formatSafe(dateStr) {
  try {
    return format(parseISO(dateStr), 'd/MM/yyyy');
  } catch {
    return String(dateStr || '');
  }
}

function EmptyState({ icon: Icon, title, subtitle, colorClass }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-3', colorClass)}>
        <Icon className="w-7 h-7 opacity-70" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">{subtitle}</p>
    </div>
  );
}
