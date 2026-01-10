import React, { useEffect, useState } from 'react';
import { fetchResourceDetail, downloadResourceCv, ResourceDetailDTO, ResourceCvDTO } from '../../api/resourcesApi';

interface ResourceDetailPageProps {
  resourceId: string;
}

export const ResourceDetailPage: React.FC<ResourceDetailPageProps> = ({ resourceId }) => {
  const [resource, setResource] = useState<ResourceDetailDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchResourceDetail(resourceId)
      .then((data) => {
        if (mounted) {
          setResource(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Errore nel caricamento della risorsa');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [resourceId]);

  const handleDownload = async (cv: ResourceCvDTO) => {
    try {
      setDownloadingId(cv.id);
      const blob = await downloadResourceCv(resourceId, cv.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cv.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError('Errore nel download del CV');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <div className="resource-detail resource-detail--loading">Caricamento...</div>;
  }

  if (error) {
    return <div className="resource-detail resource-detail--error">{error}</div>;
  }

  if (!resource) {
    return <div className="resource-detail resource-detail--empty">Risorsa non trovata</div>;
  }

  return (
    <div className="resource-detail">
      <div className="resource-detail__header">
        <h1>
          {resource.firstName} {resource.lastName}
        </h1>
        <p className="resource-detail__role">{resource.role || 'Ruolo non specificato'}</p>
        <p className="resource-detail__email">{resource.email}</p>
      </div>

      <div className="resource-detail__section">
        <h2>CV disponibili</h2>
        {resource.cvs.length === 0 ? (
          <p className="resource-detail__empty-cv">Nessun CV associato a questa risorsa.</p>
        ) : (
          <table className="resource-detail__cv-table">
            <thead>
              <tr>
                <th>Nome file</th>
                <th>Creato il</th>
                <th>Aggiornato il</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {resource.cvs.map((cv) => (
                <tr key={cv.id}>
                  <td>{cv.fileName}</td>
                  <td>{new Date(cv.createdAt).toLocaleString()}</td>
                  <td>{new Date(cv.updatedAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="resource-detail__download-btn"
                      onClick={() => handleDownload(cv)}
                      disabled={downloadingId === cv.id}
                    >
                      {downloadingId === cv.id ? 'Download in corso...' : 'Download'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ResourceDetailPage;
