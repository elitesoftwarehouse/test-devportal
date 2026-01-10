import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchResourceDetail, downloadResourceCv, ResourceDetailDto, ResourceCvDto, ResourceSkillDto } from '../api/resourcesApi';
import { PageLayout } from '../components/layout/PageLayout';
import { EPTable } from '../components/ui/EPTable';
import { EPBadge } from '../components/ui/EPBadge';
import { EPButton } from '../components/ui/EPButton';
import { EPAlert } from '../components/ui/EPAlert';
import { EPSkeleton } from '../components/ui/EPSkeleton';
import './ResourceDetailPage.css';

interface RouteParams {
  id: string;
}

export const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const [data, setData] = useState<ResourceDetailDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingCvId, setDownloadingCvId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!id) {
        setError('Identificativo risorsa non specificato');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await fetchResourceDetail(id);
        if (isMounted) {
          setData(result);
        }
      } catch (e) {
        if (isMounted) {
          setError('Impossibile recuperare i dati della risorsa');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDownloadCv = async (cv: ResourceCvDto) => {
    if (!data) return;
    try {
      setDownloadingCvId(cv.id);
      await downloadResourceCv(data.id, cv.id);
    } catch (e) {
      // In un sistema reale potremmo usare una toast notification centralizzata
      // Per ora mostriamo un alert generico lato UI
      alert('Impossibile scaricare il CV selezionato');
    } finally {
      setDownloadingCvId(null);
    }
  };

  const renderHeader = () => {
    if (loading) {
      return (
        <div className="ep-resource-header">
          <div className="ep-resource-header-main">
            <EPSkeleton width={220} height={24} />
            <EPSkeleton width={160} height={18} />
          </div>
          <div className="ep-resource-header-meta">
            <EPSkeleton width={120} height={18} />
            <EPSkeleton width={120} height={18} />
            <EPSkeleton width={90} height={18} />
          </div>
        </div>
      );
    }

    if (!data) return null;

    return (
      <div className="ep-resource-header">
        <div className="ep-resource-header-main">
          <h1 className="ep-resource-name">{data.fullName}</h1>
          <div className="ep-resource-role">{data.role || 'Ruolo non specificato'}</div>
        </div>
        <div className="ep-resource-header-meta">
          <div className="ep-resource-header-item">
            <span className="ep-label">Seniority</span>
            <span className="ep-value">{data.seniority || '-'}</span>
          </div>
          <div className="ep-resource-header-item">
            <span className="ep-label">Azienda</span>
            <span className="ep-value">{data.company || '-'}</span>
          </div>
          <div className="ep-resource-header-item">
            <span className="ep-label">Stato</span>
            {data.status ? <EPBadge variant="neutral">{data.status}</EPBadge> : <span className="ep-value">-</span>}
          </div>
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    if (loading) {
      return (
        <div className="ep-card">
          <div className="ep-card-header">
            <h2>Profilo competenze</h2>
          </div>
          <div className="ep-card-body">
            <EPSkeleton width={400} height={18} />
            <EPSkeleton width={360} height={18} />
            <EPSkeleton width={380} height={18} />
          </div>
        </div>
      );
    }

    if (!data) return null;

    const skills: ResourceSkillDto[] = data.skills || [];

    return (
      <div className="ep-card">
        <div className="ep-card-header">
          <h2>Profilo competenze</h2>
        </div>
        <div className="ep-card-body">
          {skills.length === 0 && (
            <EPAlert severity="info" title="Nessuna competenza indicata">
              Non sono state ancora inserite competenze per questa risorsa.
            </EPAlert>
          )}
          {skills.length > 0 && (
            <div className="ep-skills-list">
              {skills.map((skill) => (
                <div key={skill.id} className="ep-skill-item">
                  <div className="ep-skill-main">
                    <div className="ep-skill-name">{skill.name}</div>
                    {skill.category && (
                      <EPBadge size="small" variant="neutral" className="ep-skill-category">
                        {skill.category}
                      </EPBadge>
                    )}
                  </div>
                  <div className="ep-skill-meta">
                    {skill.level && (
                      <span className="ep-skill-meta-item">
                        <span className="ep-label">Livello</span>
                        <span className="ep-value">{skill.level}</span>
                      </span>
                    )}
                    {skill.yearsExperience != null && (
                      <span className="ep-skill-meta-item">
                        <span className="ep-label">Anni esperienza</span>
                        <span className="ep-value">{skill.yearsExperience}</span>
                      </span>
                    )}
                  </div>
                  {skill.tags && skill.tags.length > 0 && (
                    <div className="ep-skill-tags">
                      {skill.tags.map((tag) => (
                        <EPBadge key={tag} size="small" variant="outline">
                          {tag}
                        </EPBadge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCvs = () => {
    if (loading) {
      return (
        <div className="ep-card">
          <div className="ep-card-header">
            <h2>Curriculum vitae</h2>
          </div>
          <div className="ep-card-body">
            <EPSkeleton width={600} height={32} />
            <EPSkeleton width={560} height={32} />
            <EPSkeleton width={580} height={32} />
          </div>
        </div>
      );
    }

    if (!data) return null;

    const cvs = data.cvs || [];

    return (
      <div className="ep-card">
        <div className="ep-card-header">
          <h2>Curriculum vitae</h2>
        </div>
        <div className="ep-card-body">
          {error && (
            <EPAlert severity="error" title="Errore nel caricamento dei CV">
              Impossibile recuperare i CV della risorsa.
            </EPAlert>
          )}
          {!error && cvs.length === 0 && (
            <EPAlert severity="info" title="Nessun CV disponibile">
              Nessun CV disponibile per questa risorsa.
            </EPAlert>
          )}
          {!error && cvs.length > 0 && (
            <EPTable
              columns={[
                {
                  id: 'title',
                  header: 'Titolo / File',
                  renderCell: (row: ResourceCvDto) => (
                    <div className="ep-cv-title-cell">
                      <div className="ep-cv-title-main">
                        <span className="ep-cv-title">{row.title || row.fileName}</span>
                        {row.isPrimary && (
                          <EPBadge size="small" variant="success" className="ep-cv-primary-badge">
                            Principale
                          </EPBadge>
                        )}
                      </div>
                      {row.title && row.title !== row.fileName && (
                        <div className="ep-cv-filename">{row.fileName}</div>
                      )}
                    </div>
                  )
                },
                {
                  id: 'language',
                  header: 'Lingua',
                  width: 120,
                  renderCell: (row: ResourceCvDto) => row.language || '-'
                },
                {
                  id: 'updatedAt',
                  header: 'Ultimo aggiornamento',
                  width: 180,
                  renderCell: (row: ResourceCvDto) =>
                    new Date(row.updatedAt).toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })
                },
                {
                  id: 'format',
                  header: 'Formato',
                  width: 120,
                  renderCell: (row: ResourceCvDto) => row.format || '-'
                },
                {
                  id: 'actions',
                  header: '',
                  width: 140,
                  align: 'right',
                  renderCell: (row: ResourceCvDto) => (
                    <EPButton
                      variant="primary"
                      size="small"
                      icon="download"
                      loading={downloadingCvId === row.id}
                      onClick={() => handleDownloadCv(row)}
                    >
                      Download
                    </EPButton>
                  )
                }
              ]}
              data={cvs}
              getRowId={(row: ResourceCvDto) => String(row.id)}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <PageLayout title="Dettaglio risorsa">
      <div className="ep-resource-detail-page">
        {error && !loading && !data && (
          <EPAlert severity="error" title="Errore nel caricamento della risorsa">
            {error}
          </EPAlert>
        )}
        {renderHeader()}
        <div className="ep-resource-content">
          {renderSkills()}
          {renderCvs()}
        </div>
      </div>
    </PageLayout>
  );
};

export default ResourceDetailPage;
