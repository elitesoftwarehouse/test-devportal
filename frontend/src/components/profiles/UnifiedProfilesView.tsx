import React, { useEffect, useMemo, useState } from 'react';
import { fetchUnifiedProfiles, UnifiedProfile, UnifiedProfileQuery, ProfileType } from '../../api/profileUnifiedApi';
import '../../styles/UnifiedProfilesView.css';

export type UserRole = 'ADMIN' | 'USER';

interface UnifiedProfilesViewProps {
  currentUserRole: UserRole;
}

type OrderBy = 'name' | 'type' | 'quality' | 'status';

const defaultQuery: UnifiedProfileQuery = {
  type: 'ALL',
  orderBy: 'name',
  orderDir: 'asc',
};

const profileTypeLabels: Record<ProfileType, string> = {
  PROFESSIONISTA: 'Professionista',
  AZIENDA: 'Azienda',
  COLLABORATORE: 'Collaboratore',
  ALL: 'Tutti',
};

function qualityToClass(score: number): string {
  if (score >= 80) return 'quality-high';
  if (score >= 50) return 'quality-medium';
  return 'quality-low';
}

function qualityLabel(score: number): string {
  if (score >= 80) return 'Alta completezza';
  if (score >= 50) return 'Completezza media';
  return 'Completezza bassa';
}

