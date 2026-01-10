import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import styles from './Sidebar.module.css';

export interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export interface SidebarProps {
  items: NavItem[];
  logo?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, logo, footer }) => {
  const location = useLocation();

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        {logo || (
          <>
            <div className={styles.logoIcon}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="currentColor" />
                <path
                  d="M8 12h16M8 16h12M8 20h8"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className={styles.logoText}>Elite Portal</span>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {items.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(styles.navItem, isActive && styles.active)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {item.badge !== undefined && (
                <span className={styles.navBadge}>{item.badge}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {footer && <div className={styles.footer}>{footer}</div>}
    </aside>
  );
};

export default Sidebar;

