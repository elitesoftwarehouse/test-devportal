import React, { useEffect, useState } from 'react';

export function CollaboratorCvManager({ collaboratorId }) {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);

  const loadCvs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/collaborators/${collaboratorId}/cv`);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Errore nel caricamento dei CV.');
      }
      const data = await response.json();
      setCvs(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (collaboratorId) {
      loadCvs();
    }
  }, [collaboratorId]);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Selezionare un file per il caricamento.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`/api/collaborators/${collaboratorId}/cv`, {
        method: 'POST',
        body: formData
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'Errore durante il caricamento del CV.');
      }
      setFile(null);
      await loadCvs();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cvId) => {
    if (!window.confirm('Confermi l\'eliminazione logica del CV selezionato?')) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/collaborators/${collaboratorId}/cv/${cvId}`, {
        method: 'DELETE'
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'Errore durante l\'eliminazione del CV.');
      }
      await loadCvs();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cv-manager">
      <h3>Gestione CV collaboratore #{collaboratorId}</h3>
      {error && <div className="cv-manager__error">{error}</div>}
      <form className="cv-manager__upload" onSubmit={handleUpload}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
        />
        <button type="submit" disabled={loading}>
          Carica nuovo CV
        </button>
      </form>
      {loading && <div className="cv-manager__loading">Caricamento in corso...</div>}
      <table className="cv-manager__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome file</th>
            <th>Corrente</th>
            <th>Eliminato</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {cvs.length === 0 && !loading && (
            <tr>
              <td colSpan={5}>Nessun CV disponibile per questo collaboratore.</td>
            </tr>
          )}
          {cvs.map((cv) => (
            <tr key={cv.id}>
              <td>{cv.id}</td>
              <td>{cv.fileName}</td>
              <td>{cv.isCurrent ? 'Sì' : 'No'}</td>
              <td>{cv.isDeleted ? 'Sì' : 'No'}</td>
              <td>
                {!cv.isDeleted && (
                  <button type="button" onClick={() => handleDelete(cv.id)} disabled={loading}>
                    Elimina logicamente
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CollaboratorCvManager;
