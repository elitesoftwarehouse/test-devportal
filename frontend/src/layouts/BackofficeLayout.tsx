import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar, { NavItem } from './components/Sidebar';
import Header from './components/Header';
import styles from './BackofficeLayout.module.css';

// Icons as SVG components
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const AccreditationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22,4 12,14.01 9,11.01" />
  </svg>
);

const ResourcesIcon = () => (
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
  </svg>
);

const InvoicesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12,19 5,12 12,5" />
  </svg>
);

const navItems: NavItem[] = [
  { path: '/backoffice', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/backoffice/accreditations', label: 'Accreditamenti', icon: <AccreditationIcon />, badge: 3 },
  { path: '/backoffice/resources', label: 'Anagrafica Risorse', icon: <ResourcesIcon /> },
  { path: '/backoffice/orders', label: 'Ordini di Lavoro', icon: <OrdersIcon /> },
  { path: '/backoffice/invoices', label: 'Verifica Fatture', icon: <InvoicesIcon />, badge: 5 },
];

// Custom logo for backoffice
const BackofficeLogo = () => (
  <>
    <div className={styles.logoIcon}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="currentColor" />
        <path
          d="M8 10h16M8 16h10M8 22h6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="22" cy="22" r="4" stroke="white" strokeWidth="2" />
      </svg>
    </div>
    <span className={styles.logoText}>Backoffice</span>
  </>
);

// Footer with back to portal link
const BackofficeFooter = () => (
  <a href="/" className={styles.backLink}>
    <BackIcon />
    <span>Torna al Portale</span>
  </a>
);

export const BackofficeLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Sidebar 
        items={navItems} 
        logo={<BackofficeLogo />}
        footer={<BackofficeFooter />}
      />
      <div className={styles.main}>
        <Header />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BackofficeLayout;

