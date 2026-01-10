import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar, { NavItem } from './components/Sidebar';
import Header from './components/Header';
import { useAuth } from '../features/auth/context/AuthContext';
import styles from './ExternalLayout.module.css';

// Icons as SVG components
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CollaboratorsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const OrdersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const InvoicesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

export const ExternalLayout: React.FC = () => {
  const { hasRole } = useAuth();
  const isOwner = hasRole('EXTERNAL_OWNER');

  // Build navigation items based on role
  const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/profile', label: 'Il mio Profilo', icon: <ProfileIcon /> },
  ];

  // Only owners can see collaborators
  if (isOwner) {
    navItems.push({ path: '/collaborators', label: 'Collaboratori', icon: <CollaboratorsIcon /> });
  }

  // Everyone can see orders and invoices
  navItems.push(
    { path: '/orders', label: 'Ordini di Lavoro', icon: <OrdersIcon /> },
    { path: '/invoices', label: 'Fatture', icon: <InvoicesIcon /> }
  );

  return (
    <div className={styles.layout}>
      <Sidebar items={navItems} />
      <div className={styles.main}>
        <Header />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ExternalLayout;

