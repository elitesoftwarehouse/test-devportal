import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  StatusBadge,
  Badge,
  Input,
  Modal,
} from '../../../components/ui';
import { formatDate } from '../../../lib/utils';
import styles from './AccreditationDetailPage.module.css';

// Mock data
const mockAccreditation = {
  id: '1',
  company: 'Tech Innovators Srl',
  type: 'company',
  status: 'SUBMITTED',
  submittedAt: '2026-01-09',
  contact: {
    name: 'Mario Rossi',
    email: 'mario@techinnovators.it',
    phone: '+39 333 1234567',
  },
  companyData: {
    name: 'Tech Innovators Srl',
    piva: '12345678901',
    address: 'Via della Tecnologia 42, 20100 Milano',
    pec: 'techinnovators@pec.it',
  },
  documents: [
    { id: '1', name: 'Visura Camerale', status: 'uploaded', fileName: 'visura_camerale.pdf' },
    { id: '2', name: 'Documento Identità', status: 'uploaded', fileName: 'doc_identita.pdf' },
    { id: '3', name: 'NDA Firmato', status: 'missing', fileName: null },
  ],
  collaborators: [
    { id: '1', name: 'Laura Bianchi', email: 'laura@techinnovators.it', role: 'Developer' },
    { id: '2', name: 'Marco Verdi', email: 'marco@techinnovators.it', role: 'Designer' },
  ],
};

export const AccreditationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canDecide = ['SUBMITTED', 'UNDER_REVIEW'].includes(mockAccreditation.status);

  const handleApprove = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsApproveModalOpen(false);
    navigate('/backoffice/accreditations');
  };

  const handleReject = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsRejectModalOpen(false);
    navigate('/backoffice/accreditations');
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/backoffice/accreditations">Accreditamenti</Link>
        <span>/</span>
        <span>{mockAccreditation.company}</span>
      </nav>

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{mockAccreditation.company}</h1>
            <Badge variant={mockAccreditation.type === 'company' ? 'primary' : 'default'}>
              {mockAccreditation.type === 'company' ? 'Azienda' : 'Professionista'}
            </Badge>
          </div>
          <div className={styles.meta}>
            <StatusBadge status={mockAccreditation.status} />
            <span className={styles.metaSeparator}>•</span>
            <span>Ricevuta il {formatDate(mockAccreditation.submittedAt)}</span>
          </div>
        </div>

        {canDecide && (
          <div className={styles.headerActions}>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(true)}>
              Rifiuta
            </Button>
            <Button onClick={() => setIsApproveModalOpen(true)}>
              Approva
            </Button>
          </div>
        )}
      </div>

      <div className={styles.grid}>
        {/* Main content */}
        <div className={styles.mainColumn}>
          {/* Company Data */}
          <Card>
            <CardHeader>
              <CardTitle>Dati Aziendali</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.dataGrid}>
                <div className={styles.dataItem}>
                  <span className={styles.dataLabel}>Ragione Sociale</span>
                  <span className={styles.dataValue}>{mockAccreditation.companyData.name}</span>
                </div>
                <div className={styles.dataItem}>
                  <span className={styles.dataLabel}>Partita IVA</span>
                  <span className={styles.dataValue}>{mockAccreditation.companyData.piva}</span>
                </div>
                <div className={styles.dataItem}>
                  <span className={styles.dataLabel}>Indirizzo</span>
                  <span className={styles.dataValue}>{mockAccreditation.companyData.address}</span>
                </div>
                <div className={styles.dataItem}>
                  <span className={styles.dataLabel}>PEC</span>
                  <span className={styles.dataValue}>{mockAccreditation.companyData.pec}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documentazione</CardTitle>
              <CardDescription>Documenti allegati alla richiesta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.documents}>
                {mockAccreditation.documents.map((doc) => (
                  <div key={doc.id} className={styles.document}>
                    <div className={styles.documentIcon}>
                      {doc.status === 'uploaded' ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22,4 12,14.01 9,11.01" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      )}
                    </div>
                    <div className={styles.documentInfo}>
                      <span className={styles.documentName}>{doc.name}</span>
                      <span className={styles.documentStatus}>
                        {doc.status === 'uploaded' ? doc.fileName : 'Non caricato'}
                      </span>
                    </div>
                    {doc.status === 'uploaded' && (
                      <Button variant="ghost" size="sm">
                        Visualizza
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Collaborators */}
          {mockAccreditation.collaborators.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Collaboratori Dichiarati</CardTitle>
                <CardDescription>{mockAccreditation.collaborators.length} collaboratori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.collaborators}>
                  {mockAccreditation.collaborators.map((coll) => (
                    <div key={coll.id} className={styles.collaborator}>
                      <div className={styles.collaboratorAvatar}>
                        {coll.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className={styles.collaboratorInfo}>
                        <span className={styles.collaboratorName}>{coll.name}</span>
                        <span className={styles.collaboratorEmail}>{coll.email}</span>
                      </div>
                      <Badge variant="default">{coll.role}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className={styles.sideColumn}>
          <Card>
            <CardHeader>
              <CardTitle>Contatto Referente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.contact}>
                <div className={styles.contactAvatar}>
                  {mockAccreditation.contact.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className={styles.contactInfo}>
                  <span className={styles.contactName}>{mockAccreditation.contact.name}</span>
                  <a href={`mailto:${mockAccreditation.contact.email}`} className={styles.contactEmail}>
                    {mockAccreditation.contact.email}
                  </a>
                  <span className={styles.contactPhone}>{mockAccreditation.contact.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approva Accreditamento"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleApprove} isLoading={isLoading}>
              Conferma Approvazione
            </Button>
          </>
        }
      >
        <p className={styles.modalText}>
          Stai per approvare la richiesta di accreditamento di <strong>{mockAccreditation.company}</strong>.
          L'utente riceverà una notifica via email e potrà accedere al portale.
        </p>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Rifiuta Accreditamento"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Annulla
            </Button>
            <Button variant="danger" onClick={handleReject} isLoading={isLoading}>
              Conferma Rifiuto
            </Button>
          </>
        }
      >
        <div className={styles.rejectForm}>
          <p className={styles.modalText}>
            Stai per rifiutare la richiesta di accreditamento di <strong>{mockAccreditation.company}</strong>.
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

export default AccreditationDetailPage;

