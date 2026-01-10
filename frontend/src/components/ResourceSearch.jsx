import React, { useEffect, useState } from 'react';

// Semplice componente per la ricerca risorse per nome, ruolo e skills chiave
// Assunzioni:
// - Endpoint backend disponibile su /api/resources/search
// - Ruoli e skills possono essere caricati da API esistenti (qui mockato per semplicità)

const mockRoles = [
  { id: 1, name: 'Developer' },
  { id: 2, name: 'Project Manager' },
  { id: 3, name: 'Business Analyst' }
];

const mockSkills = [
  { id: 10, name: 'Java' },
  { id: 11, name: 'React' },
  { id: 12, name: 'SQL' },
  { id: 13, name: 'Project Management' }
];

export default function ResourceSearch() {
  const [name, setName] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [skillMatch, setSkillMatch] = useState('ALL');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggleRole = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleToggleSkill = (skillId) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (name.trim()) params.append('name', name.trim());
    if (selectedRoleIds.length > 0) params.append('roleIds', selectedRoleIds.join(','));
    if (selectedSkillIds.length > 0) params.append('skillIds', selectedSkillIds.join(','));
    if (skillMatch) params.append('skillMatch', skillMatch);
    params.append('limit', '50');
    params.append('offset', '0');
    return params.toString();
  };

  const search = async () => {
    setLoading(true);
    setError('');
    try {
      const qs = buildQueryString();
      const response = await fetch(`/api/resources/search?${qs}`);
      if (!response.ok) {
        throw new Error('Errore nella risposta del server');
      }
      const json = await response.json();
      if (json.success) {
        setResources(json.data.items || []);
      } else {
        setError('Ricerca non riuscita');
      }
    } catch (err) {
      setError(err.message || 'Errore generico');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Caricamento iniziale
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="resource-search-container">
      <h2>Ricerca risorse</h2>
      <div className="resource-search-filters">
        <div className="filter-group">
          <label htmlFor="resource-search-name">Nome/Cognome</label>
          <input
            id="resource-search-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cerca per nome, cognome o full name"
          />
        </div>

        <div className="filter-group">
          <span>Ruoli principali</span>
          <div className="filter-options">
            {mockRoles.map((role) => (
              <label key={role.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedRoleIds.includes(role.id)}
                  onChange={() => handleToggleRole(role.id)}
                />
                {role.name}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span>Skills chiave</span>
          <div className="filter-options">
            {mockSkills.map((skill) => (
              <label key={skill.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedSkillIds.includes(skill.id)}
                  onChange={() => handleToggleSkill(skill.id)}
                />
                {skill.name}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span>Comportamento skills</span>
          <div className="filter-options inline">
            <label className="radio-label">
              <input
                type="radio"
                name="skillMatch"
                value="ALL"
                checked={skillMatch === 'ALL'}
                onChange={() => setSkillMatch('ALL')}
              />
              Tutte le skills selezionate (AND)
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="skillMatch"
                value="ANY"
                checked={skillMatch === 'ANY'}
                onChange={() => setSkillMatch('ANY')}
              />
              Almeno una skill selezionata (OR)
            </label>
          </div>
        </div>

        <div className="filter-actions">
          <button type="button" onClick={search} disabled={loading}>
            {loading ? 'Ricerca in corso...' : 'Cerca'}
          </button>
        </div>
      </div>

      {error && <div className="resource-search-error">{error}</div>}

      <div className="resource-search-results">
        <h3>Risultati</h3>
        {resources.length === 0 && !loading && <div>Nessuna risorsa trovata.</div>}
        {resources.length > 0 && (
          <table className="resource-search-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Ruolo</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id}>
                  <td>{r.fullName || `${r.firstName} ${r.lastName}`}</td>
                  <td>{r.role && r.role.name ? r.role.name : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
