import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  StatusBadge,
  Badge,
  Modal,
  Input,
} from '../../../components/ui';
import { formatDate } from '../../../lib/utils';
import styles from './OrderDetailPage.module.css';

// Mock data
const mockOrder = {
  id: '1',
  title: 'Sviluppo API REST',
  description: `Sviluppo di API REST per la piattaforma e-commerce. 
  
Le attività includono:
- Progettazione degli endpoint API
- Implementazione con Node.js/Express
- Integrazione con database PostgreSQL
- Documentazione OpenAPI/Swagger
- Test unitari e di integrazione`,
  client: 'Acme Corp',
  project: 'E-commerce Platform',
  status: 'SENT',
  startDate: '2026-01-05',
  endDate: '2026-02-28',
  createdAt: '2026-01-03',
  attachments: [
    { id: '1', name: 'Specifiche_Tecniche.pdf', size: '2.4 MB' },
    { id: '2', name: 'Diagramma_ER.png', size: '156 KB' },
  ],
};

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isAcknowledgeModalOpen, setIsAcknowledgeModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canAcknowledge = ['SENT'].includes(mockOrder.status);
  const isActive = ['ACKNOWLEDGED', 'IN_PROGRESS'].includes(mockOrder.status);

  const handleAcknowledge = async () => {
    setIsLoading(true);
    // In produzione: chiamata API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsAcknowledgeModalOpen(false);
    // Aggiornare lo stato
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/orders">Ordini di Lavoro</Link>
        <span>/</span>
        <span>{mockOrder.title}</span>
      </nav>

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{mockOrder.title}</h1>
          <div className={styles.meta}>
            <StatusBadge status={mockOrder.status} />
            <span className={styles.metaSeparator}>•</span>
            <span>Creato il {formatDate(mockOrder.createdAt)}</span>
          </div>
        </div>

        {canAcknowledge && (
          <Button onClick={() => setIsAcknowledgeModalOpen(true)}>
            Prendi in Carico
          </Button>
        )}
      </div>

      <div className={styles.grid}>
        {/* Main content */}
        <div className={styles.mainColumn}>
          <Card>
            <CardHeader>
              <CardTitle>Descrizione</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.description}>
                {mockOrder.description.split('\n').map((line, i) => (
                  <p key={i}>{line || <br />}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {mockOrder.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Allegati</CardTitle>
                <CardDescription>{mockOrder.attachments.length} file</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.attachments}>
                  {mockOrder.attachments.map((file) => (
                    <div key={file.id} className={styles.attachment}>
                      <div className={styles.attachmentIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14,2 14,8 20,8" />
                        </svg>
                      </div>
                      <div className={styles.attachmentInfo}>
                        <span className={styles.attachmentName}>{file.name}</span>
                        <span className={styles.attachmentSize}>{file.size}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Scarica
                      </Button>
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
              <CardTitle>Dettagli</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.details}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Cliente</span>
                  <span className={styles.detailValue}>{mockOrder.client}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Progetto</span>
                  <span className={styles.detailValue}>{mockOrder.project}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Data Inizio</span>
                  <span className={styles.detailValue}>{formatDate(mockOrder.startDate)}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Data Fine</span>
                  <span className={styles.detailValue}>{formatDate(mockOrder.endDate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {isActive && (
            <Card>
              <CardHeader>
                <CardTitle>Azioni</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.actions}>
                  <Link to="/invoices">
                    <Button variant="outline" fullWidth>
                      Carica Fattura
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Acknowledge Modal */}
      <Modal
        isOpen={isAcknowledgeModalOpen}
        onClose={() => setIsAcknowledgeModalOpen(false)}
        title="Prendi in Carico"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAcknowledgeModalOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleAcknowledge} isLoading={isLoading}>
              Conferma Presa in Carico
            </Button>
          </>
        }
      >
        <div className={styles.acknowledgeForm}>
          <p>
            Confermando, dichiari di aver preso visione dell'ordine di lavoro e di accettare l'incarico.
          </p>
          <Input
            label="Commento (opzionale)"
            placeholder="Aggiungi un commento..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetailPage;

