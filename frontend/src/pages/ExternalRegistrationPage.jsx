import React from 'react';
import ExternalUserRegistrationForm from '../components/auth/ExternalUserRegistrationForm';

function ExternalRegistrationPage() {
  const handleSuccess = () => {
    // Punto di estensione per eventuale redirect o tracking
  };

  return (
    <div className="page-container">
      <ExternalUserRegistrationForm onSuccess={handleSuccess} />
    </div>
  );
}

export default ExternalRegistrationPage;
