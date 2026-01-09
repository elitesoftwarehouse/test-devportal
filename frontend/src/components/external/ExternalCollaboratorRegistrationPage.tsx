import React, { useEffect, useState } from 'react';
import {
  getExternalInvitationDetails,
  completeExternalInvitation,
  InvitationDetails
} from '../../api/externalCollaboratorsApi';

interface Props {
  token: string;
}

const ExternalCollaboratorRegistrationPage: React.FC<Props> = ({ token }) => {
  const [details, setDetails] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const d = await getExternalInvitationDetails(token);
        setDetails(d);
        setFirstName(d.firstName || '');
        setLastName(d.lastName || '');
      } catch (err: any) {
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Impossibile recuperare i dettagli dell\'invito');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || password.length < 8) {
      setError('La password deve contenere almeno 8 caratteri');
      return;
    }

    if (!firstName || !lastName) {
      setError('Nome e cognome sono obbligatori');
      return;
    }

    if (!acceptPrivacy || !acceptTerms) {
      setError('È necessario accettare privacy e termini');
      return;
    }

    try {
      await completeExternalInvitation(token, {
        password,
        firstName,
        lastName,
        acceptPrivacy,
        acceptTerms
      });
      setCompleted(true);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Errore durante il completamento della registrazione');
      }
    }
  };

  if (loading) {
    return <div>Caricamento invito...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!details) {
    return <div className="alert alert-error">Invito non valido</div>;
  }

  if (completed) {
    return (
      <div className="external-registration">
        <h3>Registrazione completata</h3>
        <p>
          Il tuo account per l'azienda <strong>{details.companyName}</strong> è stato attivato con
          ruolo collaboratore esterno.
        </p>
      </div>
    );
  }

  return (
    <div className="external-registration">
      <h3>Attivazione invito collaboratore esterno</h3>
      <p>
        Sei stato invitato come collaboratore esterno per l'azienda{' '}
        <strong>{details.companyName}</strong> con l'email <strong>{details.email}</strong>.
      </p>
      <form onSubmit={handleSubmit} className="external-registration-form">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label>Nome</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Cognome</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <small>Minimo 8 caratteri.</small>
        </div>
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={acceptPrivacy}
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
            />
            Ho letto e accetto l'informativa privacy
          </label>
        </div>
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            Accetto i termini e le condizioni del servizio
          </label>
        </div>
        <button type="submit">Completa registrazione</button>
      </form>
    </div>
  );
};

export default ExternalCollaboratorRegistrationPage;
