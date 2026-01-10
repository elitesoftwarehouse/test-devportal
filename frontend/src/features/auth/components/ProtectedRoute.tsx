import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
  redirectTo = '/login',
}) => {
  const { user, initialized, hasRole } = useAuth();
  const location = useLocation();

  // Mostra loader mentre verifichiamo l'autenticazione
  if (!initialized) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Caricamento...</p>
      </div>
    );
  }

  // Non autenticato: redirect a login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Autenticato ma senza il ruolo richiesto
  if (roles && roles.length > 0 && !hasRole(roles)) {
    return (
      <div className={styles.unauthorized}>
        <div className={styles.icon}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1>Accesso Negato</h1>
        <p>Non hai i permessi necessari per accedere a questa sezione.</p>
        <a href="/">Torna alla Dashboard</a>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

