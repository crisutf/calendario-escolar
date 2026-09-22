import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/auth/me');
      if (data?.token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
      }
      setUser(data?.user || data || null);
    } catch (err) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Detectar token en URL si viene del callback OAuth de Google
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        localStorage.setItem('auth_token', urlToken);
        // Limpiar token de la barra de direcciones sin recargar
        params.delete('token');
        params.delete('login');
        const cleanQuery = params.toString() ? `?${params.toString()}` : '';
        window.history.replaceState({}, document.title, window.location.pathname + cleanQuery);
      }
    }
    refetchMe();
  }, [refetchMe]);

  const loginWithGoogle = useCallback(async (credential) => {
    setLoading(true);
    try {
      const data = await api.post('/api/auth/google', { credential });
      if (data?.token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
      }
      setUser(data?.user || data || null);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithPassword = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await api.post('/api/auth/login', { email, password });
      if (data?.token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
      }
      setUser(data?.user || data || null);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithAdminKey = useCallback(async (email, secretKey) => {
    setLoading(true);
    try {
      const data = await api.post('/api/auth/admin-login', { email, secretKey });
      if (data?.token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
      }
      setUser(data?.user || data || null);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.post('/api/auth/logout').catch(() => {});
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      setUser(null);
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithPassword, loginWithGoogle, loginWithAdminKey, logout, refetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
