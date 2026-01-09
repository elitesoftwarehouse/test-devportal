import React, { useEffect, useState } from 'react';

/**
 * Semplice componente per consultare l'endpoint di profili unificati
 * e visualizzare percentuale di completezza e livello.
 */
export function ProfileCompletenessDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  async function fetchProfiles() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (typeFilter) {
        params.append('type', typeFilter);
      }
      const resp = await fetch(`/api/profiles?${params.toString()}`);
      if (!resp.ok) {
        throw new Error('Errore nel caricamento dei profili');
      }
      const json = await resp.json();
      setProfiles(json.data || []);
    } catch (e) {
      setError(e.message || 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ep-profiles-dashboard">
      <h2>Consultazione profili (qualità dati)</h2>

      <div className="ep-profiles-filters">
        <label>
          Tipo profilo:
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Tutti</option>
            <option value="PROFESSIONISTA">Professionisti</option>
            <option value="AZIENDA">Aziende</option>
            <option value="COLLABORATORE">Collaboratori</option>
          </select>
        </label>
      </div>

      {loading && <div>Caricamento profili...</div>}
      {error && <div className="ep-error">{error}</div>}

      {!loading && !error && (
        <table className="ep-profiles-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Completezza</th>
              <th>Livello</th>
              <th>Campi chiave mancanti</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => {
              const name =
                p.type === 'AZIENDA'
                  ? p.name
                  : [p.firstName, p.lastName].filter(Boolean).join(' ');

              const missing = (p.completeness && p.completeness.missingKeyFields) || [];

              return (
                <tr key={`${p.type}-${p.id}`}>
                  <td>{p.id}</td>
                  <td>{p.type}</td>
                  <td>{name}</td>
                  <td>{p.email || '-'}</td>
                  <td>{p.completeness ? `${p.completeness.percentage}%` : '-'}</td>
                  <td>{p.completeness ? p.completeness.level : '-'}</td>
                  <td>{missing.length ? missing.join(', ') : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProfileCompletenessDashboard;
