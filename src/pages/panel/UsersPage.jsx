import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Trash2,
  AlertTriangle,
  UserCog,
  UserPlus,
  Shield,
  GraduationCap,
  Crown,
  Save,
  KeyRound,
  Lock,
  Mail,
  Eye,
  EyeOff,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

function RoleBadge({ role }) {
  const map = {
    root: { label: 'Root (Servidor)', cls: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-500/40 font-black', icon: Crown },
    admin: { label: 'Admin', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', icon: Crown },
    tutor: { label: 'Tutor', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300', icon: Shield },
    profesor: { label: 'Profesor', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: GraduationCap },
  };
  const cfg = map[role] || map.profesor;
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', cfg.cls)}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function Avatar({ user }) {
  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';
  if (user?.picture) {
    return (
      <img
        src={user.picture}
        alt=""
        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-white/60 dark:ring-slate-700/60"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
  return (
    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
      {initials}
    </div>
  );
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const role = currentUser?.role || '';
  const isAdmin = role === 'admin' || role === 'root' || !!currentUser?.isRoot;
  const isRootCaller = role === 'root' || !!currentUser?.isRoot || currentUser?.email?.toLowerCase() === 'cristiancorban210@gmail.com';

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [pendingRole, setPendingRole] = useState({});
  const [pendingSubject, setPendingSubject] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [passwordModalUser, setPasswordModalUser] = useState(null);

  const fetchUsers = async (opts = {}) => {
    try {
      if (!opts.silent) setLoading(true);
      const res = await api.get('/api/admin/users');
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res?.users) ? res.users : Array.isArray(res) ? res : [];
      setUsers(data);
    } catch (err) {
      if (!opts.silent) toast.error(err.message || 'Error al cargar usuarios');
      setUsers([]);
    } finally {
      if (!opts.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const admin = users.filter((u) => u.role === 'admin' || u.role === 'root' || u.isRoot).length;
    const tutor = users.filter((u) => u.role === 'tutor').length;
    const profesor = users.filter((u) => u.role === 'profesor' || !u.role).length;
    return { total, admin, tutor, profesor };
  }, [users]);

  const visible = useMemo(() => {
    if (!search) return users.slice();
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        `${u.name || ''} ${u.email || ''} ${u.subject || ''} ${u.role || ''}`.toLowerCase().includes(q)
    );
  }, [users, search]);

  const queueRoleUpdate = (userId, role) => {
    setPendingRole((p) => ({ ...p, [userId]: role }));
  };

  const queueSubjectUpdate = (userId, subject) => {
    setPendingSubject((p) => ({ ...p, [userId]: subject }));
  };

  const saveRow = async (u) => {
    const newRole = pendingRole[u.id];
    const newSubject = pendingSubject[u.id];
    const body = {};
    if (newRole && newRole !== u.role) body.role = newRole;
    const effectiveSubject = newRole === 'profesor' || (!newRole && u.role === 'profesor')
      ? newSubject ?? u.subject ?? ''
      : undefined;
    if (effectiveSubject !== undefined && effectiveSubject !== (u.subject || '')) {
      body.subject = effectiveSubject;
    }
    if (!Object.keys(body).length) {
      toast.info('No hay cambios para guardar');
      return;
    }
    try {
      await api.put(`/api/admin/users/${u.id}`, body);
      toast.success('Usuario actualizado');
      setPendingRole((p) => {
        const c = { ...p };
        delete c[u.id];
        return c;
      });
      setPendingSubject((p) => {
        const c = { ...p };
        delete c[u.id];
        return c;
      });
      await fetchUsers({ silent: true });
    } catch (err) {
      toast.error(err.message || 'Error al guardar');
    }
  };

  const deleteUser = async (u) => {
    try {
      await api.del(`/api/admin/users/${u.id}`);
      toast.success('Usuario eliminado');
      setConfirmDelete(null);
      await fetchUsers({ silent: true });
    } catch (err) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center py-10">
        <div className="rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Acceso restringido</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Solo los administradores pueden gestionar usuarios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Cabecera con botón de Añadir Usuario */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-500 dark:text-rose-400">
              Administración
            </span>
            <UserCog className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Usuarios
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Gestiona roles, asignaturas, contraseñas y accesos al panel
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98] self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Añadir Usuario
        </button>
      </motion.div>

      {/* Tarjetas de Estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatMini label="Total" value={stats.total} icon={Users} gradient="linear-gradient(135deg,#6366f1,#8b5cf6)" />
        <StatMini label="Admin" value={stats.admin} icon={Crown} gradient="linear-gradient(135deg,#f43f5e,#e11d48)" />
        <StatMini label="Tutores" value={stats.tutor} icon={Shield} gradient="linear-gradient(135deg,#8b5cf6,#6366f1)" />
        <StatMini label="Profesores" value={stats.profesor} icon={GraduationCap} gradient="linear-gradient(135deg,#10b981,#059669)" />
      </motion.div>

      {/* Buscador */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-4 sm:p-6"
      >
        <div className="relative max-w-xl">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, asignatura..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />
        </div>
      </motion.div>

      {/* Tabla de Usuarios */}
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
        ) : visible.length === 0 ? (
          <EmptyState hasFilters={!!search} onAddUser={() => setShowCreateModal(true)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 sticky top-0 backdrop-blur-xl z-10">
                  <th className="text-left px-5 sm:px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Usuario
                  </th>
                  <th className="text-left px-5 sm:px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Rol
                  </th>
                  <th className="text-left px-5 sm:px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hidden sm:table-cell">
                    Asignatura
                  </th>
                  <th className="text-right px-5 sm:px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                <AnimatePresence initial={false}>
                  {visible.map((u, idx) => {
                    const isSelf = u.id === currentUser?.id || u.email === currentUser?.email;
                    const displayRole = pendingRole[u.id] ?? u.role ?? 'profesor';
                    const displaySubject = pendingSubject[u.id] ?? u.subject ?? '';
                    const hasChanges = pendingRole[u.id] !== undefined || pendingSubject[u.id] !== undefined;
                    const showSubject = displayRole === 'profesor';

                    return (
                      <motion.tr
                        key={u.id || idx}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-5 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar user={u} />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-sm">
                                {u.name || 'Sin nombre'}
                                {isSelf && (
                                  <span className="ml-2 inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 align-middle">
                                    Tú
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px] sm:max-w-sm">
                                {u.email || ''}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {u.hasPassword ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                                    <KeyRound className="w-2.5 h-2.5" />
                                    Contraseña activa
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                    Google OAuth
                                  </span>
                                )}
                                {u.createdAt && (
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden md:inline">
                                    · Alta {format(new Date(u.createdAt), 'd/MM/yy', { locale: es })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 sm:px-6 py-4">
                          {(() => {
                            const isTargetRoot = u.role === 'root' || !!u.isRoot || u.email?.toLowerCase() === 'cristiancorban210@gmail.com';
                            const isTargetAdmin = u.role === 'admin';
                            const canChangeRole = !isTargetRoot && (isRootCaller || (!isTargetAdmin && !isSelf));

                            return (
                              <div className="flex flex-col gap-2 items-start">
                                <select
                                  value={displayRole}
                                  disabled={!canChangeRole}
                                  onChange={(e) => queueRoleUpdate(u.id, e.target.value)}
                                  className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  {isTargetRoot && <option value="root">Root (Servidor)</option>}
                                  <option value="admin">Admin</option>
                                  <option value="tutor">Tutor</option>
                                  <option value="profesor">Profesor</option>
                                </select>
                                <RoleBadge role={displayRole} />
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-5 sm:px-6 py-4 hidden sm:table-cell">
                          {showSubject ? (
                            <input
                              value={displaySubject}
                              onChange={(e) => queueSubjectUpdate(u.id, e.target.value)}
                              placeholder="Ej: Matemáticas"
                              className="w-full max-w-[220px] px-3 py-2 rounded-xl text-xs font-medium bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            />
                          ) : (
                            <span className="text-xs text-slate-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-5 sm:px-6 py-4">
                          {(() => {
                            const isTargetRoot = u.role === 'root' || !!u.isRoot || u.email?.toLowerCase() === 'cristiancorban210@gmail.com';
                            const isTargetAdmin = u.role === 'admin';
                            const canChangePassword = isTargetRoot ? isSelf : (isTargetAdmin ? (isRootCaller || isSelf) : true);
                            const passwordTitle = isTargetRoot && !isSelf
                              ? 'Ningún administrador puede cambiar la contraseña del usuario root'
                              : (isTargetAdmin && !isRootCaller && !isSelf
                                ? 'Los administradores solo pueden cambiar su propia contraseña'
                                : 'Cambiar contraseña de usuario');

                            const canDelete = !isTargetRoot && !isSelf && (!isTargetAdmin || isRootCaller);
                            const deleteTitle = isTargetRoot
                              ? 'La cuenta root del servidor no puede ser eliminada'
                              : (isSelf
                                ? 'No puedes eliminarte a ti mismo'
                                : (isTargetAdmin && !isRootCaller
                                  ? 'Solo el usuario root puede eliminar a otros administradores'
                                  : 'Eliminar usuario'));

                            return (
                              <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                                {/* Cambiar contraseña */}
                                <button
                                  onClick={() => canChangePassword && setPasswordModalUser(u)}
                                  disabled={!canChangePassword}
                                  className={cn(
                                    'p-2 rounded-xl transition-colors',
                                    canChangePassword
                                      ? 'text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400'
                                      : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
                                  )}
                                  title={passwordTitle}
                                >
                                  <KeyRound className="w-4 h-4" />
                                </button>

                                {/* Guardar cambios de rol/asignatura */}
                                <button
                                  onClick={() => saveRow(u)}
                                  disabled={!hasChanges}
                                  className={cn(
                                    'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97]',
                                    hasChanges
                                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/25'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                  )}
                                  title="Guardar cambios"
                                >
                                  <Save className="w-4 h-4" />
                                  <span className="hidden sm:inline">Guardar</span>
                                </button>

                                {/* Eliminar usuario */}
                                <button
                                  onClick={() => canDelete && setConfirmDelete(u)}
                                  disabled={!canDelete}
                                  className={cn(
                                    'p-2 rounded-xl transition-colors',
                                    canDelete
                                      ? 'text-slate-500 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400'
                                      : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
                                  )}
                                  title={deleteTitle}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })()}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal para Crear Usuario */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateUserModal
            onClose={() => setShowCreateModal(false)}
            onCreated={async () => {
              setShowCreateModal(false);
              await fetchUsers({ silent: true });
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal para Modificar Contraseña de un Usuario */}
      <AnimatePresence>
        {passwordModalUser && (
          <ChangePasswordModal
            user={passwordModalUser}
            onClose={() => setPasswordModalUser(null)}
            onUpdated={async () => {
              setPasswordModalUser(null);
              await fetchUsers({ silent: true });
            }}
          />
        )}
      </AnimatePresence>

      {/* Diálogo de Confirmación de Eliminación */}
      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            title="¿Eliminar este usuario?"
            description={`Se eliminará permanentemente el usuario "${confirmDelete.name || confirmDelete.email}". Esta acción no se puede deshacer.`}
            icon={AlertTriangle}
            iconClass="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400"
            confirmLabel="Sí, eliminar"
            confirmClass="bg-rose-600 hover:bg-rose-700 shadow-rose-500/25"
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => deleteUser(confirmDelete)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Modal para Añadir Nuevo Usuario
 */
function CreateUserModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('profesor');
  const [subject, setSubject] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setShowPassword(true);
    toast.info('Contraseña aleatoria generada');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error('Nombre, email y contraseña son obligatorios');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/api/admin/users', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        subject: role === 'profesor' ? subject.trim() : null,
      });
      toast.success(`Usuario "${name}" añadido correctamente`);
      onCreated();
    } catch (err) {
      toast.error(err.message || 'Error al crear el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-lg rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-6 sm:p-8 overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Añadir Nuevo Usuario</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Podrá iniciar sesión con su correo y contraseña</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Marta Gómez García"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marta.gomez@instituto.es"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Contraseña Inicial
              </label>
              <button
                type="button"
                onClick={generatePassword}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Sparkles className="w-3 h-3" />
                Generar aleatoria
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Rol en el Centro
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'profesor', label: 'Profesor', icon: GraduationCap },
                { id: 'tutor', label: 'Tutor', icon: Shield },
                { id: 'admin', label: 'Admin', icon: Crown },
              ].map((item) => {
                const Icon = item.icon;
                const active = role === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all',
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-600 dark:text-indigo-300 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    )}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {role === 'profesor' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Asignatura / Departamento
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej: Matemáticas, Inglés, Lengua..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/**
 * Modal para Cambiar Contraseña de un Usuario existente
 */
function ChangePasswordModal({ user, onClose, onUpdated }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 4) {
      toast.error('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/api/admin/users/${user.id}`, { password });
      toast.success(`Contraseña de "${user.name || user.email}" actualizada correctamente`);
      onUpdated();
    } catch (err) {
      toast.error(err.message || 'Error al actualizar la contraseña');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-6 sm:p-7"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">Cambiar Contraseña</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
          Establece una nueva contraseña para <strong>{user.name || user.email}</strong>:
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nueva contraseña (mín 4 caracteres)"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30"
            >
              {submitting ? 'Guardando...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function StatMini({ label, value, icon: Icon, gradient }) {
  return (
    <div className="rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-4 sm:p-5 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
          {value}
        </p>
      </div>
      <div
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-white shadow-sm"
        style={{ background: gradient }}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-7 w-7 text-indigo-600 dark:text-indigo-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function EmptyState({ hasFilters, onAddUser }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center mb-4">
        <Users className="w-8 h-8 opacity-70" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1.5">
        {hasFilters ? 'Sin resultados' : 'No hay usuarios adicionales'}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">
        {hasFilters
          ? 'Prueba a cambiar los términos de búsqueda.'
          : 'Puedes añadir profesores, tutores y administradores pulsando el botón de abajo.'}
      </p>
      {!hasFilters && (
        <button
          onClick={onAddUser}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30"
        >
          <UserPlus className="w-4 h-4" />
          Añadir el primer usuario
        </button>
      )}
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
