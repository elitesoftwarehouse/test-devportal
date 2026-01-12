import React, { useState } from 'react';
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
  Modal,
  Tabs,
  TabsList,
  Tab,
  TabsContent,
} from '../../../components/ui';
import { formatDate, formatCurrency } from '../../../lib/utils';
import styles from './BackofficeInvoicesPage.module.css';

// Mock data
const mockInvoices = [
  { id: '1', number: 'FT-2026-015', supplier: 'Mario Rossi', company: 'Tech Innovators Srl', amount: 2500, date: '2026-01-09', status: 'UNDER_CHECK' },
  { id: '2', number: 'FT-2026-014', supplier: 'Tech Innovators Srl', company: null, amount: 8200, date: '2026-01-08', status: 'UNDER_CHECK' },
  { id: '3', number: 'FT-2026-013', supplier: 'Laura Verdi', company: null, amount: 1800, date: '2026-01-07', status: 'UNDER_CHECK' },
  { id: '4', number: 'FT-2026-012', supplier: 'Marco Bianchi', company: 'Digital Services SpA', amount: 3500, date: '2026-01-05', status: 'ACCEPTED' },
  { id: '5', number: 'FT-2026-011', supplier: 'Anna Neri', company: null, amount: 1200, date: '2026-01-03', status: 'REJECTED' },
];

type InvoiceStatus = 'all' | 'pending' | 'accepted' | 'rejected';

export const BackofficeInvoicesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<typeof mockInvoices[0] | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const getFilteredInvoices = (status: InvoiceStatus) => {
    let filtered = mockInvoices;

    if (searchQuery) {
      filtered = filtered.filter(
        (inv) =>
          inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (status) {
      case 'pending':
        return filtered.filter((inv) => inv.status === 'UNDER_CHECK');
      case 'accepted':
        return filtered.filter((inv) => inv.status === 'ACCEPTED');
      case 'rejected':
        return filtered.filter((inv) => inv.status === 'REJECTED');
      default:
        return filtered;
    }
  };

  const pendingCount = mockInvoices.filter((inv) => inv.status === 'UNDER_CHECK').length;

  const handleAccept = (invoice: typeof mockInvoices[0]) => {
    console.log('Accepting invoice:', invoice.id);
    setSelectedInvoice(null);
  };

  const handleReject = () => {
    console.log('Rejecting invoice:', selectedInvoice?.id, 'Reason:', rejectReason);
    setIsRejectModalOpen(false);
    setRejectReason('');
    setSelectedInvoice(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Verifica Fatture</h1>
          <p className={styles.subtitle}>Verifica e approva le fatture caricate dai fornitori</p>
        </div>
      </div>

      <Card padding="none">
        <div className={styles.toolbar}>
          <Input
            placeholder="Cerca per numero fattura o fornitore..."
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

        <Tabs defaultValue="pending">
          <div className={styles.tabsWrapper}>
            <TabsList>
              <Tab value="all">Tutte ({mockInvoices.length})</Tab>
              <Tab value="pending">Da Verificare ({pendingCount})</Tab>
              <Tab value="accepted">Accettate</Tab>
              <Tab value="rejected">Rifiutate</Tab>
            </TabsList>
          </div>

          <TabsContent value="all">
            <InvoicesTable
              invoices={getFilteredInvoices('all')}
              onAccept={handleAccept}
              onReject={(inv) => { setSelectedInvoice(inv); setIsRejectModalOpen(true); }}
            />
          </TabsContent>
          <TabsContent value="pending">
            <InvoicesTable
              invoices={getFilteredInvoices('pending')}
              onAccept={handleAccept}
              onReject={(inv) => { setSelectedInvoice(inv); setIsRejectModalOpen(true); }}
            />
          </TabsContent>
          <TabsContent value="accepted">
            <InvoicesTable
              invoices={getFilteredInvoices('accepted')}
              onAccept={handleAccept}
              onReject={(inv) => { setSelectedInvoice(inv); setIsRejectModalOpen(true); }}
            />
          </TabsContent>
          <TabsContent value="rejected">
            <InvoicesTable
              invoices={getFilteredInvoices('rejected')}
              onAccept={handleAccept}
              onReject={(inv) => { setSelectedInvoice(inv); setIsRejectModalOpen(true); }}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Rifiuta Fattura"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Annulla
            </Button>
            <Button variant="danger" onClick={handleReject}>
              Conferma Rifiuto
            </Button>
          </>
        }
      >
        <div className={styles.rejectForm}>
          <p className={styles.modalText}>
            Stai per rifiutare la fattura <strong>{selectedInvoice?.number}</strong> di <strong>{selectedInvoice?.supplier}</strong>.
          </p>
          <Input
            label="Motivazione del rifiuto"
            placeholder="Inserisci il motivo del rifiuto..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
          />
        </div>
      </Modal>
    </div>
  );
};

// Invoices table component
interface Invoice {
  id: string;
  number: string;
  supplier: string;
  company: string | null;
  amount: number;
  date: string;
  status: string;
}

interface InvoicesTableProps {
  invoices: Invoice[];
  onAccept: (invoice: Invoice) => void;
  onReject: (invoice: Invoice) => void;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices, onAccept, onReject }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow hover={false}>
          <TableHead>Numero</TableHead>
          <TableHead>Fornitore</TableHead>
          <TableHead>Data</TableHead>
          <TableHead align="right">Importo</TableHead>
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
              <TableCell>
                <div className={styles.supplierInfo}>
                  <span className={styles.supplierName}>{invoice.supplier}</span>
                  {invoice.company && <span className={styles.companyName}>{invoice.company}</span>}
                </div>
              </TableCell>
              <TableCell>{formatDate(invoice.date)}</TableCell>
              <TableCell align="right">
                <span className={styles.amount}>{formatCurrency(invoice.amount)}</span>
              </TableCell>
              <TableCell>
                <StatusBadge status={invoice.status} />
              </TableCell>
              <TableCell align="right">
                <div className={styles.actions}>
                  <Button variant="ghost" size="sm">
                    Visualizza
                  </Button>
                  {invoice.status === 'UNDER_CHECK' && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => onAccept(invoice)}>
                        Accetta
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onReject(invoice)}>
                        Rifiuta
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default BackofficeInvoicesPage;

