import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../../../lib/api';

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
  accreditationStatus?: string;
  companyId?: string | number;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  type: 'professional' | 'company';
  name?: string;
  companyName?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Demo user for development/testing - remove in production
const DEMO_USER: AuthUser = {
  id: 'demo-1',
  email: 'demo@eliteportal.it',
  displayName: 'Mario Rossi',
  roles: ['EXTERNAL_OWNER', 'IT_OPERATOR'], // Both roles for testing
  accreditationStatus: 'APPROVED',
};

// Set to true to enable demo mode without backend auth
const DEMO_MODE = import.meta.env.DEV;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  const fetchMe = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        // In demo mode, use demo user if no real auth
        setUser(DEMO_MODE ? DEMO_USER : null);
      }
    } catch {
      // In demo mode, use demo user if API fails
      setUser(DEMO_MODE ? DEMO_USER : null);
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
      const response = await api.post('/auth/login', payload);
      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        await fetchMe();
      }
    } finally {
      setLoading(false);
    }
  }, [fetchMe]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch {
      // anche in caso di errore lato server, puliamo comunque lo stato client
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      await api.post('/auth/register', payload);
      // Dopo la registrazione, l'utente deve verificare l'email
    } finally {
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
    () => ({
      user,
      loading,
      initialized,
      login,
      logout,
      register,
      hasRole,
      isAuthenticated: !!user,
    }),
    [user, loading, initialized, login, logout, register, hasRole]
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

export default AuthContext;

