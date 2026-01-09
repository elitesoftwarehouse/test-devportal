import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <div style={{ padding: '16px' }}>
          <h1>Benvenuto in Elite Portal</h1>
          <p>Questa è un'area protetta visibile solo agli utenti autenticati.</p>
        </div>
      </AppLayout>
    </AuthProvider>
  );
}

export default App;
