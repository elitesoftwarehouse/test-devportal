import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  StatusBadge,
  Tabs,
  TabsList,
  Tab,
  TabsContent,
} from '../../../components/ui';
import { formatDate } from '../../../lib/utils';
import styles from './OrdersListPage.module.css';

// Mock data
const mockOrders = [
  { id: '1', title: 'Sviluppo API REST', client: 'Acme Corp', project: 'E-commerce Platform', status: 'IN_PROGRESS', startDate: '2026-01-05', endDate: '2026-02-28' },
  { id: '2', title: 'Migrazione Database', client: 'Tech Solutions', project: 'Legacy Modernization', status: 'SENT', startDate: '2026-01-10', endDate: '2026-01-31' },
  { id: '3', title: 'Code Review', client: 'Startup XYZ', project: 'Mobile App', status: 'ACKNOWLEDGED', startDate: '2026-01-08', endDate: '2026-01-15' },
  { id: '4', title: 'Integrazione Payment Gateway', client: 'Acme Corp', project: 'E-commerce Platform', status: 'CREATED', startDate: '2026-01-15', endDate: '2026-02-15' },
  { id: '5', title: 'Ottimizzazione Performance', client: 'Finance Pro', project: 'Trading Platform', status: 'DONE', startDate: '2025-12-01', endDate: '2025-12-20' },
];

type OrderStatus = 'all' | 'pending' | 'active' | 'completed';

export const OrdersListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');

  const getFilteredOrders = (status: OrderStatus) => {
    let filtered = mockOrders;

    if (searchQuery) {
      filtered = filtered.filter(
        (o) =>
          o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.project.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (status) {
      case 'pending':
        return filtered.filter((o) => ['CREATED', 'SENT'].includes(o.status));
      case 'active':
        return filtered.filter((o) => ['ACKNOWLEDGED', 'IN_PROGRESS'].includes(o.status));
      case 'completed':
        return filtered.filter((o) => ['DONE', 'ARCHIVED'].includes(o.status));
      default:
        return filtered;
    }
  };

  const pendingCount = mockOrders.filter((o) => ['CREATED', 'SENT'].includes(o.status)).length;
  const activeCount = mockOrders.filter((o) => ['ACKNOWLEDGED', 'IN_PROGRESS'].includes(o.status)).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Ordini di Lavoro</h1>
          <p className={styles.subtitle}>Visualizza e gestisci i tuoi ordini di lavoro assegnati</p>
        </div>
      </div>

      <Card padding="none">
        <div className={styles.toolbar}>
          <Input
            placeholder="Cerca per titolo, cliente o progetto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
          />
        </div>

        <Tabs defaultValue="all" onChange={(v) => setStatusFilter(v as OrderStatus)}>
          <div className={styles.tabsWrapper}>
            <TabsList>
              <Tab value="all">Tutti ({mockOrders.length})</Tab>
              <Tab value="pending">Da Prendere in Carico ({pendingCount})</Tab>
              <Tab value="active">In Corso ({activeCount})</Tab>
              <Tab value="completed">Completati</Tab>
            </TabsList>
          </div>

          <TabsContent value="all">
            <OrdersTable orders={getFilteredOrders('all')} />
          </TabsContent>
          <TabsContent value="pending">
            <OrdersTable orders={getFilteredOrders('pending')} />
          </TabsContent>
          <TabsContent value="active">
            <OrdersTable orders={getFilteredOrders('active')} />
          </TabsContent>
          <TabsContent value="completed">
            <OrdersTable orders={getFilteredOrders('completed')} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

// Orders table component
interface Order {
  id: string;
  title: string;
  client: string;
  project: string;
  status: string;
  startDate: string;
  endDate: string;
}

const OrdersTable: React.FC<{ orders: Order[] }> = ({ orders }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow hover={false}>
          <TableHead>Ordine</TableHead>
          <TableHead>Cliente / Progetto</TableHead>
          <TableHead>Periodo</TableHead>
          <TableHead>Stato</TableHead>
          <TableHead align="right">Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableEmpty message="Nessun ordine trovato" colSpan={5} />
        ) : (
          orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link to={`/orders/${order.id}`} className={styles.orderTitle}>
                  {order.title}
                </Link>
              </TableCell>
              <TableCell>
                <div className={styles.clientInfo}>
                  <span className={styles.client}>{order.client}</span>
                  <span className={styles.project}>{order.project}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className={styles.dates}>
                  {formatDate(order.startDate)} - {formatDate(order.endDate)}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell align="right">
                <Link to={`/orders/${order.id}`}>
                  <Button variant="ghost" size="sm">
                    Dettagli
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default OrdersListPage;

