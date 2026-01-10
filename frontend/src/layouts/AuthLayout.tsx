import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';

export const AuthLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      {/* Left panel - Branding */}
      <div className={styles.branding}>
        <div className={styles.brandingContent}>
          <div className={styles.logo}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="currentColor" />
              <path
                d="M12 18h24M12 24h18M12 30h12"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className={styles.title}>Elite Portal</h1>
          <p className={styles.subtitle}>
            Portale per la Gestione dei Collaboratori Esterni
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
              <span>Accreditamento semplificato</span>
            </div>
            <div className={styles.feature}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              <span>Gestione ordini di lavoro</span>
            </div>
            <div className={styles.feature}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <span>Fatturazione documentale</span>
            </div>
          </div>
        </div>

        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} Elite Software House. Tutti i diritti riservati.
        </p>
      </div>

      {/* Right panel - Auth form */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

