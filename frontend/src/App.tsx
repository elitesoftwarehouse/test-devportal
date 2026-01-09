import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ExternalCollaboratorInvitationsPage from './components/ExternalCollaborators/ExternalCollaboratorInvitationsPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/external-collaborators/invitations" element={<ExternalCollaboratorInvitationsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
