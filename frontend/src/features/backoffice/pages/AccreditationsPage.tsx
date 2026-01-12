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
  Badge,
  Tabs,
  TabsList,
  Tab,
  TabsContent,
} from '../../../components/ui';
import { formatDate } from '../../../lib/utils';
import styles from './AccreditationsPage.module.css';

// Mock data
const mockAccreditations = [
  { id: '1', company: 'Tech Innovators Srl', type: 'company', contact: 'Mario Rossi', email: 'mario@techinnovators.it', submittedAt: '2026-01-09', status: 'SUBMITTED' },
  { id: '2', company: 'Marco Bianchi', type: 'professional', contact: 'Marco Bianchi', email: 'marco.bianchi@email.com', submittedAt: '2026-01-08', status: 'UNDER_REVIEW' },
  { id: '3', company: 'Digital Services SpA', type: 'company', contact: 'Anna Verdi', email: 'info@digitalservices.it', submittedAt: '2026-01-07', status: 'SUBMITTED' },
  { id: '4', company: 'Laura Neri', type: 'professional', contact: 'Laura Neri', email: 'laura.neri@email.com', submittedAt: '2026-01-05', status: 'APPROVED' },
  { id: '5', company: 'Cloud Solutions Srl', type: 'company', contact: 'Giuseppe Blu', email: 'info@cloudsolutions.it', submittedAt: '2026-01-03', status: 'REJECTED' },
];

type AccreditationStatus = 'all' | 'pending' | 'approved' | 'rejected';

export const AccreditationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const getFilteredAccreditations = (status: AccreditationStatus) => {
    let filtered = mockAccreditations;

    if (searchQuery) {
      filtered = filtered.filter(
        (acc) =>
          acc.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          acc.contact.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (status) {
      case 'pending':
        return filtered.filter((acc) => ['SUBMITTED', 'UNDER_REVIEW'].includes(acc.status));
      case 'approved':
        return filtered.filter((acc) => acc.status === 'APPROVED');
      case 'rejected':
        return filtered.filter((acc) => acc.status === 'REJECTED');
      default:
        return filtered;
    }
  };

  const pendingCount = mockAccreditations.filter((acc) => ['SUBMITTED', 'UNDER_REVIEW'].includes(acc.status)).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Richieste di Accreditamento</h1>
          <p className={styles.subtitle}>Verifica e gestisci le richieste di accreditamento</p>
        </div>
      </div>

      <Card padding="none">
        <div className={styles.toolbar}>
          <Input
            placeholder="Cerca per nome, email o contatto..."
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
              <Tab value="all">Tutte ({mockAccreditations.length})</Tab>
              <Tab value="pending">Da Verificare ({pendingCount})</Tab>
              <Tab value="approved">Approvate</Tab>
              <Tab value="rejected">Rifiutate</Tab>
            </TabsList>
          </div>

          <TabsContent value="all">
            <AccreditationsTable accreditations={getFilteredAccreditations('all')} />
          </TabsContent>
          <TabsContent value="pending">
            <AccreditationsTable accreditations={getFilteredAccreditations('pending')} />
          </TabsContent>
          <TabsContent value="approved">
            <AccreditationsTable accreditations={getFilteredAccreditations('approved')} />
          </TabsContent>
          <TabsContent value="rejected">
            <AccreditationsTable accreditations={getFilteredAccreditations('rejected')} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

// Table component
interface Accreditation {
  id: string;
  company: string;
  type: string;
  contact: string;
  email: string;
  submittedAt: string;
  status: string;
}

const AccreditationsTable: React.FC<{ accreditations: Accreditation[] }> = ({ accreditations }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow hover={false}>
          <TableHead>Richiedente</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Data Richiesta</TableHead>
          <TableHead>Stato</TableHead>
          <TableHead align="right">Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accreditations.length === 0 ? (
          <TableEmpty message="Nessuna richiesta trovata" colSpan={5} />
        ) : (
          accreditations.map((acc) => (
            <TableRow key={acc.id}>
              <TableCell>
                <div className={styles.requesterInfo}>
                  <span className={styles.companyName}>{acc.company}</span>
                  <span className={styles.contactEmail}>{acc.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={acc.type === 'company' ? 'primary' : 'default'}>
                  {acc.type === 'company' ? 'Azienda' : 'Professionista'}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(acc.submittedAt)}</TableCell>
              <TableCell>
                <StatusBadge status={acc.status} />
              </TableCell>
              <TableCell align="right">
                <Link to={`/backoffice/accreditations/${acc.id}`}>
                  <Button variant="ghost" size="sm">
                    Esamina
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

export default AccreditationsPage;

