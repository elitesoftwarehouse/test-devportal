import React, { useEffect, useState } from 'react';
import type {
  ProfileQualityItem,
  ProfileQualityFilters
} from '../../api/profileQualityApi';
import { fetchProfileQualityList } from '../../api/profileQualityApi';
import './ProfileQualityList.css';

export interface ProfileQualityListProps {
  // Ruolo utente corrente, usato per verificare permessi e UX
  ruolo: 'UTENTE' | 'AMMINISTRATORE';
}

const defaultFilters: ProfileQualityFilters = {
  tipo: 'ALL',
  livelloCompletezza: 'ALL',
  orderBy: 'nome',
  order: 'asc'
};

const ProfileQualityList: React.FC<ProfileQualityListProps> = ({ ruolo }) => {
  const [filters, setFilters] = useState<ProfileQualityFilters>(defaultFilters);
  const [items, setItems] = useState<ProfileQualityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProfileQualityList(filters);
        if (!isCancelled) {
          setItems(data.items);
        }
      } catch (err) {
        if (!isCancelled) {
          setError('Errore durante il caricamento dei profili.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, [filters]);

  const handleFilterChange = (field: keyof ProfileQualityFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSortChange = (field: 'nome' | 'completezza') => {
    setFilters((prev) => {
      const isSameField = prev.orderBy === field;
      const newOrder: 'asc' | 'desc' = isSameField && prev.order === 'asc' ? 'desc' : 'asc';
      return {
        ...prev,
        orderBy: field,
        order: newOrder
      };
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedRowId((current) => (current === id ? null : id));
  };

  const renderCompletezzaBadge = (val: number) => {
    let label = '';
    let className = 'pq-badge';
    if (val >= 80) {
      label = 'Alta';
      className += ' pq-badge--alta';
    } else if (val >= 50) {
      label = 'Media';
      className += ' pq-badge--media';
    } else {
      label = 'Bassa';
      className += ' pq-badge--bassa';
    }
    return (
      <span className={className} aria-label={`Completezza ${label}`}>
        {val}%
      </span>
    );
  };

  const renderQualityIcon = (stato: ProfileQualityItem['statoQualita']) => {
    const baseClass = 'pq-status-icon';
    if (stato === 'OK') {
      return <span className={baseClass + ' pq-status-icon--ok'} aria-label="Qualità OK" />;
    }
    if (stato === 'WARNING') {
      return (
        <span
          className={baseClass + ' pq-status-icon--warning'}
          aria-label="Qualità da migliorare"
        />
      );
    }
    return (
      <span className={baseClass + ' pq-status-icon--ko'} aria-label="Qualità insufficiente" />
    );
  };

  return (
    <div className="pq-container" data-testid="profile-quality-view">
      <div className="pq-header">
        <h1>Qualità profili</h1>
        <p className="pq-subtitle">
          Vista unificata dei profili con indicatori di completezza. Ruolo corrente:{' '}
          <strong data-testid="pq-role">{ruolo === 'AMMINISTRATORE' ? 'Amministratore' : 'Utente standard'}</strong>
        </p>
      </div>

      <div className="pq-filters" data-testid="pq-filters">
        <div className="pq-filter-group">
          <label htmlFor="pq-filter-tipo">Tipo profilo</label>
          <select
            id="pq-filter-tipo"
            data-testid="pq-filter-tipo"
            value={filters.tipo || 'ALL'}
            onChange={(e) => handleFilterChange('tipo', e.target.value)}
          >
            <option value="ALL">Tutti</option>
            <option value="PROFESSIONISTA">Professionisti</option>
            <option value="AZIENDA">Aziende</option>
            <option value="COLLABORATORE">Collaboratori</option>
          </select>
        </div>

        <div className="pq-filter-group">
          <label htmlFor="pq-filter-completezza">Livello completezza</label>
          <select
            id="pq-filter-completezza"
            data-testid="pq-filter-completezza"
            value={filters.livelloCompletezza || 'ALL'}
            onChange={(e) => handleFilterChange('livelloCompletezza', e.target.value)}
          >
            <option value="ALL">Tutti</option>
            <option value="ALTA">Alta (>= 80%)</option>
            <option value="MEDIA">Media (>= 50%)</option>
            <option value="BASSA">Bassa (&lt; 50%)</option>
          </select>
        </div>
      </div>

      <div className="pq-table-wrapper" data-testid="pq-table-wrapper">
        {loading && <div className="pq-loading">Caricamento profili...</div>}
        {error && !loading && <div className="pq-error">{error}</div>}
        {!loading && !error && (
          <table className="pq-table" data-testid="pq-table">
            <thead>
              <tr>
                <th>
                  <button
                    type="button"
                    className="pq-sort-button"
                    onClick={() => handleSortChange('nome')}
                    data-testid="pq-sort-nome"
                  >
                    Nome
                    {filters.orderBy === 'nome' && (
                      <span className="pq-sort-indicator">
                        {filters.order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th>Tipo</th>
                <th>
                  <button
                    type="button"
                    className="pq-sort-button"
                    onClick={() => handleSortChange('completezza')}
                    data-testid="pq-sort-completezza"
                  >
                    Completezza
                    {filters.orderBy === 'completezza' && (
                      <span className="pq-sort-indicator">
                        {filters.order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th>Stato</th>
                <th>Dettagli campi mancanti</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="pq-empty" data-testid="pq-empty">
                    Nessun profilo trovato con i filtri selezionati.
                  </td>
                </tr>
              )}

              {items.map((item) => {
                const isExpanded = expandedRowId === item.id;
                const hasMissingFields = item.campiMancanti && item.campiMancanti.length > 0;
                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className="pq-row"
                      data-testid={`pq-row-${item.id}`}
                    >
                      <td>{item.nome}</td>
                      <td>{item.tipo}</td>
                      <td>{renderCompletezzaBadge(item.completezza)}</td>
                      <td>{renderQualityIcon(item.statoQualita)}</td>
                      <td>
                        {hasMissingFields ? (
                          <button
                            type="button"
                            className="pq-details-button"
                            onClick={() => toggleExpanded(item.id)}
                            aria-expanded={isExpanded}
                            data-testid={`pq-details-toggle-${item.id}`}
                          >
                            {isExpanded ? 'Nascondi dettagli' : 'Mostra dettagli'} ({
                              item.campiMancanti.length
                            })
                          </button>
                        ) : (
                          <span
                            className="pq-no-missing"
                            data-testid={`pq-no-missing-${item.id}`}
                          >
                            Profilo completo
                          </span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && hasMissingFields && (
                      <tr className="pq-row-details" data-testid={`pq-row-details-${item.id}`}>
                        <td colSpan={5}>
                          <div className="pq-details-panel">
                            <strong>Campi mancanti</strong>
                            <ul>
                              {item.campiMancanti.map((campo) => (
                                <li key={campo}>{campo}</li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <section className="pq-manual-checklist" aria-label="Checklist test manuali">
        <h2>Verifiche manuali consigliate</h2>
        <ol>
          <li>
            <strong>Responsive</strong>:
            <ul>
              <li>Desktop (&gt;= 1200px): verificare che tabella, filtri e badge siano leggibili.</li>
              <li>Tablet (~768px): tabella scrollabile orizzontalmente senza perdita di contenuto.</li>
              <li>Mobile (&lt;= 480px): colonne comprimibili, testo non sovrapposto.</li>
            </ul>
          </li>
          <li>
            <strong>Ruolo Utente standard</strong>:
            <ul>
              <li>
                Accedere come utente con ruolo <code>UTENTE</code> e verificare che le informazioni
                siano chiare ma non vengano mostrati controlli amministrativi.
              </li>
            </ul>
          </li>
          <li>
            <strong>Ruolo Amministratore</strong>:
            <ul>
              <li>
                Accedere come <code>AMMINISTRATORE</code> e verificare che i dati sensibili siano
                sempre nel rispetto dei permessi previsti dalla story.
              </li>
            </ul>
          </li>
        </ol>
      </section>
    </div>
  );
};

export default ProfileQualityList;
