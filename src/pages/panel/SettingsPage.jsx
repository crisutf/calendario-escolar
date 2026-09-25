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
  Download,
  Smartphone,
  RefreshCw,
  Send,
  FileText,
  Server,
  Terminal as TerminalIcon,
  Clock,
  Cpu,
  HardDrive,
  PlugZap,
  Power,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useCalendar } from '../../hooks/useCalendar';
import { cn } from '../../lib/utils';
import { useInstallPWA } from '../../hooks/useInstallPWA';

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

function InfoRow({ icon: Icon, iconClass, label, value, ok, okLabel, badLabel, onClick, actionLabel }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 border-b border-slate-200/60 dark:border-slate-800/60 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', iconClass)}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{label}</p>
          {typeof ok !== 'boolean' && value && typeof value !== 'string' ? (
            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate">{value.hint || ''}</p>
          ) : null}
        </div>
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
          <p className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate max-w-[180px]">
            {typeof value === 'string' ? value : value?.text || 'N/A'}
          </p>
        )}
        {onClick && (
          <button
            onClick={onClick}
            className="ml-1 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            {actionLabel || 'Refrescar'}
          </button>
        )}
      </div>
    </div>
  );
}

function formatUptime(seconds) {
  if (!seconds || seconds < 0) return '0s';
  const s = Math.floor(seconds);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (mins > 0 || hours > 0 || days > 0) parts.push(`${mins}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
}

function formatBytes(bytes) {
  if (bytes == null || isNaN(bytes)) return 'N/A';
  const b = Number(bytes);
  if (b === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  const val = b / Math.pow(1024, Math.min(i, units.length - 1));
  return `${val.toFixed(val < 10 && i > 0 ? 2 : 1)} ${units[i]}`;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { refetch: refreshCalendar, maintenance: initial } = useCalendar();
  const role = user?.role || '';
  const isAdmin = role === 'admin' || role === 'root' || !!user?.isRoot;
  const isRoot = role === 'root' || !!user?.isRoot || user?.email?.toLowerCase() === 'cristiancorban210@gmail.com';

  const [saving, setSaving] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [mode, setMode] = useState(!!initial?.mode);
  const [message, setMessage] = useState(initial?.message || '');
  const [systemInfo, setSystemInfo] = useState({
    bunVersion: '',
    dbSize: '',
    dbEngine: 'JSON Flat File',
    googleClientId: false,
    vapidPublicKey: false,
    vapidPrivateKey: false,
    environment: 'production',
    platform: '',
    arch: '',
    uptimeSeconds: 0,
    port: 0,
    processId: null,
    runtime: 'Bun',
    counts: null,
    storage: { files: [] },
  });

  const installPWA = useInstallPWA();

  useEffect(() => {
    setMode(!!initial?.mode);
    setMessage(initial?.message || '');
  }, [initial?.mode, initial?.message]);

  const loadSystemInfo = async () => {
    try {
      setLoadingInfo(true);
      const info = await api.get('/api/admin/system/info').catch(() => null);
      if (info) {
        const data = info.data || info;
        setSystemInfo({
          bunVersion: data.bunVersion || data.bun_version || data.runtimeVersion || 'N/A',
          dbSize: data.dbSize || data.db_size || data.storage?.totalSize || data.database?.size || 'N/A',
          dbEngine: data.dbEngine || data.storage?.engine || data.database?.engine || 'JSON Flat File',
          googleClientId: !!data.googleClientId || !!data.google_client_id || !!data.google?.clientId || !!import.meta.env.VITE_GOOGLE_CLIENT_ID,
          environment: data.environment || data.nodeEnv || data.NODE_ENV || 'production',
          platform: data.platform || '',
          arch: data.arch || '',
          uptimeSeconds: Number(data.uptimeSeconds || 0),
          port: Number(data.port || 0),
          processId: data.processId || null,
          runtime: data.runtime || (typeof Bun !== 'undefined' ? 'Bun' : 'Node'),
          counts: data.counts || null,
          storage: {
            totalSize: data.storage?.totalSize || data.dbSize || 0,
            engine: data.storage?.engine || data.dbEngine || 'JSON Flat File',
            files: Array.isArray(data.storage?.files) ? data.storage.files : [],
            path: data.storage?.path || './data',
          },
        });
      } else {
        setSystemInfo((prev) => ({
          ...prev,
          googleClientId: !!import.meta.env.VITE_GOOGLE_CLIENT_ID,
        }));
      }
    } finally {
      setLoadingInfo(false);
    }
  };

  useEffect(() => {
    loadSystemInfo();
  }, []);

  useEffect(() => {
    if (!systemInfo.uptimeSeconds) return;
    const iv = setInterval(() => {
      setSystemInfo((s) => ({ ...s, uptimeSeconds: (s.uptimeSeconds || 0) + 1 }));
    }, 1000);
    return () => clearInterval(iv);
  }, [systemInfo.uptimeSeconds > 0]);

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

  const handleInstallClick = async () => {
    const ok = await installPWA.promptInstall();
    if (ok) toast.success('Instalación iniciada');
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
          Modo mantenimiento, información del sistema, instalación PWA y notificaciones
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
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Información del sistema</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Versiones, almacenamiento y variables de entorno
                </p>
              </div>
            </div>
            <button
              onClick={loadSystemInfo}
              disabled={loadingInfo}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Refrescar info"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', loadingInfo && 'animate-spin')} />
            </button>
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
                icon={Cpu}
                iconClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                label="Runtime"
                value={{ text: systemInfo.bunVersion || 'N/A', hint: systemInfo.runtime }}
              />
              <InfoRow
                icon={Database}
                iconClass="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                label="Tamaño almacenamiento JSON"
                value={{ text: systemInfo.dbSize, hint: systemInfo.storage?.engine }}
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
                icon={Info}
                iconClass="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                label="Entorno"
                value={systemInfo.environment}
              />
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl bg-slate-950/95 dark:bg-slate-950 border border-slate-800/80 shadow-sm p-5 sm:p-7 overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 opacity-60" />
          <div className="flex items-center justify-between mb-5 relative">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700/70 text-emerald-400 flex items-center justify-center">
                <TerminalIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Terminal / Estado Servidor</h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Runtime, recursos y archivos de almacenamiento
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Online
            </span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <TerminalBadge icon={Clock} label="Uptime" value={formatUptime(systemInfo.uptimeSeconds)} accent="emerald" />
              <TerminalBadge icon={Server} label="Plataforma" value={`${systemInfo.platform || '-'} / ${systemInfo.arch || '-'}`} accent="cyan" />
              <TerminalBadge icon={PlugZap} label="Puerto / PID" value={`${systemInfo.port || '9234'}${systemInfo.processId ? ` / ${systemInfo.processId}` : ''}`} accent="violet" />
              <TerminalBadge icon={Power} label="Runtime" value={`${systemInfo.runtime} ${systemInfo.bunVersion || ''}`.trim() || '-'} accent="rose" />
            </div>

            {systemInfo.counts && (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive className="w-4 h-4 text-slate-500" />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Conteos Rápidos</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <MiniStat label="Eventos" value={systemInfo.counts.events || 0} />
                  <MiniStat label="Exámenes" value={systemInfo.counts.exams || 0} />
                  <MiniStat label="Festivos" value={systemInfo.counts.holidays || 0} />
                  <MiniStat label="Comunicados" value={systemInfo.counts.announcements || 0} />
                  <MiniStat label="Usuarios" value={systemInfo.counts.users || 0} />
                  <MiniStat label="Admins" value={systemInfo.counts.admins || 0} tone="rose" />
                </div>
              </div>
            )}

            {systemInfo.storage?.files?.length > 0 && (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Almacenamiento JSON</p>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500">{systemInfo.storage?.path || './data'}</p>
                </div>
                <div className="space-y-2">
                  {systemInfo.storage.files.map((f, i) => (
                    <FileBar key={f.name || i} name={f.name} size={f.size} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.section>

        <div className="space-y-5 sm:space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-5 sm:p-7"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Instalar Aplicación</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Instala el calendario como app nativa en tu dispositivo
                </p>
              </div>
              {installPWA.isInstalled && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" />
                  Instalada
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl p-4 bg-gradient-to-br from-cyan-50/80 dark:from-cyan-950/20 dark:to-indigo-950/10 border border-cyan-200/60 dark:border-cyan-900/30">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                    <Download className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">
                      {installPWA.isInstalled ? 'La app ya está instalada' : installPWA.isInstallable ? 'Aplicación disponible' : 'Instrucciones'}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {installPWA.isInstalled
                        ? 'Accede a ella directamente desde tu escritorio, pantalla de inicio o menú de aplicaciones.'
                        : installPWA.isInstallable
                          ? 'Puedes instalarla para acceder sin navegador y recibir notificaciones.'
                          : 'Desde tu navegador, usa el menú superior (⋮) → "Instalar aplicación" o "Añadir a pantalla de inicio".'}
                    </p>
                  </div>
                </div>
              </div>

              {installPWA.isInstallable && (
                <button
                  onClick={handleInstallClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white shadow-md shadow-cyan-500/25 transition-all active:scale-[0.98]"
                >
                  <Download className="w-5 h-5" />
                  Instalar Aplicación
                </button>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

function TerminalBadge({ icon: Icon, label, value, accent }) {
  const cls = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }[accent || 'emerald'];
  return (
    <div className={cn('rounded-2xl border p-3 bg-slate-900/50', cls)}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 opacity-80" />
        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">{label}</p>
      </div>
      <p className="text-xs font-mono font-black truncate">{value}</p>
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  const color = {
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    emerald: 'text-emerald-400',
  }[tone] || 'text-cyan-400';
  return (
    <div className="rounded-xl bg-slate-950/60 border border-slate-800/70 px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">{label}</p>
      <p className={cn('text-sm font-black font-mono', color)}>{value}</p>
    </div>
  );
}

function FileBar({ name, size }) {
  const s = Number(size) || 0;
  const pct = Math.max(0, Math.min(100, (s / (1024 * 1024)) * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-mono text-slate-300 truncate max-w-[70%]">{name || 'file.json'}</span>
        <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">{formatBytes(s)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500"
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
    </div>
  );
}
