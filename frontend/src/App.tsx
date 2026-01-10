import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ExternalCollaboratorInvitationsPage from './components/ExternalCollaborators/ExternalCollaboratorInvitationsPage';
import UnifiedProfilesView from './components/profiles/UnifiedProfilesView';

const App: React.FC = () => {
  // Integrazione di base: si può collegare al contesto auth del portale
  const currentUserRole: 'ADMIN' | 'USER' = 'ADMIN';

  return (
    <Router>
      <div className="app-root">
        <Routes>
          <Route path="/external-collaborators/invitations" element={<ExternalCollaboratorInvitationsPage />} />
          <Route path="/profiles" element={<UnifiedProfilesView currentUserRole={currentUserRole} />} />
          <Route path="/" element={<UnifiedProfilesView currentUserRole={currentUserRole} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
