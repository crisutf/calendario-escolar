import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  AlertTriangle,
  Search,
  FileText,
  CalendarDays,
  BookOpen,
} from 'lucide-react';
import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

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

export default function ProposalsPage() {
  const { user } = useAuth();
  const role = user?.role || 'profesor';
  const isAdmin = role === 'admin';
  const isTutor = role === 'tutor' || isAdmin;

  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmApprove, setConfirmApprove] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);

  const fetchProposals = async (opts = {}) => {
    try {
      if (!opts.silent) setLoading(true);
      const res = await api.get('/api/admin/proposals');
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res?.proposals) ? res.proposals : Array.isArray(res) ? res : [];
      setProposals(data);
    } catch (err) {
      if (!opts.silent) toast.error(err.message || 'Error al cargar propuestas');
      setProposals([]);
    } finally {
      if (!opts.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const visible = useMemo(() => {
    let list = proposals.slice();
    if (!isTutor) {
      list = list.filter(
        (p) => p.userId === user?.id || p.user_id === user?.id || p.email === user?.email
      );
      list = list.filter((p) => p.status !== 'rejected');
    } else if (statusFilter !== 'all') {
      list = list.filter((p) => (p.status || 'pending') === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          `${p.title || ''} ${p.description || ''} ${p.subject || ''} ${p.userName || p.user_name || ''} ${p.email || ''}`
            .toLowerCase()
            .includes(q)
      );
    }
    return list.sort(
      (a, b) =>
        new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0)
    );
  }, [proposals, search, statusFilter, isTutor, user?.id, user?.email]);

  const pendingCount = proposals.filter((p) => (p.status || 'pending') === 'pending').length;

  const approve = async (p) => {
    try {
      await api.put(`/api/admin/proposals/${p.id}/approve`);
      toast.success('Propuesta aprobada');
      setConfirmApprove(null);
      await fetchProposals({ silent: true });
    } catch (err) {
      toast.error(err.message || 'Error al aprobar');
    }
  };

  const reject = async (p) => {
    try {
      await api.del(`/api/admin/proposals/${p.id}`);
      toast.success('Propuesta rechazada');
      setConfirmReject(null);
      await fetchProposals({ silent: true });
    } catch (err) {
      toast.error(err.message || 'Error al rechazar');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <HeaderRow isTutor={isTutor} pendingCount={pendingCount} count={visible.length} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-4 sm:p-6"
      >
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:flex-1 md:max-w-3xl flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isTutor ? 'Buscar propuesta, autor, asignatura...' : 'Buscar mis propuestas...'}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              />
            </div>
            {isTutor && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2.5 px-4 rounded-2xl text-sm font-semibold bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobadas</option>
                <option value="rejected">Rechazadas</option>
              </select>
            )}
          </div>
          {(search || (isTutor && statusFilter !== 'all')) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
              }}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className={cn(
          'rounded-3xl backdrop-blur-xl border shadow-sm overflow-hidden',
          isTutor
            ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/60 dark:border-amber-900/40'
            : 'bg-white/70 dark:bg-slate-900/70 border-slate-200/60 dark:border-slate-800/60'
        )}
      >
        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <Spinner />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState isTutor={isTutor} hasFilters={!!(search || (isTutor && statusFilter !== 'all'))} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/50 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 backdrop-blur-xl z-10">
                  <th className="text-left px-5 sm:px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Propuesta
                  </th>
                  <th className="text-left px-5 sm:px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hidden md:table-cell">
                    Fecha propuesta
                  </th>
                  <th className="text-left px-5 sm:px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                    Asignatura
                  </th>
                  {isTutor && (
                    <th className="text-left px-5 sm:px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                      Autor
                    </th>
                  )}
                  <th className="text-left px-5 sm:px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Estado
                  </th>
                  {isTutor && (
                    <th className="text-right px-5 sm:px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200/30 dark:divide-amber-900/30">
                <AnimatePresence initial={false}>
                  {visible.map((p, idx) => (
                    <ProposalRow
                      key={p.id || idx}
                      proposal={p}
                      isTutor={isTutor}
                      onApprove={isTutor ? () => setConfirmApprove(p) : null}
                      onReject={isTutor ? () => setConfirmReject(p) : null}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {confirmApprove && (
          <ConfirmDialog
            title="¿Aprobar propuesta?"
            description={`Se convertirá en evento del calendario: "${confirmApprove.title || 'Propuesta'}"`}
            icon={CheckCircle2}
            iconClass="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
            confirmLabel="Aprobar"
            confirmClass="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25"
            onCancel={() => setConfirmApprove(null)}
            onConfirm={() => approve(confirmApprove)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmReject && (
          <ConfirmDialog
            title="¿Rechazar propuesta?"
            description={`Se eliminará: "${confirmReject.title || 'Propuesta'}"`}
            icon={AlertTriangle}
            iconClass="text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400"
            confirmLabel="Rechazar"
            confirmClass="bg-rose-600 hover:bg-rose-700 shadow-rose-500/25"
            onCancel={() => setConfirmReject(null)}
            onConfirm={() => reject(confirmReject)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function HeaderRow({ isTutor, pendingCount, count }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={cn(
            'text-[10px] font-black uppercase tracking-[0.25em]',
            isTutor ? 'text-amber-500 dark:text-amber-400' : 'text-indigo-500 dark:text-indigo-400'
          )}>
            {isTutor ? 'Revisión' : 'Mis envíos'}
          </span>
          {isTutor ? <Inbox className="w-3.5 h-3.5 text-amber-500" /> : <Send className="w-3.5 h-3.5 text-indigo-500" />}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          {isTutor ? 'Propuestas Pendientes' : 'Mis propuestas enviadas'}
          {isTutor && pendingCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2.5 rounded-full text-xs font-black bg-amber-500 text-white">
              {pendingCount}
            </span>
          )}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          {count} {count === 1 ? 'propuesta' : 'propuestas'} ·{' '}
          {isTutor ? 'Aprobar o rechazar eventos propuestos por profesores' : 'Estado de tus propuestas'}
        </p>
      </div>
    </motion.div>
  );
}

function ProposalRow({ proposal, isTutor, onApprove, onReject }) {
  let dateLabel = '';
  try {
    const d = typeof proposal.date === 'string' ? parseISO(proposal.date) : proposal.date;
    dateLabel = format(d, 'd/MM/yyyy');
  } catch {
    dateLabel = String(proposal.date || '');
  }
  const authorName = proposal.userName || proposal.user_name || proposal.authorName || proposal.email || '';

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 80, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className={cn(
        'group transition-colors',
        isTutor ? 'hover:bg-white/70 dark:hover:bg-slate-900/40' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
      )}
    >
      <td className="px-5 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0',
            isTutor
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
              : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
          )}>
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-sm">
              {proposal.title || proposal.subject || 'Sin título'}
            </p>
            {proposal.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px] sm:max-w-sm mt-0.5">
                {proposal.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {proposal.type && <TypePill type={proposal.type} />}
              {dateLabel && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/60 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <CalendarDays className="w-3 h-3" />
                  {dateLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-5 sm:px-6 py-4 hidden md:table-cell">
        {proposal.createdAt || proposal.created_at ? (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
            {format(new Date(proposal.createdAt || proposal.created_at), "d MMM '·' HH:mm", { locale: es })}
          </span>
        ) : null}
      </td>
      <td className="px-5 sm:px-6 py-4 hidden sm:table-cell">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          {proposal.subject ? (
            <>
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              {proposal.subject}
            </>
          ) : (
            <span className="text-slate-400 italic">—</span>
          )}
        </p>
      </td>
      {isTutor && (
        <td className="px-5 sm:px-6 py-4 hidden lg:table-cell">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
            {authorName || <span className="text-slate-400 italic">Desconocido</span>}
          </p>
        </td>
      )}
      <td className="px-5 sm:px-6 py-4">
        <StatusBadge status={proposal.status || 'pending'} />
      </td>
      {isTutor && (
        <td className="px-5 sm:px-6 py-4">
          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            {onApprove && (proposal.status || 'pending') === 'pending' && (
              <button
                onClick={onApprove}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/25 transition-all active:scale-[0.97]"
                title="Aprobar"
              >
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Aprobar</span>
              </button>
            )}
            {onReject && (proposal.status || 'pending') === 'pending' && (
              <button
                onClick={onReject}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/25 transition-all active:scale-[0.97]"
                title="Rechazar"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Rechazar</span>
              </button>
            )}
          </div>
        </td>
      )}
    </motion.tr>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-8 w-8 text-amber-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function EmptyState({ isTutor, hasFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className={cn(
        'w-16 h-16 rounded-3xl flex items-center justify-center mb-4',
        isTutor
          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500'
          : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500'
      )}>
        {isTutor ? <Inbox className="w-8 h-8 opacity-70" /> : <Send className="w-8 h-8 opacity-70" />}
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1.5">
        {hasFilters ? 'Sin resultados' : isTutor ? 'No hay propuestas pendientes' : 'No hay propuestas enviadas'}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        {hasFilters
          ? 'Prueba a cambiar los filtros o la búsqueda.'
          : isTutor
            ? 'Cuando los profesores envíen eventos aparecerán aquí para su revisión.'
            : 'Envía propuestas de eventos para que el tutor las apruebe.'}
      </p>
    </div>
  );
}

function ConfirmDialog({ title, description, icon: Icon, iconClass, confirmLabel, confirmClass, onCancel, onConfirm }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-md rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xl p-6 sm:p-7"
      >
        <div className="flex items-start gap-4 mb-5">
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0', iconClass)}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 pt-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5">{description}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'px-5 py-2.5 rounded-2xl text-sm font-bold text-white shadow-md transition-all active:scale-[0.98]',
              confirmClass || 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
            )}
          >
            {confirmLabel || 'Confirmar'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
