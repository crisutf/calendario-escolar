import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  GraduationCap,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  LogIn,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { loginWithPassword, loginWithGoogle, loginWithAdminKey } = useAuth();
  const from = location.state?.from || '/panel';

  // Formularios
  const [email, setEmail] = useState('cristiancorban210@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Clave de emergencia
  const [showEmergencyKey, setShowEmergencyKey] = useState(false);
  const [emergencyKey, setEmergencyKey] = useState('');
  const [submittingEmergency, setSubmittingEmergency] = useState(false);

  // Detección de error en URL (e.g. Google OAuth redirect error)
  const oauthError = searchParams.get('error');

  useEffect(() => {
    if (oauthError) {
      if (oauthError === 'unauthorized_client' || oauthError.includes('client')) {
        toast.error('Google OAuth no tiene registrado el dominio en Google Cloud. Accede abajo con tu correo y contraseña.', {
          id: 'google-oauth-error',
          duration: 6000,
        });
      } else {
        toast.error(`Aviso de Google OAuth: ${oauthError}. Accede con tu correo y contraseña.`, {
          id: 'google-oauth-error',
          duration: 5000,
        });
      }
      // Limpiar el parámetro de la URL para que no persista
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch { }
    }
  }, [oauthError]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Por favor, introduce tu correo y contraseña');
      return;
    }

    try {
      setSubmitting(true);
      await loginWithPassword(email.trim(), password);
      toast.success('¡Bienvenido! Sesión iniciada con éxito');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Error al iniciar sesión. Comprueba tus datos.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('Sesión iniciada con Google');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Error al iniciar sesión con Google');
    }
  };

  const handleGoogleError = () => {
    toast.error('No se pudo verificar con Google. Inicia sesión con tu correo y contraseña.');
  };

  const handleGoogleRedirect = () => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://dev-management-digital-v1.crisu.qzz.io';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !emergencyKey.trim()) {
      toast.error('Introduce tu correo y la clave maestra');
      return;
    }
    try {
      setSubmittingEmergency(true);
      await loginWithAdminKey(email.trim(), emergencyKey.trim());
      toast.success('Acceso administrativo de emergencia concedido');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Clave de administración incorrecta');
    } finally {
      setSubmittingEmergency(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-100 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 overflow-hidden relative">
      {/* Luces de fondo decorativas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.45, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.35, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Calendario
          </Link>
        </div>

        <div className="w-full rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 shadow-2xl p-6 sm:p-8">
          {/* Cabecera */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 mb-3">
              <Calendar className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
              Panel de Control
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              Gestión docente y administración escolar
            </p>
          </div>

          {/* Banner si hubo error con Google OAuth */}
          {oauthError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Aviso de Google OAuth ({oauthError})</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  Google requiere configurar el origen en Google Cloud. Puedes acceder directamente abajo con tu <strong>correo y contraseña</strong>.
                </p>
              </div>
            </motion.div>
          )}

          {/* FORMULARIO PRINCIPAL: Email y Contraseña */}
          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="username email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@colegio.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduce tu contraseña"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-70 mt-1 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              {submitting ? 'Comprobando credenciales...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Separador */}
          <div className="my-5 relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            <span className="absolute bg-white/95 dark:bg-slate-900/95 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
              o continuar con Google
            </span>
          </div>

          {/* Botón Único de Google */}
          <div>
            <button
              type="button"
              onClick={handleGoogleRedirect}
              className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800/90 dark:hover:bg-slate-800 shadow-sm border border-slate-300/80 dark:border-slate-700 transition-all active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              Iniciar sesión con Google
            </button>
          </div>

          {/* Acceso de Emergencia */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <button
              type="button"
              onClick={() => setShowEmergencyKey(!showEmergencyKey)}
              className="w-full flex items-center justify-between py-1 text-left text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-[11px]">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                Acceso de emergencia con clave maestra
              </span>
              {showEmergencyKey ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <AnimatePresence>
              {showEmergencyKey && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleEmergencySubmit}
                  className="mt-3 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/40 space-y-2.5"
                >
                  <p className="text-[11px] text-indigo-900/70 dark:text-indigo-300/80">
                    Introduce el correo de administrador y la clave maestra configurada en el servidor.
                  </p>
                  <div>
                    <input
                      type="password"
                      required
                      value={emergencyKey}
                      onChange={(e) => setEmergencyKey(e.target.value)}
                      placeholder="Clave maestra de emergencia"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingEmergency}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70"
                  >
                    {submittingEmergency ? 'Verificando...' : 'Acceder con Clave'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Pie de autenticación */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Calendario Escolar · Made by Crisutf
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
