import React from 'react';
import { CollaboratorCvManager } from './components/collaborators/CollaboratorCvManager';

const App: React.FC = () => {
  // Integrazione semplice: in un contesto reale l'ID verrebbe dal routing o dallo stato globale.
  const sampleCollaboratorId = '11111111-1111-1111-1111-111111111111';

  return (
    <div style={{ padding: '16px' }}>
      <h2>Elite Portal - Gestione CV Collaboratori</h2>
      <CollaboratorCvManager collaboratorId={sampleCollaboratorId} />
    </div>
  );
};

export default App;
