import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, StatusBadge, Button } from '../../../components/ui';
import styles from './DashboardPage.module.css';

// Mock data - in produzione verrebbe da API
const mockStats = {
  pendingOrders: 3,
  activeOrders: 5,
  pendingInvoices: 2,
  accreditationStatus: 'APPROVED',
};

const mockRecentOrders = [
  { id: '1', title: 'Sviluppo API REST', client: 'Acme Corp', status: 'IN_PROGRESS', date: '08/01/2026' },
  { id: '2', title: 'Migrazione Database', client: 'Tech Solutions', status: 'SENT', date: '05/01/2026' },
  { id: '3', title: 'Code Review', client: 'Startup XYZ', status: 'ACKNOWLEDGED', date: '03/01/2026' },
];

export const DashboardPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const isOwner = hasRole('EXTERNAL_OWNER');

  return (
    <div className={styles.container}>
      {/* Welcome Section */}
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.welcomeTitle}>
            Benvenuto, {user?.displayName || user?.email}
          </h1>
          <p className={styles.welcomeSubtitle}>
            Ecco un riepilogo della tua attività sul portale
          </p>
        </div>
        <StatusBadge status={mockStats.accreditationStatus} />
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{mockStats.pendingOrders}</span>
            <span className={styles.statLabel}>Ordini in Attesa</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{mockStats.activeOrders}</span>
            <span className={styles.statLabel}>Ordini Attivi</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{mockStats.pendingInvoices}</span>
            <span className={styles.statLabel}>Fatture da Caricare</span>
          </div>
        </Card>

        {isOwner && (
          <Card className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>4</span>
              <span className={styles.statLabel}>Collaboratori</span>
            </div>
          </Card>
        )}
      </div>

      {/* Main Content Grid */}
      <div className={styles.mainGrid}>
        {/* Recent Orders */}
        <Card padding="none" className={styles.ordersCard}>
          <CardHeader className={styles.cardHeaderPadded}>
            <CardTitle>Ordini di Lavoro Recenti</CardTitle>
            <Link to="/orders" className={styles.viewAll}>Vedi tutti</Link>
          </CardHeader>
          <CardContent className={styles.ordersList}>
            {mockRecentOrders.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className={styles.orderItem}>
                <div className={styles.orderInfo}>
                  <span className={styles.orderTitle}>{order.title}</span>
                  <span className={styles.orderClient}>{order.client}</span>
                </div>
                <div className={styles.orderMeta}>
                  <StatusBadge status={order.status} />
                  <span className={styles.orderDate}>{order.date}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className={styles.actionsCard}>
          <CardHeader>
            <CardTitle>Azioni Rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.quickActions}>
              <Link to="/profile" className={styles.quickAction}>
                <div className={styles.quickActionIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span>Aggiorna Profilo</span>
              </Link>

              <Link to="/invoices" className={styles.quickAction}>
                <div className={styles.quickActionIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17,8 12,3 7,8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <span>Carica Fattura</span>
              </Link>

              <Link to="/orders" className={styles.quickAction}>
                <div className={styles.quickActionIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                </div>
                <span>Visualizza Ordini</span>
              </Link>

              {isOwner && (
                <Link to="/collaborators" className={styles.quickAction}>
                  <div className={styles.quickActionIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                  </div>
                  <span>Invita Collaboratore</span>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

