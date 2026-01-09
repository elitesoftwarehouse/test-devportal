import React from 'react';
import UnifiedProfilesView from './components/profiles/UnifiedProfilesView';

const App: React.FC = () => {
  // Integrazione di base: si può collegare al contesto auth del portale
  const currentUserRole: 'ADMIN' | 'USER' = 'ADMIN';

  return (
    <div className="app-root">
      <UnifiedProfilesView currentUserRole={currentUserRole} />
    </div>
  );
};

export default App;
