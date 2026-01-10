import React from 'react';
import { useParams } from 'react-router-dom';
import CollaboratorCvManager from '../components/collaborators/CollaboratorCvManager';
// import di altri componenti di dettaglio collaboratore già esistenti

const CollaboratorDetailPage = () => {
  const { id } = useParams();
  const collaboratorId = parseInt(id, 10);

  return (
    <div className="collaborator-detail-page">
      {/* altri pannelli / sezioni del collaboratore */}
      <CollaboratorCvManager collaboratorId={collaboratorId} />
    </div>
  );
};

export default CollaboratorDetailPage;
