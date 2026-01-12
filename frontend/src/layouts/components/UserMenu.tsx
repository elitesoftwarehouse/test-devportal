import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import { getInitials } from '../../lib/utils';
import styles from './UserMenu.module.css';

export const UserMenu: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const displayName = user.displayName || user.email;
  const initials = getInitials(displayName);
  const primaryRole = user.roles[0] || 'Utente';

  // Get role label
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      SYS_ADMIN: 'Amministratore',
      IT_OPERATOR: 'Operatore IT',
      EXTERNAL_OWNER: 'Professionista',
      EXTERNAL_COLLABORATOR: 'Collaboratore',
    };
    return labels[role] || role;
  };

  return (
    <div className={styles.container} ref={menuRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.info}>
          <span className={styles.name}>{displayName}</span>
          <span className={styles.role}>{getRoleLabel(primaryRole)}</span>
        </div>
        <svg
          className={styles.chevron}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownEmail}>{user.email}</span>
          </div>

          <div className={styles.dropdownItems}>
            <button className={styles.dropdownItem} onClick={() => { navigate('/profile'); setIsOpen(false); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Il mio profilo
            </button>

            {hasRole(['IT_OPERATOR', 'SYS_ADMIN']) && (
              <button className={styles.dropdownItem} onClick={() => { navigate('/backoffice'); setIsOpen(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
                Backoffice
              </button>
            )}
          </div>

          <div className={styles.dropdownFooter}>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Esci
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

