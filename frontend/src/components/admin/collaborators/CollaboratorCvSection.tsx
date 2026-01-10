import React, { useEffect, useState, useCallback } from 'react';
import { AdminCollaboratorCv, AdminCollaboratorCvStatus } from '../../../types/adminCollaboratorCvTypes';
import { fetchCollaboratorCvs, uploadCollaboratorCv, deleteCollaboratorCv } from '../../../api/adminCollaboratorCvApi';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { Button } from '../../common/Button';
import { Table } from '../../common/Table';
import { Modal } from '../../common/Modal';
import { Spinner } from '../../common/Spinner';
import { formatDateTime } from '../../../utils/formatters';
import './CollaboratorCvSection.css';

interface CollaboratorCvSectionProps {
  collaboratorId: string;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const CollaboratorCvSection: React.FC<CollaboratorCvSectionProps> = ({ collaboratorId }) => {
  const { user } = useCurrentUser();
  const isAdmin = !!user && Array.isArray(user.roles) && user.roles.includes('ADMIN');

  const [cvs, setCvs] = useState<AdminCollaboratorCv[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminCollaboratorCv | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCollaboratorCvs(collaboratorId);
      setCvs(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Errore nel caricamento dei CV');
    } finally {
      setLoading(false);
    }
  }, [collaboratorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return 'Formato non valido. Sono ammessi solo PDF o Word.';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return 'File troppo grande. Dimensione massima 10MB.';
    }
    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setUploadError(null);
    if (file) {
      const err = validateFile(file);
      if (err) {
        setUploadError(err);
        setUploadFile(null);
      } else {
        setUploadFile(file);
      }
    } else {
      setUploadFile(null);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setUploadError('Seleziona un file da caricare.');
      return;
    }
    const err = validateFile(uploadFile);
    if (err) {
      setUploadError(err);
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const hasCurrent = cvs.some((cv) => cv.status === 'CURRENT');
      if (hasCurrent) {
        if (!window.confirm('Stai sostituendo il CV corrente. Il nuovo file diventerà il CV corrente e i precedenti resteranno nello storico. Vuoi continuare?')) {
          setUploading(false);
          return;
        }
      }
      const resp = await uploadCollaboratorCv(collaboratorId, uploadFile);
      setCvs((prev) => {
        const updated = prev.map((cv) =>
          cv.status === 'CURRENT' ? { ...cv, status: 'HISTORIC' as AdminCollaboratorCvStatus } : cv
        );
        return [resp, ...updated];
      });
      setShowUploadModal(false);
      setUploadFile(null);
      alert('CV caricato con successo.');
    } catch (e: any) {
      setUploadError(e?.response?.data?.message || 'Errore durante il caricamento del CV.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCollaboratorCv(collaboratorId, deleteTarget.id);
      setCvs((prev) => prev.map((cv) => (cv.id === deleteTarget.id ? { ...cv, status: 'DELETED' } : cv)));
      setDeleteTarget(null);
      alert('CV eliminato logicamente.');
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Errore durante l\'eliminazione del CV.');
    } finally {
      setDeleting(false);
    }
  };

  const renderStatus = (status: AdminCollaboratorCvStatus) => {
    switch (status) {
      case 'CURRENT':
        return 'Corrente';
      case 'HISTORIC':
        return 'Storico';
      case 'DELETED':
        return 'Eliminato';
      default:
        return status;
    }
  };

  return (
    <section className="collaborator-cv-section">
      <header className="collaborator-cv-section__header">
        <h3>CV collaboratore</h3>
        {isAdmin && (
          <Button size="small" variant="primary" onClick={() => setShowUploadModal(true)} disabled={loading}>
            Carica nuovo CV
          </Button>
        )}
      </header>

      {loading && (
        <div className="collaborator-cv-section__loading">
          <Spinner /> Caricamento CV...
        </div>
      )}

      {error && !loading && <div className="collaborator-cv-section__error">{error}</div>}

      {!loading && cvs.length === 0 && !error && (
        <div className="collaborator-cv-section__empty">Nessun CV caricato.</div>
      )}

      {!loading && cvs.length > 0 && (
        <Table
          columns=[
            { key: 'fileName', header: 'Nome file' },
            { key: 'uploadedAt', header: 'Data caricamento' },
            { key: 'uploadedBy', header: 'Caricato da' },
            { key: 'status', header: 'Stato' },
            { key: 'actions', header: 'Azioni' },
          ]
          rows={cvs.map((cv) => ({
            key: cv.id,
            cells: {
              fileName: cv.fileName,
              uploadedAt: formatDateTime(cv.uploadedAt),
              uploadedBy: cv.uploadedBy?.displayName || '-',
              status: (
                <span className={`collaborator-cv-section__status collaborator-cv-section__status--${cv.status.toLowerCase()}`}>
                  {renderStatus(cv.status)}
                </span>
              ),
              actions: (
                <div className="collaborator-cv-section__actions">
                  {isAdmin && cv.status !== 'DELETED' && (
                    <Button
                      size="xsmall"
                      variant="dangerGhost"
                      onClick={() => setDeleteTarget(cv)}
                      disabled={deleting}
                    >
                      Elimina
                    </Button>
                  )}
                </div>
              ),
            },
          }))}
        />
      )}

      {showUploadModal && (
        <Modal title="Carica nuovo CV" onClose={() => !uploading && setShowUploadModal(false)}>
          <div className="collaborator-cv-section__upload-modal">
            <p className="collaborator-cv-section__upload-info">
              Seleziona il file del CV da caricare. Formati ammessi: PDF, Word. Dimensione massima: 10MB.
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {uploadFile && (
              <div className="collaborator-cv-section__upload-file-name">
                File selezionato: <strong>{uploadFile.name}</strong>
              </div>
            )}
            {uploadError && <div className="collaborator-cv-section__error">{uploadError}</div>}
            <div className="collaborator-cv-section__upload-actions">
              <Button variant="secondary" onClick={() => setShowUploadModal(false)} disabled={uploading}>
                Annulla
              </Button>
              <Button variant="primary" onClick={handleUpload} disabled={uploading || !uploadFile}>
                {uploading ? 'Caricamento...' : 'Carica'}
              </Button>
            </div>
            {cvs.some((cv) => cv.status === 'CURRENT') && (
              <div className="collaborator-cv-section__upload-warning">
                Attenzione: il nuovo file sostituirà il CV corrente. I CV precedenti saranno mantenuti nello storico.
              </div>
            )}
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Conferma eliminazione CV" onClose={() => !deleting && setDeleteTarget(null)}>
          <div className="collaborator-cv-section__delete-modal">
            <p>
              Stai per eliminare logicamente il CV <strong>{deleteTarget.fileName}</strong>.
            </p>
            <p>
              Il file non sarà più visibile come attivo ma resterà nello storico interno del sistema.
            </p>
            <p>Vuoi continuare?</p>
            <div className="collaborator-cv-section__upload-actions">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Annulla
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting ? 'Eliminazione...' : 'Elimina'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {!isAdmin && (
        <div className="collaborator-cv-section__readonly-hint">
          Non hai i permessi per modificare i CV del collaboratore. Visualizzazione sola lettura.
        </div>
      )}
    </section>
  );
};

export default CollaboratorCvSection;
