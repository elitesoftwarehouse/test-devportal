import React, { useState } from 'react';
import {
  inviteExternalCollaborator,
  completeExternalActivation,
} from '../api/externalCollaboratorsApi';
import '../styles/externalCollaborators.css';

export function ExternalCollaboratorInvitationsPage() {
  const [email, setEmail] = useState('');
  const [inviteResult, setInviteResult] = useState(null);
  const [inviteError, setInviteError] = useState('');
  const [activationToken, setActivationToken] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [activationResult, setActivationResult] = useState(null);
  const [activationError, setActivationError] = useState('');
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [loadingActivation, setLoadingActivation] = useState(false);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteResult(null);
    setLoadingInvite(true);
    try {
      const result = await inviteExternalCollaborator({ email });
      setInviteResult(result);
      setActivationToken(result.token);
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleActivationSubmit = async (e) => {
    e.preventDefault();
    setActivationError('');
    setActivationResult(null);
    setLoadingActivation(true);
    try {
      const result = await completeExternalActivation({
        token: activationToken,
        firstName,
        lastName,
        password,
      });
      setActivationResult(result);
    } catch (err) {
      setActivationError(err.message);
    } finally {
      setLoadingActivation(false);
    }
  };

  return (
    <div className="external-collab-page">
      <h1>Invito collaboratori esterni</h1>

      <section className="card">
        <h2>Invia invito</h2>
        <form onSubmit={handleInviteSubmit} className="form-grid">
          <label>
            Email collaboratore esterno
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={loadingInvite}>
            {loadingInvite ? 'Invio in corso...' : 'Invia invito'}
          </button>
        </form>
        {inviteError && <div className="alert error">Errore: {inviteError}</div>}
        {inviteResult && (
          <div className="alert success">
            <div>Invito creato per {inviteResult.email}</div>
            <div>Token (solo per test): {inviteResult.token}</div>
            <div>Scadenza: {new Date(inviteResult.expiresAt).toLocaleString()}</div>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Simula attivazione (per test)</h2>
        <form onSubmit={handleActivationSubmit} className="form-grid">
          <label>
            Token invito
            <input
              type="text"
              value={activationToken}
              onChange={(e) => setActivationToken(e.target.value)}
              required
            />
          </label>
          <label>
            Nome
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </label>
          <label>
            Cognome
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={loadingActivation}>
            {loadingActivation ? 'Attivazione in corso...' : 'Completa attivazione'}
          </button>
        </form>
        {activationError && <div className="alert error">Errore: {activationError}</div>}
        {activationResult && (
          <div className="alert success">
            <div>Utente creato con ID: {activationResult.userId}</div>
            <div>Ruolo: {activationResult.role}</div>
            <div>Azienda collegata: {activationResult.companyId}</div>
            <div>Stato invito: {activationResult.invitationStatus}</div>
          </div>
        )}
      </section>
    </div>
  );
}

export default ExternalCollaboratorInvitationsPage;
