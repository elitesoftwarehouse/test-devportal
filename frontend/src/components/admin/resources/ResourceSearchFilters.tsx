import React, { useEffect, useMemo, useState } from 'react';
import { AdminRoleDto } from '../../../api/admin/rolesApi';
import { AdminSkillDto } from '../../../api/admin/skillsApi';

export interface ResourceSearchFiltersValue {
  q: string;
  roleIds: string[];
  skillIds: string[];
}

interface Props {
  roles: AdminRoleDto[];
  skills: AdminSkillDto[];
  loadingRoles: boolean;
  loadingSkills: boolean;
  value: ResourceSearchFiltersValue;
  onChange: (value: ResourceSearchFiltersValue) => void;
  onApply: () => void;
  onReset: () => void;
  useDebouncedSearch?: boolean;
}

/**
 * Componente di filtro per la ricerca risorse admin.
 *
 * Comportamento chiave documentato:
 * - Il campo di testo `q` aggiorna lo stato locale e, se `useDebouncedSearch` è true,
 *   chiama `onChange` in modo debounced (300 ms) per attivare una ricerca automatica.
 *   In alternativa, l'utente può usare il pulsante "Applica filtri".
 * - I dropdown per ruoli e skills aggiornano immediatamente il valore di filtro
 *   (ma l'effettiva chiamata API avviene solo con `onApply` o con debounced search
 *   se attivata a livello di container).
 */
const DEBOUNCE_MS = 300;

export const ResourceSearchFilters: React.FC<Props> = ({
  roles,
  skills,
  loadingRoles,
  loadingSkills,
  value,
  onChange,
  onApply,
  onReset,
  useDebouncedSearch = true,
}) => {
  const [localQuery, setLocalQuery] = useState<string>(value.q || '');

  useEffect(() => {
    setLocalQuery(value.q || '');
  }, [value.q]);

  // Debounce semplice basato su timeout.
  useEffect(() => {
    if (!useDebouncedSearch) {
      return;
    }
    const handle = setTimeout(() => {
      if (localQuery !== value.q) {
        onChange({ ...value, q: localQuery });
        onApply();
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [localQuery, onChange, onApply, useDebouncedSearch]);

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected: string[] = Array.from(event.target.selectedOptions).map((o) => o.value);
    onChange({ ...value, roleIds: selected });
  };

  const handleSkillChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected: string[] = Array.from(event.target.selectedOptions).map((o) => o.value);
    onChange({ ...value, skillIds: selected });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onChange({ ...value, q: localQuery });
    onApply();
  };

  const hasActiveFilters = useMemo(() => {
    return (
      (value.q && value.q.trim().length > 0) ||
      (value.roleIds && value.roleIds.length > 0) ||
      (value.skillIds && value.skillIds.length > 0)
    );
  }, [value]);

  const handleResetClick = () => {
    setLocalQuery('');
    onReset();
  };

  return (
    <form className="ep-admin-resource-filters" onSubmit={handleSubmit}>
      <div className="ep-admin-resource-filters__row">
        <div className="ep-admin-resource-filters__field ep-admin-resource-filters__field--search">
          <label htmlFor="resource-search-q" className="ep-label">
            Ricerca per nome
          </label>
          <input
            id="resource-search-q"
            type="text"
            className="ep-input"
            placeholder="Cerca per nome o cognome"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
        </div>

        <div className="ep-admin-resource-filters__field">
          <label htmlFor="resource-search-roles" className="ep-label">
            Ruolo
          </label>
          <select
            id="resource-search-roles"
            className="ep-select"
            multiple
            value={value.roleIds}
            onChange={handleRoleChange}
            disabled={loadingRoles}
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ep-admin-resource-filters__field">
          <label htmlFor="resource-search-skills" className="ep-label">
            Skills chiave
          </label>
          <select
            id="resource-search-skills"
            className="ep-select"
            multiple
            value={value.skillIds}
            onChange={handleSkillChange}
            disabled={loadingSkills}
          >
            {skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ep-admin-resource-filters__actions">
        <button type="submit" className="ep-button ep-button--primary">
          Applica filtri
        </button>
        <button
          type="button"
          className="ep-button ep-button--secondary"
          onClick={handleResetClick}
          disabled={!hasActiveFilters}
        >
          Reset
        </button>
      </div>
    </form>
  );
};
