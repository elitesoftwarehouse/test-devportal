import React, { useCallback, useEffect, useState } from 'react';
import {
  searchAdminResources,
  AdminResourceSummaryDto,
  AdminResourceSearchResponse,
} from '../../api/admin/resourcesSearchApi';
import { fetchAdminRoles, AdminRoleDto } from '../../api/admin/rolesApi';
import { fetchAdminSkills, AdminSkillDto } from '../../api/admin/skillsApi';
import {
  ResourceSearchFilters,
  ResourceSearchFiltersValue,
} from '../../components/admin/resources/ResourceSearchFilters';
import { ResourceSearchResultsTable } from '../../components/admin/resources/ResourceSearchResultsTable';

/**
 * Pagina amministrativa: ricerca e filtro risorse.
 *
 * Responsabilità principali:
 * - Gestire lo stato dei filtri e dei risultati
 * - Passare i parametri alla funzione `searchAdminResources`, che li converte
 *   in query string per l'endpoint backend
 * - Coordinare caricamento iniziale dei ruoli e delle skills
 * - Gestire stati di loading, errore, empty state e paginazione.
 */

const DEFAULT_PAGE_SIZE = 10;

export const AdminResourceSearchPage: React.FC = () => {
  const [filters, setFilters] = useState<ResourceSearchFiltersValue>({
    q: '',
    roleIds: [],
    skillIds: [],
  });

  const [roles, setRoles] = useState<AdminRoleDto[]>([]);
  const [skills, setSkills] = useState<AdminSkillDto[]>([]);
  const [loadingRoles, setLoadingRoles] = useState<boolean>(false);
  const [loadingSkills, setLoadingSkills] = useState<boolean>(false);

  const [results, setResults] = useState<AdminResourceSummaryDto[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Caricamento ruoli
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoadingRoles(true);
        const data = await fetchAdminRoles();
        setRoles(data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Errore caricamento ruoli', e);
      } finally {
        setLoadingRoles(false);
      }
    };
    loadRoles();
  }, []);

  // Caricamento skills
  useEffect(() => {
    const loadSkills = async () => {
      try {
        setLoadingSkills(true);
        const data = await fetchAdminSkills();
        setSkills(data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Errore caricamento skills', e);
      } finally {
        setLoadingSkills(false);
      }
    };
    loadSkills();
  }, []);

  const executeSearch = useCallback(
    async (targetPage: number = 1) => {
      try {
        setLoading(true);
        setError(null);
        const response: AdminResourceSearchResponse = await searchAdminResources({
          q: filters.q,
          roleIds: filters.roleIds,
          skillIds: filters.skillIds,
          page: targetPage,
          pageSize,
        });
        setResults(response.items);
        setPage(response.page);
        setTotalItems(response.totalItems);
        setTotalPages(response.totalPages);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Errore ricerca risorse', e);
        setError('Si è verificato un errore durante il caricamento delle risorse.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [filters, pageSize],
  );

  // Caricamento iniziale
  useEffect(() => {
    executeSearch(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyFilters = () => {
    // Quando si applicano i filtri si riparte sempre dalla prima pagina
    executeSearch(1);
  };

  const handleResetFilters = () => {
    setFilters({ q: '', roleIds: [], skillIds: [] });
    executeSearch(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }
    executeSearch(newPage);
  };

  const handleRetry = () => {
    executeSearch(page);
  };

  return (
    <div className="ep-admin-page ep-admin-resource-search-page">
      <div className="ep-admin-page__header">
        <h1 className="ep-page-title">Ricerca risorse</h1>
        <p className="ep-page-subtitle">
          Ricerca e filtra le risorse per nome, ruolo e skills chiave.
        </p>
      </div>

      <div className="ep-admin-page__content">
        <ResourceSearchFilters
          roles={roles}
          skills={skills}
          loadingRoles={loadingRoles}
          loadingSkills={loadingSkills}
          value={filters}
          onChange={setFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          useDebouncedSearch
        />

        <ResourceSearchResultsTable
          items={results}
          loading={loading}
          error={error}
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
};

export default AdminResourceSearchPage;
