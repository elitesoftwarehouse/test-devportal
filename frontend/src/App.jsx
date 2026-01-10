import React from 'react';
import { FirstAccreditationForm } from './components/FirstAccreditation/FirstAccreditationForm';
import CompanyCollaboratorsModelDoc from './components/companies/CompanyCollaboratorsModelDoc';

const App = () => {
  return (
    <div>
      <FirstAccreditationForm />
      {/* Altre sezioni dell'applicazione Elite Portal */}
      <CompanyCollaboratorsModelDoc />
    </div>
  );
};

export default App;
