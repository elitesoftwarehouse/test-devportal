import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Inserisci email e password');
      return;
    }
    
    setLoading(true);
    
    // Simula login
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock success
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="login-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
        <div className="bg-grid"></div>
      </div>

      <div className="login-wrapper">
        {/* Left Panel - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <span className="logo-icon">⚡</span>
            </div>
            <h1>Elite Portal</h1>
            <p>Portale Gestione Collaboratori Esterni</p>
            
            <div className="brand-features">
              <div className="feature">
                <span className="feature-icon">🔐</span>
                <span>Autenticazione sicura</span>
              </div>
              <div className="feature">
                <span className="feature-icon">👥</span>
                <span>Gestione collaboratori</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🏢</span>
                <span>Accreditamento aziende</span>
              </div>
            </div>
          </div>
          
          <div className="branding-footer">
            <p>© 2026 Elite Software House</p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="login-form-panel">
          <div className="form-header">
            <h2>Bentornato! 👋</h2>
            <p>Accedi al tuo account per continuare</p>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nome@azienda.it"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-wrapper">
                <input type="checkbox" />
                <span className="checkmark"></span>
                <span>Ricordami</span>
              </label>
              <a href="#" className="forgot-link">Password dimenticata?</a>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  Accesso in corso...
                </span>
              ) : (
                <>
                  Accedi
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="divider">
            <span>oppure</span>
          </div>

          <div className="external-login">
            <button type="button" className="external-btn oidc">
              <span className="ext-icon">🔑</span>
              Accedi con OIDC Aziendale
            </button>
          </div>

          <div className="form-footer">
            <p>Sei un collaboratore esterno? <a href="#">Registrati qui</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
