import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './MainHeader.css';

const MainHeader: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="main-header">
      <div className="main-header-left">
        <Link to="/" className="logo">
          Elite Portal
        </Link>
      </div>
      <nav className="main-header-nav">
        {user && (
          <>
            <Link to="/dashboard">Dashboard</Link>

            {/* Voci amministrative visibili solo a SYS_ADMIN / IT_OPERATOR */}
            {hasRole(['SYS_ADMIN', 'IT_OPERATOR']) && (
              <Link to="/admin">Amministrazione</Link>
            )}

            {/* Sezioni dedicate agli esterni */}
            {hasRole(['EXTERNAL_OWNER', 'EXTERNAL_COLLABORATOR']) && (
              <Link to="/external">Area esterni</Link>
            )}
          </>
        )}
      </nav>
      <div className="main-header-right">
        {user ? (
          <div className="user-area">
            <span className="user-label">
              {user.displayName || user.email}
            </span>
            <button type="button" className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="login-link">
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default MainHeader;
