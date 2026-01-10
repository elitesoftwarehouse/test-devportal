import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
  Modal,
  Tabs,
  TabsList,
  Tab,
  TabsContent,
} from '../../../components/ui';
import { formatDate } from '../../../lib/utils';
import styles from './BackofficeOrdersPage.module.css';

// Mock data
const mockOrders = [
  { id: '1', title: 'Sviluppo API REST', resource: 'Mario Rossi', client: 'Acme Corp', status: 'IN_PROGRESS', startDate: '2026-01-05', endDate: '2026-02-28' },
  { id: '2', title: 'Migrazione Database', resource: 'Marco Verdi', client: 'Tech Solutions', status: 'SENT', startDate: '2026-01-10', endDate: '2026-01-31' },
  { id: '3', title: 'Code Review', resource: 'Laura Bianchi', client: 'Startup XYZ', status: 'ACKNOWLEDGED', startDate: '2026-01-08', endDate: '2026-01-15' },
  { id: '4', title: 'Integrazione Payment Gateway', resource: 'Giuseppe Blu', client: 'Acme Corp', status: 'CREATED', startDate: '2026-01-15', endDate: '2026-02-15' },
  { id: '5', title: 'Ottimizzazione Performance', resource: 'Anna Neri', client: 'Finance Pro', status: 'DONE', startDate: '2025-12-01', endDate: '2025-12-20' },
];

const mockResources = [
  { id: '1', name: 'Mario Rossi' },
  { id: '2', name: 'Laura Bianchi' },
  { id: '3', name: 'Marco Verdi' },
];

export const BackofficeOrdersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    title: '',
    description: '',
    resourceId: '',
    client: '',
    startDate: '',
    endDate: '',
  });

  const getFilteredOrders = (status: 'all' | 'active' | 'completed') => {
    let filtered = mockOrders;

    if (searchQuery) {
      filtered = filtered.filter(
        (o) =>
          o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.client.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (status) {
      case 'active':
        return filtered.filter((o) => !['DONE', 'ARCHIVED'].includes(o.status));
      case 'completed':
        return filtered.filter((o) => ['DONE', 'ARCHIVED'].includes(o.status));
      default:
        return filtered;
    }
  };

  const handleCreateOrder = () => {
    console.log('Creating order:', newOrder);
    setIsCreateModalOpen(false);
    setNewOrder({ title: '', description: '', resourceId: '', client: '', startDate: '', endDate: '' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gestione Ordini di Lavoro</h1>
          <p className={styles.subtitle}>Crea e gestisci gli ordini di lavoro per le risorse esterne</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuovo Ordine
        </Button>
      </div>

      <Card padding="none">
        <div className={styles.toolbar}>
          <Input
            placeholder="Cerca per titolo, risorsa o cliente..."
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

        <Tabs defaultValue="all">
          <div className={styles.tabsWrapper}>
            <TabsList>
              <Tab value="all">Tutti ({mockOrders.length})</Tab>
              <Tab value="active">Attivi</Tab>
              <Tab value="completed">Completati</Tab>
            </TabsList>
          </div>

          <TabsContent value="all">
            <OrdersTable orders={getFilteredOrders('all')} />
          </TabsContent>
          <TabsContent value="active">
            <OrdersTable orders={getFilteredOrders('active')} />
          </TabsContent>
          <TabsContent value="completed">
            <OrdersTable orders={getFilteredOrders('completed')} />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Create Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nuovo Ordine di Lavoro"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleCreateOrder}>
              Crea Ordine
            </Button>
          </>
        }
      >
        <div className={styles.createForm}>
          <Input
            label="Titolo"
            placeholder="Descrizione breve dell'attività"
            value={newOrder.title}
            onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })}
            required
          />

          <div className={styles.formRow}>
            <Input
              label="Cliente"
              placeholder="Nome del cliente"
              value={newOrder.client}
              onChange={(e) => setNewOrder({ ...newOrder, client: e.target.value })}
              required
            />
            <div className={styles.selectWrapper}>
              <label className={styles.selectLabel}>Risorsa Assegnata</label>
              <select
                className={styles.select}
                value={newOrder.resourceId}
                onChange={(e) => setNewOrder({ ...newOrder, resourceId: e.target.value })}
              >
                <option value="">Seleziona risorsa...</option>
                {mockResources.map((res) => (
                  <option key={res.id} value={res.id}>{res.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <Input
              label="Data Inizio"
              type="date"
              value={newOrder.startDate}
              onChange={(e) => setNewOrder({ ...newOrder, startDate: e.target.value })}
              required
            />
            <Input
              label="Data Fine"
              type="date"
              value={newOrder.endDate}
              onChange={(e) => setNewOrder({ ...newOrder, endDate: e.target.value })}
              required
            />
          </div>

          <div className={styles.descriptionField}>
            <label className={styles.selectLabel}>Descrizione Attività</label>
            <textarea
              className={styles.textarea}
              placeholder="Descrizione dettagliata delle attività da svolgere..."
              value={newOrder.description}
              onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
              rows={4}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Orders table component
interface Order {
  id: string;
  title: string;
  resource: string;
  client: string;
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
          <TableHead>Risorsa</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Periodo</TableHead>
          <TableHead>Stato</TableHead>
          <TableHead align="right">Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableEmpty message="Nessun ordine trovato" colSpan={6} />
        ) : (
          orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <span className={styles.orderTitle}>{order.title}</span>
              </TableCell>
              <TableCell>{order.resource}</TableCell>
              <TableCell>{order.client}</TableCell>
              <TableCell>
                <span className={styles.dates}>
                  {formatDate(order.startDate)} - {formatDate(order.endDate)}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell align="right">
                <Button variant="ghost" size="sm">
                  Dettagli
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default BackofficeOrdersPage;

