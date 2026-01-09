import React, { FormEvent, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginForm.css';

interface LocationState {
  from?: string;
}

const isValidEmail = (value: string): boolean => {
  // Semplice validazione email
  return /.+@.+\..+/.test(value);
};

const LoginForm: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state as LocationState) || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Email e password sono obbligatorie.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Inserire un indirizzo email valido.');
      return;
    }

    try {
      await login({ email: email.trim(), password });
      const redirectTo = state.from || '/';
      navigate(redirectTo, { replace: true });
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Email o password non corretta.';
      setError(message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Accesso al portale</h1>
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
