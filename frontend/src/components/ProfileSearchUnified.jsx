import React, { useEffect, useState } from 'react';
import { fetchUnifiedProfiles } from '../api/profileApi';
import ProfileQualityBadge from './ProfileQualityBadge';
import './ProfileSearchUnified.css';

export function ProfileSearchUnified() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');
  const [active, setActive] = useState(true);
  const [meta, setMeta] = useState({ profileTypeOptions: [], qualityLevels: [] });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUnifiedProfiles({
        type,
        search: search || undefined,
        active,
        limit: 50,
        offset: 0,
      });
      setProfiles(data.data);
      setMeta(data.meta);
    } catch (e) {
      setError(e.message || 'Errore imprevisto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="profile-search-unified">
      <h2>Consultazione profili</h2>
      <form className="profile-search-unified__filters" onSubmit={onSubmit}>
        <div className="profile-search-unified__field">
          <label htmlFor="profile-search">Ricerca</label>
          <input
            id="profile-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome, cognome, ragione sociale, email..."
          />
        </div>

        <div className="profile-search-unified__field">
          <label htmlFor="profile-type">Tipo profilo</label>
          <select
            id="profile-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {meta.profileTypeOptions && meta.profileTypeOptions.length > 0 ? (
              meta.profileTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            ) : (
              <>
                <option value="ALL">Tutti i profili</option>
                <option value="PROFESSIONISTA">Professionisti</option>
                <option value="AZIENDA">Aziende</option>
                <option value="COLLABORATORE">Collaboratori</option>
              </>
            )}
          </select>
        </div>

        <div className="profile-search-unified__field profile-search-unified__field--checkbox">
          <label htmlFor="profile-active">
            <input
              id="profile-active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Mostra solo attivi
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Caricamento...' : 'Cerca'}
        </button>
      </form>

      {error && <div className="profile-search-unified__error">{error}</div>}

      <div className="profile-search-unified__results">
        {loading && <div>Caricamento profili...</div>}
        {!loading && profiles.length === 0 && !error && (
          <div>Nessun profilo trovato.</div>
        )}
        {!loading && profiles.length > 0 && (
          <table className="profile-search-unified__table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Nome / Ragione sociale</th>
                <th>Ruolo</th>
                <th>Azienda</th>
                <th>Contatti</th>
                <th>Stato</th>
                <th>Qualità</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={`${p.profileType}-${p.id}`}>
                  <td>{p.meta?.profileTypeLabel || p.profileType}</td>
                  <td>{p.name}</td>
                  <td>{p.role || '-'}</td>
                  <td>{p.companyName || '-'}</td>
                  <td>
                    <div>{p.mainContacts?.email || '-'}</div>
                    <div>{p.mainContacts?.phone || '-'}</div>
                  </td>
                  <td>{p.isActive ? 'Attivo' : 'Non attivo'}</td>
                  <td>
                    <ProfileQualityBadge quality={p.quality} />
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

export default ProfileSearchUnified;
