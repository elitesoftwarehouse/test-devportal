import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, StatusBadge, Badge } from '../../../components/ui';
import { formatDate } from '../../../lib/utils';
import styles from './BackofficeDashboardPage.module.css';

// Mock data
const mockStats = {
  pendingAccreditations: 3,
  pendingInvoices: 5,
  activeOrders: 12,
  totalResources: 156,
};

const mockRecentAccreditations = [
  { id: '1', company: 'Tech Innovators Srl', type: 'Azienda', submittedAt: '2026-01-09', status: 'SUBMITTED' },
  { id: '2', company: 'Marco Bianchi', type: 'Professionista', submittedAt: '2026-01-08', status: 'UNDER_REVIEW' },
  { id: '3', company: 'Digital Services SpA', type: 'Azienda', submittedAt: '2026-01-07', status: 'SUBMITTED' },
];

const mockRecentInvoices = [
  { id: '1', number: 'FT-2026-015', supplier: 'Mario Rossi', amount: 2500, status: 'UNDER_CHECK' },
  { id: '2', number: 'FT-2026-014', supplier: 'Tech Innovators Srl', amount: 8200, status: 'UNDER_CHECK' },
  { id: '3', number: 'FT-2026-013', supplier: 'Laura Verdi', amount: 1800, status: 'UNDER_CHECK' },
];

export const BackofficeDashboardPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard Backoffice</h1>
        <p className={styles.subtitle}>Panoramica delle attività in sospeso e KPI principali</p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <Link to="/backoffice/accreditations" className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{mockStats.pendingAccreditations}</span>
            <span className={styles.statLabel}>Accreditamenti da Verificare</span>
          </div>
        </Link>

        <Link to="/backoffice/invoices" className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{mockStats.pendingInvoices}</span>
            <span className={styles.statLabel}>Fatture da Verificare</span>
          </div>
        </Link>

        <Link to="/backoffice/orders" className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{mockStats.activeOrders}</span>
            <span className={styles.statLabel}>Ordini Attivi</span>
          </div>
        </Link>

        <Link to="/backoffice/resources" className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{mockStats.totalResources}</span>
            <span className={styles.statLabel}>Risorse in Anagrafica</span>
          </div>
        </Link>
      </div>

      {/* Main Grid */}
      <div className={styles.mainGrid}>
        {/* Recent Accreditations */}
        <Card padding="none">
          <CardHeader className={styles.cardHeaderPadded}>
            <CardTitle>Accreditamenti Recenti</CardTitle>
            <Link to="/backoffice/accreditations" className={styles.viewAll}>Vedi tutti</Link>
          </CardHeader>
          <CardContent className={styles.listContent}>
            {mockRecentAccreditations.map((acc) => (
              <Link key={acc.id} to={`/backoffice/accreditations/${acc.id}`} className={styles.listItem}>
                <div className={styles.listItemInfo}>
                  <span className={styles.listItemTitle}>{acc.company}</span>
                  <div className={styles.listItemMeta}>
                    <Badge variant="default">{acc.type}</Badge>
                    <span>{formatDate(acc.submittedAt)}</span>
                  </div>
                </div>
                <StatusBadge status={acc.status} />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Invoices to Check */}
        <Card padding="none">
          <CardHeader className={styles.cardHeaderPadded}>
            <CardTitle>Fatture da Verificare</CardTitle>
            <Link to="/backoffice/invoices" className={styles.viewAll}>Vedi tutte</Link>
          </CardHeader>
          <CardContent className={styles.listContent}>
            {mockRecentInvoices.map((inv) => (
              <div key={inv.id} className={styles.listItem}>
                <div className={styles.listItemInfo}>
                  <span className={styles.listItemTitle}>{inv.number}</span>
                  <span className={styles.listItemSubtitle}>{inv.supplier}</span>
                </div>
                <div className={styles.listItemRight}>
                  <span className={styles.amount}>€ {inv.amount.toLocaleString('it-IT')}</span>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackofficeDashboardPage;

