import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Send,
  Trash2,
  AlertTriangle,
  Plus,
  Megaphone,
  RefreshCw,
  CalendarDays,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

function PriorityBadge({ priority }) {
  const map = {
    high: { label: 'Alta', cls: 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/30', border: 'border-l-rose-500', ring: 'ring-rose-500/30' },
    medium: { label: 'Media', cls: 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30', border: 'border-l-amber-500', ring: 'ring-amber-500/30' },
    low: { label: 'Baja', cls: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30', border: 'border-l-emerald-500', ring: 'ring-emerald-500/30' },
  };
  const cfg = map[priority] || map.low;
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', cfg.cls)}>
      {cfg.label}
    </span>
  );
}

function priorityConfig(priority) {
  const map = {
    high: { border: 'border-l-rose-500', ring: 'ring-rose-500/30' },
    medium: { border: 'border-l-amber-500', ring: 'ring-amber-500/30' },
    low: { border: 'border-l-emerald-500', ring: 'ring-emerald-500/30' },
  };
  return map[priority] || map.low;
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const role = user?.role || '';
  const isAdmin = role === 'admin' || role === 'root' || !!user?.isRoot;
  const isTutor = role === 'tutor' || isAdmin;
  const canEdit = isTutor;

  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('medium');
  const [expiresAt, setExpiresAt] = useState('');
  const [sendPush, setSendPush] = useState(false);

  const fetchAnnouncements = async (opts = {}) => {
    try {
      if (!opts.silent) setLoading(true);
      const res = await api.get('/api/announcements');
      const adminRes = isTutor ? await api.get('/api/admin/announcements').catch(() => res) : res;
      const data = Array.isArray(adminRes?.data)
        ? adminRes.data
        : Array.isArray(adminRes?.announcements)
        ? adminRes.announcements
        : Array.isArray(adminRes)
        ? adminRes
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.announcements)
        ? res.announcements
        : Array.isArray(res)
        ? res
        : [];
      setAnnouncements(
        data
          .slice()
          .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
      );
    } catch (err) {
      if (!opts.silent) toast.error(err.message || 'Error al cargar comunicados');
      setAnnouncements([]);
    } finally {
      if (!opts.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setTitle('');
    setBody('');
    setPriority('medium');
    setExpiresAt('');
    setSendPush(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Título y cuerpo son obligatorios');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        body: body.trim(),
        priority,
        expiresAt: expiresAt || null,
      };
      await api.post('/api/admin/announcements', payload);
      toast.success('Comunicado enviado');

      if (sendPush) {
        try {
          await api.post('/api/admin/push/send', {
            title: title.trim(),
            body: body.trim(),
            url: '/',
          });
          toast.success('Notificación push enviada');
        } catch (err) {
          toast.error('Comunicado creado, pero falló el push: ' + (err.message || ''));
        }
      }

      resetForm();
      await fetchAnnouncements({ silent: true });
    } catch (err) {
      toast.error(err.message || 'Error al enviar comunicado');
    } finally {
      setSubmitting(false);
    }
  };

  const resendPush = async (a) => {
    try {
      await api.post('/api/admin/push/send', {
        title: a.title || 'Comunicado',
        body: a.body || a.message || a.content || '',
        url: '/',
      });
      toast.success('Notificación push reenviada');
    } catch (err) {
      toast.error(err.message || 'Error al reenviar');
    }
  };

  const deleteAnnouncement = async (a) => {
    try {
      await api.del(`/api/admin/announcements/${a.id}`);
      toast.success('Comunicado eliminado');
      setConfirmDelete(null);
      await fetchAnnouncements({ silent: true });
    } catch (err) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  const total = announcements.length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 dark:text-emerald-400">
              Comunicación
            </span>
            <Megaphone className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Comunicados
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {total} {total === 1 ? 'comunicado' : 'comunicados'} · Publica avisos para toda la comunidad
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {canEdit ? (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-5 sm:p-7"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Nuevo comunicado</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    Publica un aviso en el tablón
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Título *">
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Reunión de padres el viernes"
                  className="w-full px-4 py-3 rounded-2xl text-sm font-medium bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                />
              </Field>

              <Field label="Cuerpo *">
                <textarea
                  required
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Describe el comunicado. Incluye detalles, fechas, instrucciones..."
                  className="w-full px-4 py-3 rounded-2xl text-sm font-medium bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Prioridad">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl text-sm font-semibold bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </Field>
                <Field label="Caduca (opcional)">
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl text-sm font-medium bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  />
                </Field>
              </div>

              <label className="flex items-center gap-3 p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={sendPush}
                  onChange={(e) => setSendPush(e.target.checked)}
                  className="w-4.5 h-4.5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500/40"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-500" />
                    Enviar notificación push a suscriptores
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    Los usuarios que hayan aceptado notificaciones la recibirán en su dispositivo.
                  </p>
                </div>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-md shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                {submitting ? 'Enviando...' : 'Enviar Comunicado'}
              </button>
            </form>
          </motion.section>
        ) : null}

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: canEdit ? 0.1 : 0.05 }}
          className={cn(
            'rounded-3xl backdrop-blur-xl border shadow-sm p-5 sm:p-7',
            !canEdit ? 'lg:col-span-2 bg-white/70 dark:bg-slate-900/70 border-slate-200/60 dark:border-slate-800/60' : 'bg-white/70 dark:bg-slate-900/70 border-slate-200/60 dark:border-slate-800/60'
          )}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Historial</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Todos los comunicados publicados
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl p-5 bg-slate-100/60 dark:bg-slate-800/40 animate-pulse border-l-4 border-slate-300 dark:border-slate-700">
                  <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700 mb-3" />
                  <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                  <div className="h-2 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1 -mr-1">
              <AnimatePresence initial={false}>
                {announcements.map((a, i) => {
                  const pCfg = priorityConfig(a.priority);
                  return (
                    <motion.article
                      key={a.id || i}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      className={cn(
                        'relative rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow border-l-4',
                        pCfg.border
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {a.title || 'Sin título'}
                          </h3>
                          <PriorityBadge priority={a.priority} />
                        </div>
                        {canEdit && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => resendPush(a)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              title="Reenviar notificación push"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(a)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                              title="Eliminar comunicado"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mb-3">
                        {a.body || a.message || a.content || ''}
                      </p>
                      <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {a.createdAt || a.created_at
                              ? format(new Date(a.createdAt || a.created_at), "d MMM yyyy · HH:mm", { locale: es })
                              : ''}
                          </span>
                          {a.expiresAt || a.expires_at ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
                              <ChevronRight className="w-3 h-3" />
                              Caduca:{' '}
                              {formatSafeDate(a.expiresAt || a.expires_at)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.section>
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            title="¿Eliminar comunicado?"
            description={`Se eliminará permanentemente: "${confirmDelete.title || 'Comunicado'}"`}
            icon={AlertTriangle}
            iconClass="text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400"
            confirmLabel="Eliminar"
            confirmClass="bg-rose-600 hover:bg-rose-700 shadow-rose-500/25"
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => deleteAnnouncement(confirmDelete)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 pl-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function formatSafeDate(str) {
  try {
    return format(new Date(str), 'd/MM/yyyy');
  } catch {
    return String(str || '');
  }
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center mb-4">
        <Bell className="w-8 h-8 opacity-70" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1.5">
        No hay comunicados
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        Crea el primer comunicado para avisar a toda la comunidad escolar.
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
