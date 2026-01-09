import React, { useEffect, useState } from 'react';
import axios from 'axios';

const initialFormState = {
  nome: '',
  cognome: '',
  email: '',
  codiceFiscale: '',
  partitaIva: '',
  indirizzo: '',
  cap: '',
  citta: '',
  provincia: '',
  telefono: ''
};

const validateClient = (values) => {
  const errors = {};
  if (!values.nome) {
    errors.nome = 'Il nome è obbligatorio.';
  }
  if (!values.cognome) {
    errors.cognome = 'Il cognome è obbligatorio.';
  }
  if (!values.email || !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Inserire un indirizzo email valido.';
  }
  if (!values.codiceFiscale || values.codiceFiscale.length !== 16) {
    errors.codiceFiscale = 'Inserire un codice fiscale valido (16 caratteri).';
  }
  if (values.partitaIva && values.partitaIva.length !== 11) {
    errors.partitaIva = 'Inserire una partita IVA valida (11 caratteri).';
  }
  if (!values.cap || !/^\d{5}$/.test(values.cap)) {
    errors.cap = 'Inserire un CAP valido (5 cifre).';
  }
  if (!values.telefono || !/^\+?[0-9]{6,15}$/.test(values.telefono)) {
    errors.telefono = 'Inserire un numero di telefono valido.';
  }
  return errors;
};

export const ProfessionistaProfiloPage = () => {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setApiError(null);
      try {
        const response = await axios.get('/api/professionista/profilo');
        if (!cancelled) {
          setForm({
            ...initialFormState,
            ...response.data
          });
          setHasProfile(true);
        }
      } catch (error) {
        if (!cancelled) {
          if (error.response && error.response.status === 404) {
            setHasProfile(false);
          } else {
            setApiError('Errore nel caricamento del profilo. Riprova più tardi.');
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: undefined
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage('');
    setApiError(null);

    const clientErrors = validateClient(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);
    try {
      if (hasProfile) {
        const response = await axios.put('/api/professionista/profilo', form);
        setForm(response.data);
        setSuccessMessage('Profilo aggiornato con successo.');
      } else {
        const response = await axios.post('/api/professionista/profilo', form);
        setForm(response.data);
        setHasProfile(true);
        setSuccessMessage('Profilo creato con successo.');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setApiError('Si è verificato un errore durante il salvataggio del profilo. Riprova.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" data-testid="professionista-profilo-page">
      <h1>Profilo Professionista</h1>

      {loadingProfile && (
        <div data-testid="profilo-loading">Caricamento profilo in corso...</div>
      )}

      {apiError && !loadingProfile && (
        <div
          className="alert alert-danger"
          data-testid="profilo-api-error"
        >
          {apiError}
        </div>
      )}

      {!loadingProfile && (
        <form onSubmit={handleSubmit} data-testid="profilo-form">
          <fieldset disabled={loading}>
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                name="nome"
                type="text"
                className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                value={form.nome}
                onChange={handleChange}
                data-testid="input-nome"
              />
              {errors.nome && (
                <div className="invalid-feedback" data-testid="error-nome">
                  {errors.nome}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="cognome">Cognome</label>
              <input
                id="cognome"
                name="cognome"
                type="text"
                className={`form-control ${errors.cognome ? 'is-invalid' : ''}`}
                value={form.cognome}
                onChange={handleChange}
                data-testid="input-cognome"
              />
              {errors.cognome && (
                <div className="invalid-feedback" data-testid="error-cognome">
                  {errors.cognome}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                value={form.email}
                onChange={handleChange}
                data-testid="input-email"
              />
              {errors.email && (
                <div className="invalid-feedback" data-testid="error-email">
                  {errors.email}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="codiceFiscale">Codice Fiscale</label>
              <input
                id="codiceFiscale"
                name="codiceFiscale"
                type="text"
                className={`form-control ${errors.codiceFiscale ? 'is-invalid' : ''}`}
                value={form.codiceFiscale}
                onChange={handleChange}
                data-testid="input-codice-fiscale"
              />
              {errors.codiceFiscale && (
                <div className="invalid-feedback" data-testid="error-codice-fiscale">
                  {errors.codiceFiscale}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="partitaIva">Partita IVA</label>
              <input
                id="partitaIva"
                name="partitaIva"
                type="text"
                className={`form-control ${errors.partitaIva ? 'is-invalid' : ''}`}
                value={form.partitaIva}
                onChange={handleChange}
                data-testid="input-partita-iva"
              />
              {errors.partitaIva && (
                <div className="invalid-feedback" data-testid="error-partita-iva">
                  {errors.partitaIva}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="indirizzo">Indirizzo</label>
              <input
                id="indirizzo"
                name="indirizzo"
                type="text"
                className="form-control"
                value={form.indirizzo}
                onChange={handleChange}
                data-testid="input-indirizzo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cap">CAP</label>
              <input
                id="cap"
                name="cap"
                type="text"
                className={`form-control ${errors.cap ? 'is-invalid' : ''}`}
                value={form.cap}
                onChange={handleChange}
                data-testid="input-cap"
              />
              {errors.cap && (
                <div className="invalid-feedback" data-testid="error-cap">
                  {errors.cap}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="citta">Città</label>
              <input
                id="citta"
                name="citta"
                type="text"
                className="form-control"
                value={form.citta}
                onChange={handleChange}
                data-testid="input-citta"
              />
            </div>

            <div className="form-group">
              <label htmlFor="provincia">Provincia</label>
              <input
                id="provincia"
                name="provincia"
                type="text"
                className="form-control"
                value={form.provincia}
                onChange={handleChange}
                data-testid="input-provincia"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Telefono</label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                value={form.telefono}
                onChange={handleChange}
                data-testid="input-telefono"
              />
              {errors.telefono && (
                <div className="invalid-feedback" data-testid="error-telefono">
                  {errors.telefono}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              data-testid="btn-salva-profilo"
            >
              {loading ? 'Salvataggio in corso...' : hasProfile ? 'Salva modifiche' : 'Crea profilo'}
            </button>
          </fieldset>
        </form>
      )}

      {successMessage && (
        <div
          className="alert alert-success mt-3"
          data-testid="profilo-success-message"
        >
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default ProfessionistaProfiloPage;
