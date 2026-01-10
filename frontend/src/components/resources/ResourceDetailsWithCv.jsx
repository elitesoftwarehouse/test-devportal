import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getResourceDetails } from '../../api/resourcesApi';
import './ResourceDetailsWithCv.css';

function ResourceDetailsWithCv({ resourceId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!resourceId) {
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await getResourceDetails(resourceId);
        if (!cancelled) {
          setData(result);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.status === 403 ? 'Permesso negato' : 'Errore nel caricamento dei dati');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [resourceId]);

  if (!resourceId) {
    return <div className="resource-details">Seleziona una risorsa per visualizzare i dettagli.</div>;
  }

  if (loading) {
    return <div className="resource-details">Caricamento dettagli risorsa...</div>;
  }

  if (error) {
    return <div className="resource-details resource-details-error">{error}</div>;
  }

  if (!data) {
    return null;
  }

  const fullName = `${data.nome || ''} ${data.cognome || ''}`.trim();

  return (
    <div className="resource-details">
      <div className="resource-header">
        <h2>{fullName || 'Risorsa'}</h2>
        <div className="resource-header-meta">
          {data.ruolo && <span className="resource-badge">{data.ruolo}</span>}
          {data.seniority && <span className="resource-badge">{data.seniority}</span>}
          {data.stato && <span className="resource-status">{data.stato}</span>}
          {data.azienda && (
            <span className="resource-company">{data.azienda.ragioneSociale}</span>
          )}
        </div>
      </div>

      <div className="resource-section">
        <h3>Skill tecniche</h3>
        {(!data.skillTecniche || data.skillTecniche.length === 0) && (
          <div className="resource-empty">Nessuna skill tecnica registrata.</div>
        )}
        {data.skillTecniche && data.skillTecniche.length > 0 && (
          <table className="resource-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Livello</th>
                <th>Anni esperienza</th>
              </tr>
            </thead>
            <tbody>
              {data.skillTecniche.map((s) => (
                <tr key={s.id}>
                  <td>{s.nome}</td>
                  <td>{s.categoria}</td>
                  <td>{s.livello}</td>
                  <td>{s.anniEsperienza}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="resource-section">
        <h3>Soft skill</h3>
        {(!data.softSkill || data.softSkill.length === 0) && (
          <div className="resource-empty">Nessuna soft skill registrata.</div>
        )}
        {data.softSkill && data.softSkill.length > 0 && (
          <table className="resource-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Livello</th>
                <th>Anni esperienza</th>
              </tr>
            </thead>
            <tbody>
              {data.softSkill.map((s) => (
                <tr key={s.id}>
                  <td>{s.nome}</td>
                  <td>{s.categoria}</td>
                  <td>{s.livello}</td>
                  <td>{s.anniEsperienza}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="resource-section">
        <h3>Curriculum (CV)</h3>
        {(!data.cvs || data.cvs.length === 0) && (
          <div className="resource-empty">Nessun CV associato alla risorsa.</div>
        )}
        {data.cvs && data.cvs.length > 0 && (
          <table className="resource-table">
            <thead>
              <tr>
                <th>Titolo / Nome file</th>
                <th>Lingua</th>
                <th>Principale</th>
                <th>Dimensione</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {data.cvs.map((cv) => (
                <tr key={cv.id}>
                  <td>
                    <div className="resource-cv-title">{cv.titolo || cv.nomeFile}</div>
                    {cv.titolo && <div className="resource-cv-filename">{cv.nomeFile}</div>}
                  </td>
                  <td>{cv.lingua}</td>
                  <td>{cv.principale ? 'Sì' : 'No'}</td>
                  <td>{cv.dimensione ? `${(cv.dimensione / 1024).toFixed(1)} KB` : '-'}</td>
                  <td>
                    {cv.downloadUrl && (
                      <a
                        href={cv.downloadUrl}
                        className="resource-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Scarica
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

ResourceDetailsWithCv.propTypes = {
  resourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default ResourceDetailsWithCv;
