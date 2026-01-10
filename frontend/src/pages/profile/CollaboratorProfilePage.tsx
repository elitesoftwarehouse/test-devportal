import React from 'react';
import CompetenceProfileCard from '../../components/profile/CompetenceProfileCard';

const CollaboratorProfilePage: React.FC = () => {
  return (
    <main className="ep-layout-main" aria-label="Profilo collaboratore">
      <div className="ep-container">
        <header className="ep-page-header">
          <h1 className="ep-page-title">Profilo collaboratore</h1>
          <p className="ep-page-subtitle">
            Gestisci le informazioni principali del tuo profilo e del tuo curriculum.
          </p>
        </header>

        <div className="ep-profile-grid">
          {/* Altre card del profilo/curriculum qui, se già presenti */}
          <CompetenceProfileCard />
        </div>
      </div>
    </main>
  );
};

export default CollaboratorProfilePage;
