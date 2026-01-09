import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from './LoginForm';
import './AppLayout.css';

function AppLayout({ children }) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="app-loading">Caricamento...</div>;
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-logo">Elite Portal</span>
        </div>
        <div className="app-header-right">
          <span className="app-user-info">
            {user.email} ({(user.roles || []).join(', ')})
          </span>
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}

export default AppLayout;
