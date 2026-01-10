import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "../styles/resourceSearch.css";

const PAGE_SIZE = 10;

function ResourceSearchPage({ apiBaseUrl }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState([]);
  const [resources, setResources] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = ["Developer", "Project Manager", "UX Designer"]; // semplificato per test
  const allSkills = [
    "React",
    "Node.js",
    "TypeScript",
    "Agile",
    "Scrum",
    "Communication",
    "Java",
    "Spring",
    "SQL",
    "Figma",
    "UX Research",
    "Prototyping",
  ];

  const canGoNext = page * PAGE_SIZE < total;
  const canGoPrev = page > 1;

  const fetchResources = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (role) params.append("role", role);
      if (skills.length > 0) params.append("skills", skills.join(","));
      params.append("page", String(page));
      params.append("pageSize", String(PAGE_SIZE));

      const url = `${apiBaseUrl}/resources?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("API_ERROR");
      }
      const json = await response.json();
      setResources(json.data || []);
      setTotal(json.pagination ? json.pagination.total : (json.data || []).length);
    } catch (e) {
      setError("Errore durante il caricamento delle risorse.");
      setResources([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role, skills, page]);

  const onResetFilters = () => {
    setSearch("");
    setRole("");
    setSkills([]);
    setPage(1);
  };

  const onSkillsChange = (event) => {
    const value = event.target.value;
    // semplice logica per multi selezione in ambiente di test:
    setSkills((prev) => {
      if (prev.includes(value)) {
        return prev.filter((s) => s !== value);
      }
      return [...prev, value];
    });
    setPage(1);
  };

  const onRoleChange = (event) => {
    setRole(event.target.value);
    setPage(1);
  };

  const onSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const onNextPage = () => {
    if (canGoNext) {
      setPage((p) => p + 1);
    }
  };

  const onPrevPage = () => {
    if (canGoPrev) {
      setPage((p) => p - 1);
    }
  };

  return (
    <div className="resource-search-page">
      <h1>Ricerca risorse</h1>
      <div className="resource-search-filters">
        <div className="filter-item">
          <label htmlFor="searchName">Nome</label>
          <input
            id="searchName"
            type="text"
            placeholder="Cerca per nome"
            value={search}
            onChange={onSearchChange}
          />
        </div>
        <div className="filter-item">
          <label htmlFor="roleSelect">Ruolo</label>
          <select id="roleSelect" value={role} onChange={onRoleChange} aria-label="Ruolo">
            <option value="">Tutti i ruoli</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label htmlFor="skillsSelect">Skills</label>
          <select
            id="skillsSelect"
            aria-label="Skills"
            value=""
            onChange={onSkillsChange}
          >
            <option value="" disabled>
              Seleziona skill
            </option>
            {allSkills.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="skills-selected">
            {skills.map((s) => (
              <span key={s} className="skill-tag" onClick={() => setSkills((prev) => prev.filter((x) => x !== s))}>
                {s} ×
              </span>
            ))}
          </div>
        </div>
        <div className="filter-actions">
          <button type="button" onClick={onResetFilters}>
            Reset filtri
          </button>
        </div>
      </div>

      <div className="resource-search-results">
        {loading && <div className="state-message">Caricamento risorse...</div>}
        {error && !loading && <div className="state-message error">{error}</div>}
        {!loading && !error && resources.length === 0 && (
          <div className="state-message">Nessuna risorsa trovata</div>
        )}
        {!loading && !error && resources.length > 0 && (
          <table className="resource-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Ruolo</th>
                <th>Skills</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.role}</td>
                  <td>{Array.isArray(r.skills) ? r.skills.join(", ") : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="pagination">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={!canGoPrev}
            aria-label="Pagina precedente"
          >
            Pagina precedente
          </button>
          <span className="page-info">
            Pagina {page} {total ? `di ${Math.ceil(total / PAGE_SIZE)}` : ""}
          </span>
          <button
            type="button"
            onClick={onNextPage}
            disabled={!canGoNext}
            aria-label="Pagina successiva"
          >
            Pagina successiva
          </button>
        </div>
      </div>
    </div>
  );
}

ResourceSearchPage.propTypes = {
  apiBaseUrl: PropTypes.string,
};

ResourceSearchPage.defaultProps = {
  apiBaseUrl: "http://localhost/api",
};

export default ResourceSearchPage;
