import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "../../styles/profileCompleteness.css";

/**
 * Componente riutilizzabile che mostra l'indicatore di completezza di un profilo
 * (Professionista, Azienda, Collaboratore) come barra percentuale e semaforo.
 */

const statusLabelMap = {
  green: "Completo",
  yellow: "Parzialmente completo",
  red: "Incompleto"
};

const statusClassMap = {
  green: "pc-status-green",
  yellow: "pc-status-yellow",
  red: "pc-status-red"
};

export function ProfileCompletenessIndicator({ profileType, profileId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!profileType || !profileId) {
      return;
    }

    let cancelled = false;

    async function fetchCompleteness() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/profili/${encodeURIComponent(profileType)}/${encodeURIComponent(profileId)}/completezza`);
        if (!response.ok) {
          throw new Error(`Errore nel caricamento completezza: ${response.status}`);
        }
        const json = await response.json();
        if (!cancelled) {
          setData(json.completeness);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Errore sconosciuto");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCompleteness();

    return () => {
      cancelled = true;
    };
  }, [profileType, profileId]);

  if (!profileId) {
    return null;
  }

  return (
    <div className="pc-container">
      <div className="pc-header">
        <span className="pc-title">Completezza profilo</span>
        {data && (
          <span className={`pc-status-badge ${statusClassMap[data.status] || ""}`}>
            {statusLabelMap[data.status] || data.status} ({data.percentage}%)
          </span>
        )}
      </div>

      {loading && <div className="pc-loading">Caricamento indicatori...</div>}
      {error && !loading && <div className="pc-error">{error}</div>}

      {data && !loading && !error && (
        <>
          <div className="pc-progress-wrapper">
            <div className="pc-progress-bar">
              <div
                className={`pc-progress-fill ${statusClassMap[data.status] || ""}`}
                style={{ width: `${data.percentage}%` }}
              />
            </div>
            <span className="pc-progress-label">{data.percentage}%</span>
          </div>

          <div className="pc-categories">
            {data.categories && data.categories.map(cat => (
              <div key={cat.key} className="pc-category-row">
                <div className="pc-category-label">{cat.label}</div>
                <div className="pc-category-bar">
                  <div
                    className="pc-category-fill"
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <div className="pc-category-score">{cat.score}%</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

ProfileCompletenessIndicator.propTypes = {
  profileType: PropTypes.oneOf(["professionista", "azienda", "collaboratore"]).isRequired,
  profileId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default ProfileCompletenessIndicator;