const UnifiedProfilesView: React.FC<UnifiedProfilesViewProps> = ({ currentUserRole }) => {
  const [query, setQuery] = useState<UnifiedProfileQuery>(defaultQuery);
  const [qualityFilter, setQualityFilter] = useState<number | undefined>(undefined);
  const [profiles, setProfiles] = useState<UnifiedProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUserRole === 'ADMIN';

  const effectiveQuery: UnifiedProfileQuery = useMemo(
    () => ({
      ...query,
      qualityMin: qualityFilter,
    }),
    [query, qualityFilter]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchUnifiedProfiles(effectiveQuery);
        if (!cancelled) {
          setProfiles(res.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.error || 'Errore durante il caricamento dei profili.');
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
  }, [effectiveQuery]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ProfileType;
    setQuery(prev => ({ ...prev, type: value }));
  };

  const handleQualityFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      setQualityFilter(undefined);
    } else {
      setQualityFilter(Number(value));
    }
  };

  const handleOrderChange = (field: OrderBy) => {
    setQuery(prev => {
      const sameField = prev.orderBy === field;
      const nextDir = sameField && prev.orderDir === 'asc' ? 'desc' : 'asc';
      return {
        ...prev,
        orderBy: field,
        orderDir: nextDir,
      };
    });
  };

  const renderSortIndicator = (field: OrderBy) => {
    if (query.orderBy !== field) return null;
    return <span className="upv-sort-indicator">{query.orderDir === 'asc' ? '▲' : '▼'}</span>;
  };

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className={`upv-container ${isAdmin ? 'upv-admin' : 'upv-user'}`}>
      <div className="upv-header">
        <h2>Profili</h2>
        <div className="upv-filters">
          <div className="upv-filter-group">
            <label htmlFor="upv-type-filter">Tipo profilo</label>
            <select id="upv-type-filter" value={query.type || 'ALL'} onChange={handleTypeChange}>
              <option value="ALL">Tutti</option>
              <option value="PROFESSIONISTA">Professionisti</option>
              <option value="AZIENDA">Aziende</option>
              <option value="COLLABORATORE">Collaboratori</option>
            </select>
          </div>
          <div className="upv-filter-group">
            <label htmlFor="upv-quality-filter">Livello qualità minimo</label>
            <select id="upv-quality-filter" value={qualityFilter === undefined ? '' : String(qualityFilter)} onChange={handleQualityFilterChange}>
              <option value="">Nessun filtro</option>
              <option value="80">Alta (≥ 80%)</option>
              <option value="50">Media (≥ 50%)</option>
              <option value="1">Qualsiasi (&gt; 0%)</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="upv-state upv-loading">Caricamento profili in corso...</div>
      )}

      {error && !loading && (
        <div className="upv-state upv-error">{error}</div>
      )}

      {!loading && !error && profiles.length === 0 && (
        <div className="upv-state upv-empty">Nessun profilo trovato con i filtri selezionati.</div>
      )}

      {!loading && !error && profiles.length > 0 && (
        <div className="upv-table-wrapper">
          <table className="upv-table">
            <thead>
              <tr>
                <th onClick={() => handleOrderChange('name')} className="upv-sortable">
                  Nome / Ragione sociale
                  {renderSortIndicator('name')}
                </th>
                <th onClick={() => handleOrderChange('type')} className="upv-sortable upv-col-type">
                  Tipo profilo
                  {renderSortIndicator('type')}
                </th>
                <th className="upv-col-role">Ruolo (collaboratori)</th>
                <th>Contatto principale</th>
                <th onClick={() => handleOrderChange('status')} className="upv-sortable upv-col-status">
                  Stato
                  {renderSortIndicator('status')}
                </th>
                <th onClick={() => handleOrderChange('quality')} className="upv-sortable upv-col-quality">
                  Qualità dati
                  {renderSortIndicator('quality')}
                </th>
                {isAdmin && <th className="upv-col-admin">Dati fatturazione (Admin)</th>}
                <th className="upv-col-actions">Dettagli</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map(profile => {
                const qualityScore = profile.quality?.score ?? 0;
                const qualityClass = qualityToClass(qualityScore);
                const isExpanded = expandedId === profile.id;

                return (
                  <React.Fragment key={profile.id}>
                    <tr className={profile.active ? 'upv-row-active' : 'upv-row-inactive'}>
                      <td>
                        <div className="upv-name-cell">
                          <span className="upv-name-text">{profile.displayName}</span>
                        </div>
                      </td>
                      <td className="upv-col-type">
                        <span className="upv-badge upv-badge-type">{profileTypeLabels[profile.type]}</span>
                      </td>
                      <td className="upv-col-role">
                        {profile.type === 'COLLABORATORE' && profile.roleLabel ? (
                          <span className="upv-role-label">{profile.roleLabel}</span>
                        ) : (
                          <span className="upv-muted">-</span>
                        )}
                      </td>
                      <td>
                        <div className="upv-contact">
                          {profile.mainContact?.email && (
                            <div className="upv-contact-line">{profile.mainContact.email}</div>
                          )}
                          {profile.mainContact?.phone && (
                            <div className="upv-contact-line">{profile.mainContact.phone}</div>
                          )}
                          {!profile.mainContact?.email && !profile.mainContact?.phone && (
                            <span className="upv-muted">Nessun contatto principale</span>
                          )}
                        </div>
                      </td>
                      <td className="upv-col-status">
                        <span className={`upv-status-badge ${profile.active ? 'upv-status-active' : 'upv-status-inactive'}`}>
                          {profile.active ? 'Attivo' : 'Non attivo'}
                        </span>
                      </td>
                      <td className="upv-col-quality">
                        <div className="upv-quality-wrapper">
                          <span className={`upv-quality-indicator ${qualityClass}`} title={qualityLabel(qualityScore)} />
                          <span className="upv-quality-score">{qualityScore}%</span>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="upv-col-admin">
                          {profile.permissions?.canViewBilling && profile.billing ? (
                            <div className="upv-billing">
                              <div className="upv-billing-line">
                                <span className="upv-billing-label">P.IVA:</span>{' '}
                                <span>{profile.billing.vatNumber || '—'}</span>
                              </div>
                              <div className="upv-billing-line">
                                <span className="upv-billing-label">IBAN:</span>{' '}
                                <span>{profile.billing.iban || '—'}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="upv-muted">Non disponibile</span>
                          )}
                        </td>
                      )}
                      <td className="upv-col-actions">
                        <button
                          type="button"
                          className="upv-toggle-details"
                          onClick={() => toggleExpanded(profile.id)}
                        >
                          {isExpanded ? 'Nascondi' : 'Mostra'} campi mancanti
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="upv-details-row">
                        <td colSpan={isAdmin ? 8 : 7}>
                          {profile.quality?.missingFields && profile.quality.missingFields.length > 0 ? (
                            <div className="upv-missing-fields">
                              <span className="upv-missing-title">Campi chiave mancanti:</span>
                              <ul>
                                {profile.quality.missingFields.map(field => (
                                  <li key={field}>{field}</li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="upv-missing-fields upv-missing-none">Nessun campo chiave mancante.</div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UnifiedProfilesView;
