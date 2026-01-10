import React from 'react';
import { useParams } from 'react-router-dom';
import { CollaboratorCvSection } from './CollaboratorCvSection';
// ... altri import esistenti

export const CollaboratorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Collaboratore non trovato.</div>;
  }

  return (
    <div className="collaborator-detail-page">
      {/* layout e sezioni esistenti della pagina dettaglio collaboratore */}
      <div className="collaborator-detail-page__content">
        {/* ... altre sezioni (dati anagrafici, progetti, ecc.) ... */}

        <CollaboratorCvSection collaboratorId={id} />
      </div>
    </div>
  );
};

export default CollaboratorDetailPage;
