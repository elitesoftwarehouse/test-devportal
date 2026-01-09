import React, { useState } from 'react';
import { createExternalCollaboratorInvitation } from '../../api/externalCollaboratorsApi';

interface Props {
  companyId: string;
}

const InviteExternalCollaboratorForm: React.FC<Props> = ({ companyId }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('Email obbligatoria');
      return;
    }

    setLoading(true);
    try {
      const result = await createExternalCollaboratorInvitation({
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        message: message || undefined,
        companyId
      });
      setSuccess(`Invito creato per ${result.email} (scadenza: ${new Date(
        result.expiresAt
      ).toLocaleDateString()})`);
      setEmail('');
      setFirstName('');
      setLastName('');
      setMessage('');
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Errore durante la creazione dell\'invito');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="external-invite-form" onSubmit={handleSubmit}>
      <h3>Invita collaboratore esterno</h3>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Nome (opzionale)</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Cognome (opzionale)</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Messaggio personalizzato (opzionale)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Invio in corso...' : 'Invita'}
      </button>
    </form>
  );
};

export default InviteExternalCollaboratorForm;
