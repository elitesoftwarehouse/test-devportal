import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Pannello semplice per testare manualmente la ricerca risorse
 * con combinazioni di nome, ruolo, skills e modalità ANY/ALL.
 */
export const ResourceSearchDebugPanel = ({ apiBaseUrl, authToken }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState('');
  const [skillsMatchMode, setSkillsMatchMode] = useState('ANY');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (name.trim()) params.append('name', name.trim());
    if (role.trim()) params.append('role', role.trim());
    if (skills.trim()) params.append('skills', skills.trim());
    if (skillsMatchMode) params.append('skillsMatchMode', skillsMatchMode);
    params.append('page', String(page || 1));
    params.append('pageSize', String(pageSize || 10));

    try {
      const response = await fetch(`${apiBaseUrl}/resources/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        }
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || `Errore API (${response.status})`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Errore imprevisto');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resource-search-debug-panel">
      <h3>Debug ricerca risorse</h3>
      <form onSubmit={handleSearch} className="resource-search-debug-form">
        <div className="form-row">
          <label>
            Nome
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Mario"
            />
          </label>
          <label>
            Ruolo
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Es. Developer"
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Skills (separate da virgola)
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Es. Java,React,SQL"
            />
          </label>
          <label>
            Modalità skills
            <select
              value={skillsMatchMode}
              onChange={(e) => setSkillsMatchMode(e.target.value)}
            >
              <option value="ANY">ANY (almeno una skill)</option>
              <option value="ALL">ALL (tutte le skill)</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Pagina
            <input
              type="number"
              min="1"
              value={page}
              onChange={(e) => setPage(Number(e.target.value) || 1)}
            />
          </label>
          <label>
            Dimensione pagina
            <input
              type="number"
              min="1"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value) || 10)}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Ricerca in corso...' : 'Esegui ricerca'}
          </button>
        </div>
      </form>
      {error && <div className="error-message">{error}</div>}
      {result && (
        <div className="result-preview">
          <h4>Risultato</h4>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

ResourceSearchDebugPanel.propTypes = {
  apiBaseUrl: PropTypes.string.isRequired,
  authToken: PropTypes.string
};

export default ResourceSearchDebugPanel;
