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
} from '../../../components/ui';
import styles from './CollaboratorsPage.module.css';

// Mock data
const mockCollaborators = [
  { id: '1', name: 'Laura Bianchi', email: 'laura.bianchi@email.com', status: 'APPROVED', role: 'Developer', joinedAt: '15/12/2025' },
  { id: '2', name: 'Marco Verdi', email: 'marco.verdi@email.com', status: 'SUBMITTED', role: 'Designer', joinedAt: '02/01/2026' },
  { id: '3', name: 'Anna Neri', email: 'anna.neri@email.com', status: 'APPROVED', role: 'Developer', joinedAt: '10/11/2025' },
  { id: '4', name: 'Giuseppe Russo', email: 'giuseppe.russo@email.com', status: 'UNDER_REVIEW', role: 'Analyst', joinedAt: '08/01/2026' },
];

export const CollaboratorsPage: React.FC = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCollaborators = mockCollaborators.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = () => {
    // In produzione: chiamata API
    console.log('Inviting:', inviteEmail, inviteName);
    setIsInviteModalOpen(false);
    setInviteEmail('');
    setInviteName('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Collaboratori</h1>
          <p className={styles.subtitle}>Gestisci i collaboratori associati alla tua azienda</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Invita Collaboratore
        </Button>
      </div>

      <Card padding="none">
        <div className={styles.toolbar}>
          <Input
            placeholder="Cerca per nome o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>Collaboratore</TableHead>
              <TableHead>Ruolo</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Data Invito</TableHead>
              <TableHead align="right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCollaborators.length === 0 ? (
              <TableEmpty message="Nessun collaboratore trovato" colSpan={5} />
            ) : (
              filteredCollaborators.map((collaborator) => (
                <TableRow key={collaborator.id}>
                  <TableCell>
                    <div className={styles.collaboratorInfo}>
                      <div className={styles.avatar}>
                        {collaborator.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <span className={styles.name}>{collaborator.name}</span>
                        <span className={styles.email}>{collaborator.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{collaborator.role}</TableCell>
                  <TableCell>
                    <StatusBadge status={collaborator.status} />
                  </TableCell>
                  <TableCell>{collaborator.joinedAt}</TableCell>
                  <TableCell align="right">
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} title="Visualizza profilo">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button className={styles.actionBtn} title="Rimuovi">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invita Collaboratore"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail}>
              Invia Invito
            </Button>
          </>
        }
      >
        <div className={styles.inviteForm}>
          <p className={styles.inviteDescription}>
            Inserisci i dati del collaboratore da invitare. Riceverà un'email con le istruzioni per completare la registrazione.
          </p>
          <Input
            label="Nome e Cognome"
            placeholder="Mario Rossi"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="collaboratore@email.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
        </div>
      </Modal>
    </div>
  );
};

export default CollaboratorsPage;

