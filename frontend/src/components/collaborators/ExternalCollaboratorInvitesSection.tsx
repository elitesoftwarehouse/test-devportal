import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createExternalInvite, fetchExternalInvites, ExternalInvite } from '../../api/externalInvitesApi';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useCompanies } from '../../hooks/useCompanies';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import '../../styles/externalInvites.css';

interface FormState {
  email: string;
  firstName: string;
  lastName: string;
  message: string;
  companyId: string;
}

interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  message?: string;
}

export const ExternalCollaboratorInvitesSection: React.FC = () => {
  const { user } = useCurrentUser();
  const { companies, loading: companiesLoading } = useCompanies();

  const [form, setForm] = useState<FormState>({
    email: '',
    firstName: '',
    lastName: '',
    message: '',
    companyId: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [invites, setInvites] = useState<ExternalInvite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [invitesError, setInvitesError] = useState<string | null>(null);

  const isExternalOwner = user?.role === 'EXTERNAL_OWNER';

  const availableCompanies = useMemo(() => {
    if (!companies || companies.length === 0) return [];
    return companies.filter(c => c.isExternalOwnerCompany || true);
  }, [companies]);

  const validate = useCallback((state: FormState): FormErrors => {
    const newErrors: FormErrors = {};

    if (!state.email.trim()) {
      newErrors.email = 'Email collaboratore obbligatoria';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(state.email.trim())) {
        newErrors.email = 'Formato email non valido';
      }
      if (state.email.length > 255) {
        newErrors.email = 'Email troppo lunga (max 255 caratteri)';
      }
    }

    if (state.firstName && state.firstName.length > 100) {
      newErrors.firstName = 'Nome troppo lungo (max 100 caratteri)';
    }

    if (state.lastName && state.lastName.length > 100) {
      newErrors.lastName = 'Cognome troppo lungo (max 100 caratteri)';
    }

    if (state.message && state.message.length > 1000) {
      newErrors.message = 'Messaggio troppo lungo (max 1000 caratteri)';
    }

    return newErrors;
  }, []);

  const loadInvites = useCallback(async () => {
    if (!isExternalOwner) return;
    setInvitesLoading(true);
    setInvitesError(null);
    try {
      const companyId = form.companyId || undefined;
      const data = await fetchExternalInvites(companyId);
      setInvites(data);
    } catch (e: any) {
      setInvitesError('Errore nel caricamento degli inviti.');
    } finally {
      setInvitesLoading(false);
    }
  }, [isExternalOwner, form.companyId]);

  useEffect(() => {
    if (isExternalOwner) {
      loadInvites();
    }
  }, [isExternalOwner, loadInvites]);

  if (!isExternalOwner) {
    return null;
  }

  const onChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    if (field === 'companyId') {
      setTimeout(() => {
        loadInvites();
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await createExternalInvite({
        email: form.email.trim(),
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        message: form.message.trim() || undefined,
        companyId: form.companyId || undefined
      });

      setSubmitSuccess('Invito inviato con successo.');
      setForm(prev => ({ ...prev, email: '', firstName: '', lastName: '', message: '' }));
      await loadInvites();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error === 'EMAIL_ALREADY_INVITED') {
        setSubmitError('Questa email è già stata invitata.');
      } else if (err.response && err.response.status === 403) {
        setSubmitError('Non hai i permessi per inviare questo invito.');
      } else {
        setSubmitError('Errore durante l\'invio dell\'invito. Riprova.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '-';
    try {
      return format(new Date(iso), 'dd/MM/yyyy HH:mm', { locale: it });
    } catch {
      return iso;
    }
  };

  return (
    <section className="ep-external-invites-section">
      <Card title="Invita collaboratori esterni">
        <p className="ep-external-invites-description">
          Invia un invito via email ai collaboratori esterni che devono accedere a Elite Portal.
        </p>

        <form className="ep-external-invites-form" onSubmit={handleSubmit} noValidate>
          {availableCompanies.length > 1 && (
            <div className="ep-form-field">
              <label className="ep-label" htmlFor="companyId">Azienda</label>
              <Select
                id="companyId"
                value={form.companyId}
                onChange={onChange('companyId')}
                placeholder="Seleziona azienda"
              >
                <option value="">Tutte le aziende</option>
                {availableCompanies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
          )}

          <div className="ep-form-field">
            <label className="ep-label" htmlFor="email">Email collaboratore *</label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={onChange('email')}
              maxLength={255}
              required
              placeholder="nome.cognome@azienda.it"
            />
            {errors.email && <div className="ep-field-error">{errors.email}</div>}
          </div>

          <div className="ep-form-row">
            <div className="ep-form-field">
              <label className="ep-label" htmlFor="firstName">Nome</label>
              <Input
                id="firstName"
                type="text"
                value={form.firstName}
                onChange={onChange('firstName')}
                maxLength={100}
              />
              {errors.firstName && <div className="ep-field-error">{errors.firstName}</div>}
            </div>

            <div className="ep-form-field">
              <label className="ep-label" htmlFor="lastName">Cognome</label>
              <Input
                id="lastName"
                type="text"
                value={form.lastName}
                onChange={onChange('lastName')}
                maxLength={100}
              />
              {errors.lastName && <div className="ep-field-error">{errors.lastName}</div>}
            </div>
          </div>

          <div className="ep-form-field">
            <label className="ep-label" htmlFor="message">Messaggio personale</label>
            <TextArea
              id="message"
              value={form.message}
              onChange={onChange('message')}
              maxLength={1000}
              rows={3}
              placeholder="Facoltativo: aggiungi un messaggio personalizzato all\'invito"
            />
            {errors.message && <div className="ep-field-error">{errors.message}</div>}
          </div>

          {submitError && <div className="ep-alert ep-alert-error">{submitError}</div>}
          {submitSuccess && <div className="ep-alert ep-alert-success">{submitSuccess}</div>}

          <div className="ep-form-actions">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Invio in corso...' : 'Invia invito'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Inviti inviati">
        <div className="ep-external-invites-header">
          <div className="ep-external-invites-header-left">
            <span>Elenco degli inviti già inviati ai collaboratori esterni.</span>
          </div>
          <div className="ep-external-invites-header-right">
            <Button variant="ghost" onClick={loadInvites} disabled={invitesLoading}>
              {invitesLoading ? <Spinner size="sm" /> : 'Aggiorna'}
            </Button>
          </div>
        </div>

        {invitesError && <div className="ep-alert ep-alert-error">{invitesError}</div>}

        {invitesLoading && invites.length === 0 && (
          <div className="ep-external-invites-loading">
            <Spinner /> Caricamento inviti...
          </div>
        )}

        {!invitesLoading && invites.length === 0 && !invitesError && (
          <div className="ep-external-invites-empty">Nessun invito presente.</div>
        )}

        {invites.length > 0 && (
          <div className="ep-external-invites-table-wrapper">
            <table className="ep-table ep-external-invites-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nome</th>
                  <th>Stato</th>
                  <th>Data invio</th>
                  <th>Scadenza</th>
                </tr>
              </thead>
              <tbody>
                {invites.map(invite => (
                  <tr key={invite.id}>
                    <td>{invite.email}</td>
                    <td>{[invite.firstName, invite.lastName].filter(Boolean).join(' ') || '-'}</td>
                    <td>
                      <span className={`ep-status-badge ep-status-${invite.status.toLowerCase()}`}>
                        {invite.status === 'PENDING' && 'In attesa'}
                        {invite.status === 'ACCEPTED' && 'Accettato'}
                        {invite.status === 'EXPIRED' && 'Scaduto'}
                        {invite.status === 'REVOKED' && 'Revocato'}
                      </span>
                    </td>
                    <td>{formatDate(invite.sentAt)}</td>
                    <td>{formatDate(invite.expiresAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
};
