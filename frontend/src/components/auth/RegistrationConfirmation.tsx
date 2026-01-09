import React, { useState } from "react";
import { registerExternalUser, RegistrationRequest, RegistrationResponse } from "../../api/authApi";
import "./RegistrationConfirmation.css";

const RegistrationConfirmation: React.FC = () => {
  const [form, setForm] = useState<RegistrationRequest>({
    email: "",
    firstName: "",
    lastName: "",
    requestedRole: "EXTERNAL_USER",
    locale: "it"
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RegistrationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await registerExternalUser(form);
      setResult(response);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Si è verificato un errore durante la registrazione.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-confirmation-container">
      <h2>Registrazione utente esterno</h2>
      <form onSubmit={handleSubmit} className="registration-confirmation-form">
        <div className="form-group">
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
        <div className="form-group">
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
        <div className="form-group">
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
        <div className="form-group">
          <label htmlFor="requestedRole">Ruolo richiesto</label>
          <select
            id="requestedRole"
            name="requestedRole"
            value={form.requestedRole}
            onChange={handleChange}
          >
            <option value="EXTERNAL_USER">Utente Esterno</option>
            <option value="PARTNER">Partner</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="locale">Lingua email</label>
          <select
            id="locale"
            name="locale"
            value={form.locale}
            onChange={handleChange}
          >
            <option value="it">Italiano</option>
            <option value="en">English</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Invio in corso..." : "Registrati"}
        </button>
      </form>
      {result && (
        <div className={result.success ? "alert-success" : "alert-error"}>
          {result.message}
        </div>
      )}
      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}
      <p className="registration-info-text">
        Dopo la registrazione riceverai un'email con il link di attivazione dell'account. Controlla anche la cartella spam.
      </p>
    </div>
  );
};

export default RegistrationConfirmation;
