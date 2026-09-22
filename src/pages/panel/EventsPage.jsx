import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Filter,
  AlertTriangle,
  BookOpen,
  FileText,
} from 'lucide-react';
import { parseISO, format, getMonth, getYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useCalendar } from '../../hooks/useCalendar';
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

export default function EventsPage() {
  const { user } = useAuth();
  const { refetch: refreshCalendar } = useCalendar();
  const role = user?.role || 'profesor';
  const isAdmin = role === 'admin';
  const isTutor = role === 'tutor' || isAdmin;
  const canCreate = isTutor;
  const canEdit = isTutor;
  const canDelete = isTutor;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({ title: '', date: '', type: 'event', subject: '', description: '' });

  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchEvents = async (options = {}) => {
    try {
      if (!options.silent) setLoading(true);
      const res = await api.get('/api/admin/events');
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res?.events) ? res.events : Array.isArray(res) ? res : [];
      setEvents(data);
    } catch (err) {
      if (!options.silent) toast.error(err.message || 'Error al cargar eventos');
      setEvents([]);
    } finally {
      if (!options.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (filterType !== 'all' && (e.type || 'event') !== filterType) return false;
      if (filterMonth) {
        try {
          const d = typeof e.date === 'string' ? parseISO(e.date) : e.date;
          const [y, m] = filterMonth.split('-').map(Number);
          if (getYear(d) !== y || getMonth(d) + 1 !== m) return false;
        } catch {
          return false;
        }
      }
      if (filterSubject) {
        const sub = (e.subject || '').toLowerCase();
        if (!sub.includes(filterSubject.toLowerCase())) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const hay = `${e.title || ''} ${e.description || ''} ${e.subject || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, filterType, filterMonth, filterSubject, search]);

  const openCreate = () => {
    setEditingEvent(null);
    setForm({
      title: '',
      date: '',
      type: 'event',
      subject: user?.subject || '',
      description: '',
    });
    setModalOpen(true);
  };

  const openEdit = (ev) => {
    setEditingEvent(ev);
    setForm({
      title: ev.title || '',
      date: ev.date ? (typeof ev.date === 'string' ? ev.date.slice(0, 10) : format(ev.date, 'yyyy-MM-dd')) : '',
      type: ev.type || 'event',
      subject: ev.subject || user?.subject || '',
      description: ev.description || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEvent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) {
      toast.error('Título y fecha son obligatorios');
      return;
    }
    const payload = {
      title: form.title.trim(),
      date: form.date,
      type: form.type,
      subject: role === 'profesor' ? user?.subject || '' : form.subject.trim(),
      description: form.description.trim() || null,
    };
    try {
      if (editingEvent) {
        await api.put(`/api/admin/events/${editingEvent.id}`, payload);
        toast.success('Evento actualizado');
      } else {
        await api.post('/api/admin/events', payload);
        toast.success('Evento creado');
      }
      await fetchEvents({ silent: true });
      await refreshCalendar();
      closeModal();
    } catch (err) {
      toast.error(err.message || 'Error al guardar');
    }
  };

  const deleteEvent = async (ev) => {
    try {
      await api.del(`/api/admin/events/${ev.id}`);
      toast.success('Evento eliminado');
      setConfirmDelete(null);
      await fetchEvents({ silent: true });
      await refreshCalendar();
    } catch (err) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <HeaderRow
        onNew={openCreate}
        canCreate={canCreate}
        count={filteredEvents.length}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-4 sm:p-6"
      >
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:flex-1 md:max-w-3xl flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar título, descripción..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="py-2.5 px-4 rounded-2xl text-sm font-semibold bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="all">Todos los tipos</option>
              <option value="exam">Exámenes</option>
              <option value="holiday">Festivos</option>
              <option value="event">Eventos</option>
            </select>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="py-2.5 px-3 rounded-2xl text-sm font-semibold bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <div className="relative min-w-[160px]">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <BookOpen className="w-4 h-4" />
              </span>
              <input
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                placeholder="Asignatura"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              />
            </div>
          </div>
          {(filterType !== 'all' || filterMonth || filterSubject || search) && (
            <button
              onClick={() => {
                setFilterType('all');
                setFilterMonth('');
                setFilterSubject('');
                setSearch('');
              }}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <Spinner />
          </div>
        ) : filteredEvents.length === 0 ? (
          <EmptyState hasFilters={!!(filterType !== 'all' || filterMonth || filterSubject || search)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 sticky top-0 backdrop-blur-xl z-10">
                  <th className="text-left px-5 sm:px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Evento
                  </th>
                  <th className="text-left px-5 sm:px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Fecha
                  </th>
                  <th className="text-left px-5 sm:px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hidden sm:table-cell">
                    Asignatura
                  </th>
                  <th className="text-left px-5 sm:px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Tipo
                  </th>
                  {(canEdit || canDelete) && (
                    <th className="text-right px-5 sm:px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                <AnimatePresence initial={false}>
                  {filteredEvents.map((ev, idx) => (
                    <EventRow
                      key={ev.id || idx}
                      event={ev}
                      onEdit={canEdit ? openEdit : null}
                      onDelete={canDelete ? () => setConfirmDelete(ev) : null}
                      canEdit={canEdit}
                      canDelete={canDelete}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {modalOpen && (
          <EventModal
            isOpen={modalOpen}
            editing={!!editingEvent}
            form={form}
            setForm={setForm}
            onClose={closeModal}
            onSubmit={handleSubmit}
            role={role}
            userSubject={user?.subject || ''}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            title="¿Eliminar evento?"
            description={`Se eliminará "${confirmDelete.title || 'este evento'}" de forma permanente.`}
            icon={AlertTriangle}
            iconClass="text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400"
            confirmLabel="Eliminar"
            confirmClass="bg-rose-600 hover:bg-rose-700"
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => deleteEvent(confirmDelete)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function HeaderRow({ onNew, canCreate, count }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500 dark:text-indigo-400">
            Gestión
          </span>
          <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Eventos
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          {count} {count === 1 ? 'evento' : 'eventos'} · CRUD del calendario escolar
        </p>
      </div>
      {canCreate ? (
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-bold shadow-md shadow-indigo-500/25 transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Nuevo Evento
        </button>
      ) : (
        <button
          disabled
          title="Solo administradores y tutores pueden crear eventos"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60 text-slate-400 dark:text-slate-600 font-bold cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Nuevo Evento
        </button>
      )}
    </motion.div>
  );
}

function EventRow({ event, onEdit, onDelete, canEdit, canDelete }) {
  let dateLabel = '';
  let dateObj = null;
  try {
    dateObj = typeof event.date === 'string' ? parseISO(event.date) : event.date;
    dateLabel = format(dateObj, "d 'de' MMM, yyyy", { locale: es });
  } catch {
    dateLabel = String(event.date || '');
  }
  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
    >
      <td className="px-5 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-sm">
              {event.title || 'Sin título'}
            </p>
            {event.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px] sm:max-w-sm mt-0.5">
                {event.description}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-5 sm:px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 whitespace-nowrap">
          {dateLabel}
        </span>
      </td>
      <td className="px-5 sm:px-6 py-4 hidden sm:table-cell">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {event.subject || <span className="text-slate-400 italic">—</span>}
        </p>
      </td>
      <td className="px-5 sm:px-6 py-4">
        <TypePill type={event.type} />
      </td>
      {(canEdit || canDelete) && (
        <td className="px-5 sm:px-6 py-4">
          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={onDelete}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      )}
    </motion.tr>
  );
}

function EventModal({ isOpen, editing, form, setForm, onClose, onSubmit, role, userSubject }) {
  const isTeacher = role === 'profesor';
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
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative w-full max-w-xl rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 sm:px-7 py-5 border-b border-slate-200/60 dark:border-slate-800/60">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {editing ? 'Editar Evento' : 'Nuevo Evento'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {editing ? 'Modifica los datos del evento' : 'Rellena el formulario para crear el evento'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 sm:p-7 space-y-4 sm:space-y-5">
          <Field label="Título *">
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: Examen de Matemáticas"
              className="w-full px-4 py-3 rounded-2xl text-sm font-medium bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Fecha *">
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              />
            </Field>
            <Field label="Tipo">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl text-sm font-semibold bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              >
                <option value="event">Evento</option>
                <option value="exam">Examen</option>
                <option value="holiday">Festivo</option>
              </select>
            </Field>
          </div>
          <Field label="Asignatura">
            <input
              value={form.subject}
              disabled={isTeacher}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder={isTeacher ? 'Tu asignatura (automático)' : 'Ej: Matemáticas'}
              className="w-full px-4 py-3 rounded-2xl text-sm font-medium bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            />
          </Field>
          <Field label="Descripción">
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detalles adicionales, aula, temas..."
              className="w-full px-4 py-3 rounded-2xl text-sm font-medium bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none"
            />
          </Field>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-md shadow-indigo-500/25 transition-all active:scale-[0.98]"
            >
              {editing ? 'Guardar cambios' : 'Crear evento'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
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

function Spinner() {
  return (
    <svg
      className="animate-spin h-8 w-8 text-indigo-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function EmptyState({ hasFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center mb-4">
        <CalendarDays className="w-8 h-8 opacity-70" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1.5">
        {hasFilters ? 'Sin resultados' : 'No hay eventos'}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        {hasFilters
          ? 'Prueba a cambiar los filtros o la búsqueda.'
          : 'Los eventos del calendario aparecerán aquí. Crea el primero con el botón superior.'}
      </p>
    </div>
  );
}

function ConfirmDialog({
  title,
  description,
  icon: Icon,
  iconClass,
  confirmLabel,
  confirmClass,
  onCancel,
  onConfirm,
}) {
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
