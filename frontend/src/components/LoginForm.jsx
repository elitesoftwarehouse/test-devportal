import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginForm.css';

function LoginForm() {
  const { login, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError(null);
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      const message =
        (err.payload && err.payload.message) ||
        (err.message && err.message) ||
        'Errore durante il login.';
      setLocalError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Accesso Elite Portal</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            required
            minLength={6}
          />
        </div>
        {localError && <div className="error-message">{localError}</div>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Accesso in corso...' : 'Accedi'}
        </button>
      </form>
      <div className="login-hint">
        <p>Utenti demo:</p>
        <ul>
          <li>
            admin@example.com / Admin1234! (ADMIN)
          </li>
          <li>
            user@example.com / User1234! (USER)
          </li>
        </ul>
      </div>
    </div>
  );
}

export default LoginForm;
