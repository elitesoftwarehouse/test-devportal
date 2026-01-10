import React, { useEffect, useState } from 'react';
import { searchResources, ResourceSearchItemDto, PagedResult } from '../../api/resourcesApi';
import './ResourceSearchPage.css';

interface RoleOption {
  id: number;
  name: string;
}

interface SkillOption {
  id: number;
  code: string;
  name: string;
}

// In assenza di un endpoint dedicato, usiamo opzioni statiche come placeholder.
const MOCK_ROLES: RoleOption[] = [
  { id: 1, name: 'Developer' },
  { id: 2, name: 'Project Manager' },
  { id: 3, name: 'Business Analyst' },
];

const MOCK_SKILLS: SkillOption[] = [
  { id: 1, code: 'JS', name: 'JavaScript' },
  { id: 2, code: 'TS', name: 'TypeScript' },
  { id: 3, code: 'SQL', name: 'SQL' },
  { id: 4, code: 'PM', name: 'Project Management' },
];

const DEFAULT_PAGE_SIZE = 10;

const ResourceSearchPage: React.FC = () => {
  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [data, setData] = useState<PagedResult<ResourceSearchItemDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const skillsParam = selectedSkills.length > 0 ? selectedSkills : undefined;
      const roleIdParam = roleId ? parseInt(roleId, 10) : undefined;

      const result = await searchResources({
        name: name || undefined,
        roleId: roleIdParam,
        skills: skillsParam,
        page,
        pageSize,
        sortBy: 'name',
        sortDirection: 'asc',
      });

      setData(result);
    } catch (err: any) {
      console.error('Errore ricerca risorse', err);
      const message = err?.response?.data?.message || 'Errore durante la ricerca delle risorse';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const onReset = () => {
    setName('');
    setRoleId('');
    setSelectedSkills([]);
    setPage(1);
  };

  const toggleSkill = (value: string) => {
    setSelectedSkills((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      }
      return [...prev, value];
    });
  };

  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="resource-search-page">
      <h1>Ricerca risorse</h1>

      <form className="resource-search-form" onSubmit={onSubmit}>
        <div className="form-row">
          <label htmlFor="name">Nome / Cognome</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cerca per nome o cognome"
          />
        </div>

        <div className="form-row">
          <label htmlFor="role">Ruolo</label>
          <select
            id="role"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          >
            <option value="">Tutti i ruoli</option>
            {MOCK_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Skills chiave (match ANY)</label>
          <div className="skills-list">
            {MOCK_SKILLS.map((s) => {
              const value = String(s.id); // per semplicità usiamo l'id come valore
              const checked = selectedSkills.includes(value);
              return (
                <label key={s.id} className="skill-checkbox">
                  <input
                    type="checkbox"
                    value={value}
                    checked={checked}
                    onChange={() => toggleSkill(value)}
                  />
                  <span>{s.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="form-row form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Ricerca in corso...' : 'Cerca'}
          </button>
          <button type="button" className="btn" onClick={onReset} disabled={loading}>
            Pulisci filtri
          </button>
        </div>

        <div className="form-row">
          <label htmlFor="pageSize">Elementi per pagina</label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              setPageSize(value);
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="resource-search-results">
        {loading && <div>Caricamento...</div>}

        {!loading && data && data.items.length === 0 && (
          <div>Nessuna risorsa trovata con i filtri selezionati.</div>
        )}

        {!loading && data && data.items.length > 0 && (
          <>
            <table className="resource-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Ruolo</th>
                  <th>Skills chiave</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.fullName}</td>
                    <td>{r.role ? r.role.name : '-'}</td>
                    <td>
                      {r.skills && r.skills.length > 0
                        ? r.skills.map((s) => s.name).join(', ')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button
                className="btn"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                &laquo; Precedente
              </button>
              <span>
                Pagina {page} di {totalPages || 1}
              </span>
              <button
                className="btn"
                disabled={totalPages === 0 || page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Successiva &raquo;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResourceSearchPage;
