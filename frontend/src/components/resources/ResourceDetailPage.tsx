import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import resourcesApi, { ResourceDetailDto, ResourceCvDto } from '../../api/resourcesApi';

interface RouteParams {
  id: string;
}

const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const resourceId = Number(id);

  const [resource, setResource] = useState<ResourceDetailDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await resourcesApi.getResourceDetail(resourceId);
        if (isMounted) {
          setResource(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError('Impossibile caricare i dettagli della risorsa.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (!Number.isNaN(resourceId)) {
      load();
    } else {
      setLoading(false);
      setError('Identificativo risorsa non valido.');
    }

    return () => {
      isMounted = false;
    };
  }, [resourceId]);

  const handleDownload = async (cv: ResourceCvDto) => {
    if (!resource) return;
    try {
      setDownloadingId(cv.id);
      const blob = await resourcesApi.downloadResourceCv(resource.id, cv.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = cv.fileName || `cv-${cv.id}.pdf`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      // In un sistema reale potremmo usare una notifica globale
      // eslint-disable-next-line no-alert
      alert('Errore durante il download del CV. Verifica i permessi o riprova più tardi.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <div className="resource-detail-page">Caricamento dettagli risorsa...</div>;
  }

  if (error) {
    return <div className="resource-detail-page error">{error}</div>;
  }

  if (!resource) {
    return <div className="resource-detail-page">Risorsa non trovata.</div>;
  }

  return (
    <div className="resource-detail-page">
      <h1 className="resource-detail-title">Dettaglio risorsa</h1>
      <div className="resource-detail-card">
        <div className="resource-detail-header">
          <h2>{resource.fullName}</h2>
          <div className="resource-role">{resource.role}</div>
        </div>

        <section className="resource-cv-section">
          <h3>Curriculum disponibili</h3>
          {resource.cvs && resource.cvs.length > 0 ? (
            <table className="resource-cv-table">
              <thead>
                <tr>
                  <th>Nome file</th>
                  <th>Formato</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {resource.cvs.map((cv) => (
                  <tr key={cv.id}>
                    <td>{cv.fileName || `CV #${cv.id}`}</td>
                    <td>{cv.mimeType || '-'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleDownload(cv)}
                        disabled={downloadingId === cv.id}
                      >
                        {downloadingId === cv.id ? 'Download in corso...' : 'Download CV'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Nessun CV associato a questa risorsa.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default ResourceDetailPage;
