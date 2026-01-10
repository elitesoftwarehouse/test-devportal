import React, { useEffect, useState } from 'react';
import { searchSkillProfiles } from '../api/skillProfileApi';
import './SkillProfile.css';

const MOCK_OPERATOR_ID = 2; // solo per sviluppo

export function SkillProfilesAdminView() {
  const [filters, setFilters] = useState({
    role: '',
    skill: '',
    minYears: '',
    language: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profiles, setProfiles] = useState([]);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await searchSkillProfiles(
        {
          role: filters.role || undefined,
          skill: filters.skill || undefined,
          minYears: filters.minYears ? Number(filters.minYears) : undefined,
          language: filters.language || undefined,
        },
        MOCK_OPERATOR_ID,
        'IT_OPERATOR'
      );
      setProfiles(data);
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Errore nel caricamento dei profili competenze';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="skill-profile-card">
      <h2>Profili competenze collaboratori</h2>
      <form onSubmit={handleSearch} className="skill-profile-form">
        <div className="form-row-inline">
          <div className="form-row">
            <label htmlFor="filter-role">Ruolo</label>
            <input
              id="filter-role"
              name="role"
              type="text"
              value={filters.role}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label htmlFor="filter-skill">Skill</label>
            <input
              id="filter-skill"
              name="skill"
              type="text"
              value={filters.skill}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-row-inline">
          <div className="form-row">
            <label htmlFor="filter-minYears">Anni minimi</label>
            <input
              id="filter-minYears"
              name="minYears"
              type="number"
              min={0}
              max={60}
              value={filters.minYears}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label htmlFor="filter-language">Lingua</label>
            <input
              id="filter-language"
              name="language"
              type="text"
              value={filters.language}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Ricerca in corso...' : 'Cerca'}
          </button>
        </div>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      <table className="skill-profiles-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Ruolo</th>
            <th>Skill chiave</th>
            <th>Anni exp.</th>
            <th>Lingua</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.id}>
              <td>{p.userId}</td>
              <td>{p.role}</td>
              <td>{(p.keySkills || []).join(', ')}</td>
              <td>{p.yearsOfExperience}</td>
              <td>{p.primaryLanguage}</td>
            </tr>
          ))}
          {!loading && profiles.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center' }}>
                Nessun profilo trovato.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SkillProfilesAdminView;
