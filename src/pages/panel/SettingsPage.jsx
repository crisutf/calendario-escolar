import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Wrench,
  Save,
  Activity,
  Database,
  KeyRound,
  Bell,
  CheckCircle2,
  XCircle,
  Shield,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useCalendar } from '../../hooks/useCalendar';
import { cn } from '../../lib/utils';

function Toggle({ checked, onChange, label, description, disabled }) {
  return (
    <label className={cn(
      'flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all',
      disabled
        ? 'bg-slate-100/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-70 cursor-not-allowed'
        : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer'
    )}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/40',
          checked
            ? 'bg-gradient-to-r from-indigo-600 to-indigo-500'
            : 'bg-slate-300 dark:bg-slate-700'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{description}</p>
        )}
      </div>
    </label>
  );
}

function InfoRow({ icon: Icon, iconClass, label, value, ok, okLabel, badLabel }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 border-b border-slate-200/60 dark:border-slate-800/60 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', iconClass)}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{label}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {typeof ok === 'boolean' ? (
          ok ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
              <CheckCircle2 className="w-3 h-3" />
              {okLabel || 'OK'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-[10px] font-black uppercase tracking-wider">
              <XCircle className="w-3 h-3" />
              {badLabel || 'Falta'}
            </span>
          )
        ) : (
          <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { refetch: refreshCalendar, maintenance: initial } = useCalendar();
  const role = user?.role || '';
  const isAdmin = role === 'admin';

  const [saving, setSaving] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [mode, setMode] = useState(!!initial?.mode);
  const [message, setMessage] = useState(initial?.message || '');
  const [systemInfo, setSystemInfo] = useState({
    bunVersion: '',
    dbSize: '',
    googleClientId: false,
    vapidPublicKey: false,
    vapidPrivateKey: false,
    environment: 'production',
  });

  useEffect(() => {
    setMode(!!initial?.mode);
    setMessage(initial?.message || '');
  }, [initial?.mode, initial?.message]);

  useEffect(() => {
    let cancelled = false;
    async function loadInfo() {
      try {
        setLoadingInfo(true);
        const info = await api.get('/api/admin/system/info').catch(() => null);
        if (cancelled) return;
        if (info) {
          const data = info.data || info;
          setSystemInfo({
            bunVersion: data.bunVersion || data.bun_version || data.runtimeVersion || 'N/A',
            dbSize: data.dbSize || data.db_size || 'N/A',
            googleClientId: !!data.googleClientId || !!data.google_client_id || !!import.meta.env.VITE_GOOGLE_CLIENT_ID,
            vapidPublicKey: !!data.vapidPublicKey || !!data.vapid_public_key,
            vapidPrivateKey: !!data.vapidPrivateKey || !!data.vapid_private_key,
            environment: data.environment || data.NODE_ENV || 'production',
          });
        } else {
          setSystemInfo((prev) => ({
            ...prev,
            googleClientId: !!import.meta.env.VITE_GOOGLE_CLIENT_ID,
          }));
        }
      } finally {
        if (!cancelled) setLoadingInfo(false);
      }
    }
    loadInfo();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveMaintenance = async () => {
    try {
      setSaving(true);
      await api.put('/api/admin/maintenance', { mode, message: mode ? message : '' });
      toast.success('Cambios guardados');
      await refreshCalendar();
    } catch (err) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
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
            Solo los administradores pueden modificar la configuración del sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
            Sistema
          </span>
          <Settings className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Configuración
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Modo mantenimiento, información del sistema y variables de entorno
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-5 sm:p-7"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Modo Mantenimiento</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Desactiva el calendario para usuarios invitados
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Toggle
              checked={mode}
              onChange={setMode}
              label={mode ? 'Mantenimiento activado' : 'Activar modo mantenimiento'}
              description="Muestra un banner en el calendario público y desactiva el acceso al panel para no administradores."
            />

            <label className="block space-y-1.5">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 pl-1">
                Mensaje para usuarios
              </span>
              <textarea
                rows={5}
                disabled={!mode}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ej: Estamos actualizando el calendario, volveremos en 5 minutos..."
                className={cn(
                  'w-full px-4 py-3 rounded-2xl text-sm font-medium border placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none',
                  mode
                    ? 'bg-slate-100/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
                    : 'bg-slate-100/40 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                )}
              />
            </label>

            <button
              onClick={saveMaintenance}
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-md shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-5 sm:p-7"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Información del sistema</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Versiones, base de datos y variables de entorno
              </p>
            </div>
          </div>

          {loadingInfo ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-11 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 animate-pulse" />
              ))}
            </div>
          ) : (
            <div>
              <InfoRow
                icon={Activity}
                iconClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                label="Runtime (Bun/Node)"
                value={systemInfo.bunVersion || 'N/A'}
              />
              <InfoRow
                icon={Database}
                iconClass="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                label="Tamaño base de datos SQLite"
                value={systemInfo.dbSize || 'N/A'}
              />
              <InfoRow
                icon={KeyRound}
                iconClass="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                label="Google OAuth Client ID"
                ok={systemInfo.googleClientId}
                okLabel="Configurado"
                badLabel="Sin configurar"
              />
              <InfoRow
                icon={Bell}
                iconClass="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                label="VAPID Push Keys"
                ok={systemInfo.vapidPublicKey && systemInfo.vapidPrivateKey}
                okLabel={systemInfo.vapidPublicKey && systemInfo.vapidPrivateKey ? 'Completas' : ''}
                badLabel={
                  !systemInfo.vapidPublicKey && !systemInfo.vapidPrivateKey
                    ? 'Sin configurar'
                    : 'Incompletas'
                }
              />
              <InfoRow
                icon={Info}
                iconClass="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                label="Entorno"
                value={systemInfo.environment}
              />
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
