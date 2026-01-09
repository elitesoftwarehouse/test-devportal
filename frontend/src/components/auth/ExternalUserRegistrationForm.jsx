import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { registerExternalUser } from '../../services/apiClient';
import '../../styles/externalRegistration.css';

function ExternalUserRegistrationForm({ onSuccess }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'EXTERNAL_OWNER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      const data = await registerExternalUser(payload);
      setSuccessMessage(data.message || 'Registrazione completata.');
      if (onSuccess) {
        onSuccess(data);
      }
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'EXTERNAL_OWNER',
      });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Si è verificato un errore durante la registrazione.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="external-registration-container">
      <h2>Registrazione utente esterno</h2>
      <form className="external-registration-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="firstName">Nome</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="lastName">Cognome</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
          />
        </div>
        <div className="form-row">
          <label htmlFor="role">Ruolo</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="EXTERNAL_OWNER">Titolare esterno</option>
            <option value="EXTERNAL_COLLABORATOR">Collaboratore esterno</option>
          </select>
        </div>
        {error && <div className="form-error">{error}</div>}
        {successMessage && <div className="form-success">{successMessage}</div>}
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </button>
        </div>
      </form>
    </div>
  );
}

ExternalUserRegistrationForm.propTypes = {
  onSuccess: PropTypes.func,
};

ExternalUserRegistrationForm.defaultProps = {
  onSuccess: null,
};

export default ExternalUserRegistrationForm;
