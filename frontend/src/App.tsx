import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginForm from './components/auth/LoginForm';
import MainHeader from './components/layout/MainHeader';
import ProtectedRoute from './components/routing/ProtectedRoute';

// Placeholder per pagine esistenti/principali
const HomePage: React.FC = () => <div style={{ padding: 16 }}>Benvenuto in Elite Portal.</div>;
const DashboardPage: React.FC = () => <div style={{ padding: 16 }}>Dashboard</div>;
const AdminPage: React.FC = () => <div style={{ padding: 16 }}>Sezione amministrativa</div>;
const ExternalPage: React.FC = () => <div style={{ padding: 16 }}>Area esterni</div>;

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainHeader />
        <Routes>
          <Route path="/login" element={<LoginForm />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredRoles={['SYS_ADMIN', 'IT_OPERATOR']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredRoles={['EXTERNAL_OWNER', 'EXTERNAL_COLLABORATOR']} />}>
            <Route path="/external" element={<ExternalPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
