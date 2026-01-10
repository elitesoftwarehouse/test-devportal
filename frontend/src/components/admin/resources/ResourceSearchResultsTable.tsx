import React from 'react';
import { AdminResourceSummaryDto } from '../../../api/admin/resourcesSearchApi';

interface Props {
  items: AdminResourceSummaryDto[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

/**
 * Tabella risultati ricerca risorse.
 *
 * Mostra:
 * - Nome completo
 * - Ruolo
 * - Elenco sintetico skills chiave (prime 3 + indicatore "+x" per le restanti)
 *
 * Gestisce gli stati di loading, empty, errore e paginazione client-side basata
 * sui metadati (page, totalPages, totalItems) restituiti dall'API.
 */
export const ResourceSearchResultsTable: React.FC<Props> = ({
  items,
  loading,
  error,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onRetry,
}) => {
  if (loading) {
    return (
      <div className="ep-admin-resource-results ep-admin-resource-results--loading">
        Caricamento risorse...
      </div>
    );
  }

  if (error) {
    return (
      <div className="ep-admin-resource-results ep-admin-resource-results--error">
        <div className="ep-alert ep-alert--error">
          <div className="ep-alert__message">{error}</div>
          <button
            type="button"
            className="ep-button ep-button--secondary ep-alert__action"
            onClick={onRetry}
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="ep-admin-resource-results ep-admin-resource-results--empty">
        Nessuna risorsa trovata con i filtri selezionati.
      </div>
    );
  }

  const renderSkills = (skills: string[]): string => {
    if (!skills || skills.length === 0) {
      return '-';
    }
    const main = skills.slice(0, 3).join(', ');
    const extraCount = skills.length - 3;
    if (extraCount > 0) {
      return `${main} +${extraCount}`;
    }
    return main;
  };

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="ep-admin-resource-results">
      <table className="ep-table ep-admin-resource-results__table">
        <thead>
          <tr>
            <th>Nome completo</th>
            <th>Ruolo</th>
            <th>Skills chiave</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.fullName}</td>
              <td>{item.roleName}</td>
              <td>{renderSkills(item.keySkills)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ep-admin-resource-results__footer">
        <div className="ep-admin-resource-results__pagination-info">
          {`Risultati: ${items.length > 0 ? (page - 1) * pageSize + 1 : 0} - ${Math.min(
            page * pageSize,
            totalItems,
          )} di ${totalItems}`}
        </div>
        <div className="ep-pagination">
          <button
            type="button"
            className="ep-button ep-button--secondary"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoPrev}
          >
            Precedente
          </button>
          <span className="ep-pagination__page">
            Pagina {page} di {totalPages}
          </span>
          <button
            type="button"
            className="ep-button ep-button--secondary"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext}
          >
            Successiva
          </button>
        </div>
      </div>
    </div>
  );
};
