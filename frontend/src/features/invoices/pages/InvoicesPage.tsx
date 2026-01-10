import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
import { formatDate, formatCurrency } from '../../../lib/utils';
import styles from './InvoicesPage.module.css';

// Mock data
const mockInvoices = [
  { id: '1', number: 'FT-2026-001', date: '2026-01-05', amount: 2500, period: 'Dicembre 2025', status: 'ACCEPTED', orders: ['Sviluppo API REST'] },
  { id: '2', number: 'FT-2026-002', date: '2026-01-08', amount: 1800, period: 'Dicembre 2025', status: 'UNDER_CHECK', orders: ['Code Review'] },
  { id: '3', number: 'FT-2025-045', date: '2025-12-20', amount: 3200, period: 'Novembre 2025', status: 'ACCEPTED', orders: ['Ottimizzazione Performance'] },
  { id: '4', number: 'FT-2025-044', date: '2025-12-15', amount: 1500, period: 'Novembre 2025', status: 'REJECTED', orders: ['Migrazione Database'] },
];

const mockOrders = [
  { id: '1', title: 'Sviluppo API REST', client: 'Acme Corp' },
  { id: '3', title: 'Code Review', client: 'Startup XYZ' },
];

type InvoiceStatus = 'all' | 'pending' | 'accepted' | 'rejected';

export const InvoicesPage: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadForm, setUploadForm] = useState({
    number: '',
    date: '',
    amount: '',
    period: '',
    orderId: '',
  });

  const getFilteredInvoices = (status: InvoiceStatus) => {
    let filtered = mockInvoices;

    if (searchQuery) {
      filtered = filtered.filter(
        (inv) =>
          inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.orders.some((o) => o.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    switch (status) {
      case 'pending':
        return filtered.filter((inv) => inv.status === 'UNDER_CHECK' || inv.status === 'UPLOADED');
      case 'accepted':
        return filtered.filter((inv) => inv.status === 'ACCEPTED');
      case 'rejected':
        return filtered.filter((inv) => inv.status === 'REJECTED');
      default:
        return filtered;
    }
  };

  const handleUpload = () => {
    // In produzione: chiamata API con upload file
    console.log('Uploading invoice:', uploadForm);
    setIsUploadModalOpen(false);
    setUploadForm({ number: '', date: '', amount: '', period: '', orderId: '' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Fatture</h1>
          <p className={styles.subtitle}>Gestisci le tue fatture e monitora lo stato di verifica</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Carica Fattura
        </Button>
      </div>

      <Card padding="none">
        <div className={styles.toolbar}>
          <Input
            placeholder="Cerca per numero fattura o ordine..."
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
              <Tab value="all">Tutte ({mockInvoices.length})</Tab>
              <Tab value="pending">In Verifica</Tab>
              <Tab value="accepted">Accettate</Tab>
              <Tab value="rejected">Rifiutate</Tab>
            </TabsList>
          </div>

          <TabsContent value="all">
            <InvoicesTable invoices={getFilteredInvoices('all')} />
          </TabsContent>
          <TabsContent value="pending">
            <InvoicesTable invoices={getFilteredInvoices('pending')} />
          </TabsContent>
          <TabsContent value="accepted">
            <InvoicesTable invoices={getFilteredInvoices('accepted')} />
          </TabsContent>
          <TabsContent value="rejected">
            <InvoicesTable invoices={getFilteredInvoices('rejected')} />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Carica Nuova Fattura"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleUpload}>Carica Fattura</Button>
          </>
        }
      >
        <div className={styles.uploadForm}>
          <div className={styles.uploadArea}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p>Trascina il file PDF oppure</p>
            <Button variant="outline" size="sm">Seleziona File</Button>
            <span className={styles.uploadHint}>Formato accettato: PDF (max 10MB)</span>
          </div>

          <div className={styles.formGrid}>
            <Input
              label="Numero Fattura"
              placeholder="FT-2026-XXX"
              value={uploadForm.number}
              onChange={(e) => setUploadForm({ ...uploadForm, number: e.target.value })}
              required
            />
            <Input
              label="Data Fattura"
              type="date"
              value={uploadForm.date}
              onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })}
              required
            />
            <Input
              label="Importo (EUR)"
              type="number"
              placeholder="0.00"
              value={uploadForm.amount}
              onChange={(e) => setUploadForm({ ...uploadForm, amount: e.target.value })}
              required
            />
            <Input
              label="Periodo di Riferimento"
              placeholder="es. Gennaio 2026"
              value={uploadForm.period}
              onChange={(e) => setUploadForm({ ...uploadForm, period: e.target.value })}
              required
            />
          </div>

          <div className={styles.ordersSelection}>
            <label className={styles.ordersLabel}>Ordini di Lavoro Collegati</label>
            <div className={styles.ordersList}>
              {mockOrders.map((order) => (
                <label key={order.id} className={styles.orderCheckbox}>
                  <input type="checkbox" />
                  <span>{order.title}</span>
                  <span className={styles.orderClient}>{order.client}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Invoices table component
interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  period: string;
  status: string;
  orders: string[];
}

const InvoicesTable: React.FC<{ invoices: Invoice[] }> = ({ invoices }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow hover={false}>
          <TableHead>Numero</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Importo</TableHead>
          <TableHead>Periodo</TableHead>
          <TableHead>Stato</TableHead>
          <TableHead align="right">Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.length === 0 ? (
          <TableEmpty message="Nessuna fattura trovata" colSpan={6} />
        ) : (
          invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <span className={styles.invoiceNumber}>{invoice.number}</span>
              </TableCell>
              <TableCell>{formatDate(invoice.date)}</TableCell>
              <TableCell>
                <span className={styles.amount}>{formatCurrency(invoice.amount)}</span>
              </TableCell>
              <TableCell>{invoice.period}</TableCell>
              <TableCell>
                <StatusBadge status={invoice.status} />
              </TableCell>
              <TableCell align="right">
                <div className={styles.actions}>
                  <button className={styles.actionBtn} title="Visualizza">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button className={styles.actionBtn} title="Scarica">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7,10 12,15 17,10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default InvoicesPage;

