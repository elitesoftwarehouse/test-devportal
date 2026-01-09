import React, { useEffect, useState, FormEvent } from 'react';
import {
  ExternalCollaboratorInvitationDto,
  fetchExternalCollaboratorInvitations,
  createExternalCollaboratorInvitation
} from '../../api/externalCollaboratorsApi';
import './ExternalCollaboratorInvitationsPage.css';

const statusLabels: Record<ExternalCollaboratorInvitationDto['status'], string> = {
  PENDING: 'In attesa',
  ACCEPTED: 'Accettato',
  EXPIRED: 'Scaduto',
  CANCELED: 'Annullato'
};

export const ExternalCollaboratorInvitationsPage: React.FC = () => {
  const [invitations, setInvitations] = useState<ExternalCollaboratorInvitationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);

  const loadInvitations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExternalCollaboratorInvitations();
      setInvitations(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Errore nel caricamento degli inviti.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInvitations();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Inserire una email valida.');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createExternalCollaboratorInvitation(email);
      setEmail('');
      await loadInvitations();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Errore nella creazione dell\'invito.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="external-collab-page">
      <h1>Collaboratori esterni - Inviti</h1>

      <form className="external-collab-form" onSubmit={handleSubmit}>
        <label htmlFor="external-collab-email">Email collaboratore esterno</label>
        <div className="external-collab-form-row">
          <input
            id="external-collab-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="nome.cognome@esempio.com"
            required
          />
          <button type="submit" disabled={creating}>
            {creating ? 'Invio in corso...' : 'Invita'}
          </button>
        </div>
      </form>

      {error && <div className="external-collab-error">{error}</div>}

      {loading ? (
        <div>Caricamento inviti...</div>
      ) : (
        <table className="external-collab-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Stato</th>
              <th>Scadenza token</th>
              <th>Registrazione completata</th>
              <th>Prima attivazione</th>
              <th>Creato il</th>
            </tr>
          </thead>
          <tbody>
            {invitations.length === 0 && (
              <tr>
                <td colSpan={6}>Nessun invito registrato.</td>
              </tr>
            )}
            {invitations.map(inv => (
              <tr key={inv.id}>
                <td>{inv.invitedEmail}</td>
                <td>{statusLabels[inv.status]}</td>
                <td>{new Date(inv.tokenExpiry).toLocaleString()}</td>
                <td>{inv.registrationCompleted ? 'Sì' : 'No'}</td>
                <td>{inv.firstActivationAt ? new Date(inv.firstActivationAt).toLocaleString() : '-'}</td>
                <td>{new Date(inv.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExternalCollaboratorInvitationsPage;
