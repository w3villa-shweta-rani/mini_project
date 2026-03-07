import { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from stored data
  const initializeAuth = useCallback(async () => {
    setLoading(true);
    const token = authService.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
      localStorage.setItem('gamerhub_user', JSON.stringify(res.data.data));
    } catch (err) {
      // Token invalid or expired
      localStorage.removeItem('gamerhub_token');
      localStorage.removeItem('gamerhub_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email, password) => {
    setError(null);
    const res = await authService.login({ email, password });
    if (res.success) {
      setUser(res.data);
    }
    return res;
  };

  const signup = async (name, email, password) => {
    setError(null);
    return await authService.signup({ name, email, password });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (_) {}
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
      localStorage.setItem('gamerhub_user', JSON.stringify(res.data.data));
      return res.data.data;
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  const updateUserLocally = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('gamerhub_user', JSON.stringify(newUser));
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPremium: user?.planType !== 'Free',
    login,
    signup,
    logout,
    refreshUser,
    updateUserLocally,
    initializeAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
