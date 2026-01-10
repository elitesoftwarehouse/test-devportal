import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchResourceDetails } from '../../api/resourcesApi';
import './ResourceDetailsPage.css';

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export default function ResourceDetailsPage({ resourceId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchResourceDetails(resourceId);
        setData(response);
      } catch (err) {
        setError('Impossibile caricare i dettagli della risorsa.');
      } finally {
        setLoading(false);
      }
    }

    if (resourceId) {
      load();
    }
  }, [resourceId]);

  if (loading) {
    return <div className="ResourceDetailsPage">Caricamento dettagli risorsa...</div>;
  }

  if (error) {
    return <div className="ResourceDetailsPage ResourceDetailsPage--error">{error}</div>;
  }

  if (!data) {
    return <div className="ResourceDetailsPage">Nessun dato disponibile.</div>;
  }

  const { resource, skillsProfile, cvs } = data;

  return (
    <div className="ResourceDetailsPage">
      <section className="ResourceDetailsPage__header">
        <h1>{resource.fullName}</h1>
        <div className="ResourceDetailsPage__subtitle">
          <span>{resource.role}</span>
          {resource.seniority && <span className="ResourceDetailsPage__separator">•</span>}
          {resource.seniority && <span>{resource.seniority}</span>}
        </div>
        {resource.email && (
          <div className="ResourceDetailsPage__email">
            <a href={`mailto:${resource.email}`}>{resource.email}</a>
          </div>
        )}
        {resource.availability && (
          <div className="ResourceDetailsPage__availability">Disponibilità: {resource.availability}</div>
        )}
      </section>

      <section className="ResourceDetailsPage__skills">
        <h2>Profilo competenze</h2>
        {skillsProfile.mainSkills && (
          <p className="ResourceDetailsPage__main-skills">{skillsProfile.mainSkills}</p>
        )}
        {skillsProfile.skillTags && skillsProfile.skillTags.length > 0 && (
          <div className="ResourceDetailsPage__tags">
            {skillsProfile.skillTags.map((tag) => (
              <span key={tag} className="ResourceDetailsPage__tag">{tag}</span>
            ))}
          </div>
        )}
        {skillsProfile.languages && skillsProfile.languages.length > 0 && (
          <div className="ResourceDetailsPage__languages">
            <strong>Lingue:</strong>{' '}
            {skillsProfile.languages.map((lang, index) => (
              <span key={lang.code || index}>
                {lang.code?.toUpperCase() || lang.name}
                {lang.level ? ` (${lang.level})` : ''}
                {index < skillsProfile.languages.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="ResourceDetailsPage__cvs">
        <h2>Curriculum vitae</h2>
        {(!cvs || cvs.length === 0) && <div>Nessun CV disponibile per questa risorsa.</div>}
        {cvs && cvs.length > 0 && (
          <table className="ResourceDetailsPage__cv-table">
            <thead>
              <tr>
                <th>Titolo</th>
                <th>Lingua</th>
                <th>Dimensione</th>
                <th>CV principale</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {cvs.map((cv) => (
                <tr key={cv.id}>
                  <td>{cv.title}</td>
                  <td>{cv.language ? cv.language.toUpperCase() : '-'}</td>
                  <td>{formatFileSize(cv.fileSizeBytes)}</td>
                  <td>{cv.isPrimary ? 'Sì' : 'No'}</td>
                  <td>
                    <a
                      href={cv.downloadUrl}
                      className="ResourceDetailsPage__download-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

ResourceDetailsPage.propTypes = {
  resourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};
