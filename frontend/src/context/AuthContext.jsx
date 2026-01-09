import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient, { fetchCurrentUser, login as apiLogin, logout as apiLogout } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const data = await fetchCurrentUser();
        if (isMounted) {
          setUser(data.user || null);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogin(email, password) {
    setError(null);
    const data = await apiLogin(email, password);
    setUser(data.user);
    return data.user;
  }

  async function handleLogout() {
    await apiLogout();
    setUser(null);
  }

  const value = {
    user,
    loading,
    error,
    setError,
    login: handleLogin,
    logout: handleLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve essere usato all'interno di AuthProvider');
  }
  return ctx;
}
