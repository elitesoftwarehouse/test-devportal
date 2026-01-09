import React, { useState } from 'react';
import { registerExternalUser, activateExternalUser } from '../api/authApi';
import './ExternalUserActivationPage.css';

export const ExternalUserActivationPage = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'EXTERNAL_OWNER'
  });
  const [registrationResult, setRegistrationResult] = useState(null);
  const [activationToken, setActivationToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await registerExternalUser(form);
      setRegistrationResult(res);
      setMessage('Utente registrato. Controlla l\'email per il link di attivazione.');
    } catch (err) {
      setError(`Errore registrazione: ${err.message}`);
    }
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await activateExternalUser(activationToken);
      setMessage(`Account attivato per ${res.email}`);
    } catch (err) {
      setError(`Errore attivazione: ${err.message}`);
    }
  };

  return (
    <div className="external-activation-page">
      <h2>Registrazione utente esterno</h2>
      <form className="external-form" onSubmit={handleRegister}>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Nome
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Cognome
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Ruolo
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="EXTERNAL_OWNER">Proprietario esterno</option>
            <option value="EXTERNAL_COLLABORATOR">Collaboratore esterno</option>
          </select>
        </label>
        <button type="submit">Registra</button>
      </form>

      <h3>Attivazione account (test)</h3>
      <form className="external-form" onSubmit={handleActivate}>
        <label>
          Token di attivazione
          <input
            type="text"
            value={activationToken}
            onChange={(e) => setActivationToken(e.target.value)}
          />
        </label>
        <button type="submit">Attiva</button>
      </form>

      {registrationResult && (
        <div className="result-box">
          <div><strong>ID:</strong> {registrationResult.id}</div>
          <div><strong>Email:</strong> {registrationResult.email}</div>
          <div><strong>Stato:</strong> {registrationResult.status}</div>
          <div><strong>Ruolo:</strong> {registrationResult.role}</div>
        </div>
      )}

      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}
    </div>
  );
};

export default ExternalUserActivationPage;
