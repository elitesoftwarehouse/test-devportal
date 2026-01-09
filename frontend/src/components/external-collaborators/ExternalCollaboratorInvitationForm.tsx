import React, { useState } from 'react';
import { inviteExternalCollaborator } from '../../api/externalCollaboratorsApi';

interface ExternalCollaboratorInvitationFormProps {
  externalOwnerId: string;
  externalOwnerName: string;
  externalOwnerCompanyName: string;
  externalOwnerSupportEmail?: string;
  defaultLocale?: string;
}

export const ExternalCollaboratorInvitationForm: React.FC<
  ExternalCollaboratorInvitationFormProps
> = ({
  externalOwnerId,
  externalOwnerName,
  externalOwnerCompanyName,
  externalOwnerSupportEmail,
  defaultLocale = 'it'
}) => {
  const [email, setEmail] = useState('');
  const [locale, setLocale] = useState(defaultLocale);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const result = await inviteExternalCollaborator({
        email,
        externalOwnerId,
        externalOwnerName,
        externalOwnerCompanyName,
        externalOwnerSupportEmail,
        locale
      });

      setSuccessMessage(
        `Invito inviato a ${result.invitedEmail}. Scadenza: ${new Date(
          result.expiresAt
        ).toLocaleString('it-IT')}`
      );
      setEmail('');
    } catch (error: any) {
      if (error.message === 'EMAIL_SEND_FAILED') {
        setErrorMessage('Errore nell\'invio dell\'email di invito. Riprovare più tardi.');
      } else if (error.message === 'INVALID_REQUEST') {
        setErrorMessage('Dati non validi. Verifica i campi inseriti.');
      } else {
        setErrorMessage('Si è verificato un errore inatteso.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="external-collaborator-invitation-form" onSubmit={handleSubmit}>
      <h3>Invita collaboratore esterno</h3>
      <div className="form-group">
        <label htmlFor="external-collaborator-email">Email collaboratore</label>
        <input
          id="external-collaborator-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="external-collaborator-locale">Lingua</label>
        <select
          id="external-collaborator-locale"
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
        >
          <option value="it">Italiano</option>
        </select>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Invio in corso...' : 'Invia invito'}
      </button>
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
    </form>
  );
};
