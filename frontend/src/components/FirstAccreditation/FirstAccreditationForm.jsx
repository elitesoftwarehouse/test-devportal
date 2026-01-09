import React, { useState } from 'react';
import {
  createCompanyFirstAccreditationDraft,
  completeCompanyFirstAccreditation,
  getCompanyById
} from '../../api/companyFirstAccreditationApi';
import './FirstAccreditationForm.css';

const initialFormState = {
  ragioneSociale: '',
  partitaIva: '',
  codiceFiscale: '',
  sedeLegale: {
    indirizzo: '',
    cap: '',
    citta: '',
    provincia: ''
  },
  email: '',
  telefono: ''
};

export const FirstAccreditationForm = () => {
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [companyId, setCompanyId] = useState(null);
  const [statoAccreditamento, setStatoAccreditamento] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('sedeLegale.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        sedeLegale: {
          ...prev.sedeLegale,
          [key]: value
        }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateDraft = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const company = await createCompanyFirstAccreditationDraft(form);
      setCompanyId(company.id);
      setStatoAccreditamento(company.statoAccreditamento);
      setSuccess('Bozza azienda creata con successo.');
    } catch (err) {
      const message = err?.response?.data?.message || 'Errore durante la creazione della bozza.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!companyId) {
      setError('Nessuna bozza azienda disponibile. Crea prima la bozza.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const company = await completeCompanyFirstAccreditation(companyId, form);
      setStatoAccreditamento(company.statoAccreditamento);
      setSuccess('Primo accreditamento confermato. Azienda attiva.');
    } catch (err) {
      const message = err?.response?.data?.message || 'Errore durante la conferma del primo accreditamento.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadExisting = async () => {
    if (!companyId) {
      setError('Inserisci un ID azienda valido.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const company = await getCompanyById(companyId);
      setForm({
        ragioneSociale: company.ragioneSociale,
        partitaIva: company.partitaIva,
        codiceFiscale: company.codiceFiscale || '',
        sedeLegale: company.sedeLegale || {
          indirizzo: company.sedeLegaleIndirizzo || '',
          cap: company.sedeLegaleCap || '',
          citta: company.sedeLegaleCitta || '',
          provincia: company.sedeLegaleProvincia || ''
        },
        email: company.email,
        telefono: company.telefono || ''
      });
      setStatoAccreditamento(company.statoAccreditamento);
      setSuccess('Dati azienda caricati.');
    } catch (err) {
      const message = err?.response?.data?.message || 'Errore durante il caricamento dei dati aziendali.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="first-accreditation-container">
      <h2>Primo accreditamento azienda</h2>

      <div className="first-accreditation-status">
        <label>
          ID Azienda (bozza esistente, opzionale):
          <input
            type="number"
            value={companyId || ''}
            onChange={(e) => setCompanyId(e.target.value ? parseInt(e.target.value, 10) : null)}
          />
        </label>
        <button type="button" onClick={handleLoadExisting} disabled={!companyId || loading}>
          Carica dati azienda
        </button>
        {statoAccreditamento && (
          <span className="status-badge">Stato accreditamento: {statoAccreditamento}</span>
        )}
      </div>

      <form className="first-accreditation-form">
        <div className="form-row">
          <label>
            Ragione sociale*
            <input
              type="text"
              name="ragioneSociale"
              value={form.ragioneSociale}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Partita IVA*
            <input
              type="text"
              name="partitaIva"
              value={form.partitaIva}
              onChange={handleChange}
            />
          </label>
          <label>
            Codice fiscale
            <input
              type="text"
              name="codiceFiscale"
              value={form.codiceFiscale}
              onChange={handleChange}
            />
          </label>
        </div>

        <fieldset className="form-fieldset">
          <legend>Sede legale*</legend>
          <div className="form-row">
            <label>
              Indirizzo
              <input
                type="text"
                name="sedeLegale.indirizzo"
                value={form.sedeLegale.indirizzo}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              CAP
              <input
                type="text"
                name="sedeLegale.cap"
                value={form.sedeLegale.cap}
                onChange={handleChange}
              />
            </label>
            <label>
              Città
              <input
                type="text"
                name="sedeLegale.citta"
                value={form.sedeLegale.citta}
                onChange={handleChange}
              />
            </label>
            <label>
              Provincia
              <input
                type="text"
                name="sedeLegale.provincia"
                value={form.sedeLegale.provincia}
                onChange={handleChange}
              />
            </label>
          </div>
        </fieldset>

        <div className="form-row">
          <label>
            Email aziendale*
            <input type="email" name="email" value={form.email} onChange={handleChange} />
          </label>
          <label>
            Telefono
            <input type="text" name="telefono" value={form.telefono} onChange={handleChange} />
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" onClick={handleCreateDraft} disabled={loading}>
            Salva bozza
          </button>
          <button type="button" onClick={handleConfirm} disabled={loading || !companyId}>
            Conferma accreditamento
          </button>
        </div>

        {loading && <p className="info-message">Operazione in corso...</p>}
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
    </div>
  );
};

export default FirstAccreditationForm;
