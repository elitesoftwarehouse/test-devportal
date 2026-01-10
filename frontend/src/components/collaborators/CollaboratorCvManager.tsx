import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import {
  CollaboratorCv,
  fetchCollaboratorCvs,
  uploadCollaboratorCv,
  setCollaboratorCvAsCorrente,
  softDeleteCollaboratorCv,
} from '../../api/collaboratorCvApi';
import './CollaboratorCvManager.css';

interface Props {
  collaboratorId: string;
}

export const CollaboratorCvManager: React.FC<Props> = ({ collaboratorId }) => {
  const [cvs, setCvs] = useState<CollaboratorCv[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [versionLabel, setVersionLabel] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [flagIsCorrente, setFlagIsCorrente] = useState<boolean>(true);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCollaboratorCvs(collaboratorId, { includeDeleted: false });
      setCvs(data);
    } catch (err: any) {
      setError(err.message || 'Errore nel caricamento dei CV');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (collaboratorId) {
      loadData();
    }
  }, [collaboratorId]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Selezionare un file CV da caricare');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await uploadCollaboratorCv(collaboratorId, {
        file,
        versionLabel: versionLabel || undefined,
        note: note || undefined,
        flagIsCorrente,
      });
      setFile(null);
      setVersionLabel('');
      setNote('');
      setFlagIsCorrente(true);
      (document.getElementById('cv-file-input') as HTMLInputElement | null)?.value &&
        ((document.getElementById('cv-file-input') as HTMLInputElement).value = '');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Errore durante il caricamento del CV');
    } finally {
      setLoading(false);
    }
  };

  const handleSetCorrente = async (cvId: string) => {
    try {
      setLoading(true);
      setError(null);
      await setCollaboratorCvAsCorrente(collaboratorId, cvId);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Errore durante la marcatura del CV come corrente');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cvId: string) => {
    if (!window.confirm('Confermi l\'eliminazione logica di questo CV?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await softDeleteCollaboratorCv(collaboratorId, cvId);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'eliminazione del CV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cv-manager">
      <h3>CV Collaboratore</h3>

      <form className="cv-upload-form" onSubmit={handleUpload}>
        <div className="cv-upload-row">
          <label htmlFor="cv-file-input">File CV</label>
          <input id="cv-file-input" type="file" onChange={handleFileChange} />
        </div>
        <div className="cv-upload-row">
          <label>Versione</label>
          <input
            type="text"
            value={versionLabel}
            onChange={(e) => setVersionLabel(e.target.value)}
            placeholder="Esempio: v1, v2, Italiano, Inglese"
          />
        </div>
        <div className="cv-upload-row">
          <label>Note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note opzionali"
          />
        </div>
        <div className="cv-upload-row cv-upload-row-inline">
          <label>
            <input
              type="checkbox"
              checked={flagIsCorrente}
              onChange={(e) => setFlagIsCorrente(e.target.checked)}
            />
            Imposta come CV corrente
          </label>
        </div>
        <div className="cv-upload-actions">
          <button type="submit" disabled={loading}>
            Carica CV
          </button>
        </div>
      </form>

      {error && <div className="cv-error">{error}</div>}

      {loading && <div className="cv-loading">Caricamento...</div>}

      <table className="cv-table">
        <thead>
          <tr>
            <th>File</th>
            <th>Versione</th>
            <th>Note</th>
            <th>Corrente</th>
            <th>Dimensione</th>
            <th>Creato il</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {cvs.length === 0 && !loading && (
            <tr>
              <td colSpan={7} className="cv-empty">
                Nessun CV caricato per questo collaboratore.
              </td>
            </tr>
          )}
          {cvs.map((cv) => (
            <tr key={cv.id}>
              <td>{cv.fileName}</td>
              <td>{cv.versionLabel || '-'}</td>
              <td>{cv.note || '-'}</td>
              <td>{cv.flagIsCorrente ? 'Sì' : 'No'}</td>
              <td>{(cv.fileSize / 1024).toFixed(1)} KB</td>
              <td>{new Date(cv.createdAt).toLocaleString()}</td>
              <td>
                {!cv.flagIsCorrente && !cv.flagIsDeleted && (
                  <button
                    type="button"
                    className="cv-action"
                    onClick={() => handleSetCorrente(cv.id)}
                    disabled={loading}
                  >
                    Imposta come corrente
                  </button>
                )}
                {!cv.flagIsDeleted && (
                  <button
                    type="button"
                    className="cv-action cv-action-danger"
                    onClick={() => handleDelete(cv.id)}
                    disabled={loading}
                  >
                    Elimina
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CollaboratorCvManager;
