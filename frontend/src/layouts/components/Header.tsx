import React from 'react';
import styles from './Header.module.css';
import UserMenu from './UserMenu';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {title && (
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        )}
      </div>

      <div className={styles.right}>
        {actions && <div className={styles.actions}>{actions}</div>}
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;

