import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import httpClient from '../api/httpClient';

export type UserRole =
  | 'SYS_ADMIN'
  | 'IT_OPERATOR'
  | 'EXTERNAL_OWNER'
  | 'EXTERNAL_COLLABORATOR'
  | 'EMPLOYEE'
  | 'MANAGER'
  | string;

export interface AuthUser {
  id: string | number;
  email: string;
  roles: UserRole[];
  displayName?: string | null;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  const fetchMe = useCallback(async () => {
    try {
      const response = await httpClient.get('/auth/me');
      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    // All'avvio dell'app verifichiamo se esiste una sessione valida
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const response = await httpClient.post('/auth/login', payload);
      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        // fallback per coerenza: se l'API non restituisce user, ricarichiamo da /auth/me
        await fetchMe();
      }
    } finally {
      setLoading(false);
    }
  }, [fetchMe]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await httpClient.post('/auth/logout');
    } catch (error) {
      // anche in caso di errore lato server, puliamo comunque lo stato client
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!user || !user.roles) return false;
      const required = Array.isArray(roles) ? roles : [roles];
      return user.roles.some((r) => required.includes(r));
    },
    [user]
  );

  const value: AuthContextValue = useMemo(
    () => ({ user, loading, initialized, login, logout, hasRole }),
    [user, loading, initialized, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve essere usato all\'interno di AuthProvider');
  }
  return ctx;
};
