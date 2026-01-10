import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  uploadCollaboratorCv,
  deleteCollaboratorCv,
  getCollaboratorCvs,
  getCollaboratorCvHistory,
} from '../../api/collaboratorCvApi';
import './CollaboratorCvManager.css';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const CollaboratorCvManager = ({ collaboratorId }) => {
  const [cvs, setCvs] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [current, hist] = await Promise.all([
        getCollaboratorCvs(collaboratorId),
        getCollaboratorCvHistory(collaboratorId),
      ]);
      setCvs(current);
      setHistory(hist);
    } catch (e) {
      setError('Errore nel caricamento dei CV');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collaboratorId]);

  const handleFileChange = (e) => {
    setError('');
    setSuccess('');
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('Il file selezionato supera la dimensione massima consentita (10MB)');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Selezionare un file CV');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await uploadCollaboratorCv(collaboratorId, selectedFile);
      setSelectedFile(null);
      (document.getElementById('cv-upload-input') as HTMLInputElement).value = '';
      setSuccess('CV caricato correttamente');
      await loadData();
    } catch (e) {
      setError('Errore durante il caricamento del CV');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cvId) => {
    if (!window.confirm('Confermi l\'eliminazione logica di questo CV?')) {
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await deleteCollaboratorCv(collaboratorId, cvId);
      setSuccess('CV eliminato logicamente');
      await loadData();
    } catch (e) {
      setError('Errore durante l\'eliminazione del CV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cv-manager">
      <h3>Gestione CV collaboratore</h3>
      <form className="cv-upload-form" onSubmit={handleUpload}>
        <input
          id="cv-upload-input"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !selectedFile}>
          Carica / Sostituisci CV corrente
        </button>
      </form>
      {error && <div className="cv-alert cv-alert-error">{error}</div>}
      {success && <div className="cv-alert cv-alert-success">{success}</div>}
      {loading && <div className="cv-loading">Operazione in corso...</div>}

      <div className="cv-section">
        <h4>CV attivi</h4>
        {cvs.length === 0 && <div className="cv-empty">Nessun CV caricato</div>}
        {cvs.length > 0 && (
          <table className="cv-table">
            <thead>
              <tr>
                <th>Nome file</th>
                <th>Tipo</th>
                <th>Dimensione (KB)</th>
                <th>Corrente</th>
                <th>Caricato il</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {cvs.map((cv) => (
                <tr key={cv.id}>
                  <td>{cv.originalFileName}</td>
                  <td>{cv.mimeType}</td>
                  <td>{Math.round(cv.fileSize / 1024)}</td>
                  <td>{cv.isCurrent ? 'Sì' : 'No'}</td>
                  <td>{cv.createdAt ? new Date(cv.createdAt).toLocaleString() : ''}</td>
                  <td>
                    <button
                      type="button"
                      className="cv-btn-delete"
                      onClick={() => handleDelete(cv.id)}
                      disabled={loading}
                    >
                      Elimina logica
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="cv-section">
        <h4>Storico CV (inclusi eliminati)</h4>
        {history.length === 0 && <div className="cv-empty">Nessun CV in storico</div>}
        {history.length > 0 && (
          <table className="cv-table cv-table-history">
            <thead>
              <tr>
                <th>Nome file</th>
                <th>Corrente</th>
                <th>Eliminato</th>
                <th>Caricato il</th>
                <th>Ultima modifica</th>
              </tr>
            </thead>
            <tbody>
              {history.map((cv) => (
                <tr key={cv.id}>
                  <td>{cv.originalFileName}</td>
                  <td>{cv.isCurrent ? 'Sì' : 'No'}</td>
                  <td>{cv.isDeleted ? 'Sì' : 'No'}</td>
                  <td>{cv.createdAt ? new Date(cv.createdAt).toLocaleString() : ''}</td>
                  <td>{cv.updatedAt ? new Date(cv.updatedAt).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

CollaboratorCvManager.propTypes = {
  collaboratorId: PropTypes.number.isRequired,
};

export default CollaboratorCvManager;
