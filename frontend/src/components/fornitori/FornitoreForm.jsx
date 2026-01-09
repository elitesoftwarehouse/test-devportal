import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const emptyForm = {
  ragioneSociale: '',
  partitaIva: '',
  codiceFiscale: '',
  email: '',
  telefono: '',
  indirizzo: '',
  cap: '',
  citta: '',
  provincia: '',
  stato: ''
};

export function FornitoreForm({ initialValue, onSubmit, onCancel, saving, error }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialValue) {
      setForm({
        ragioneSociale: initialValue.ragioneSociale || '',
        partitaIva: initialValue.partitaIva || '',
        codiceFiscale: initialValue.codiceFiscale || '',
        email: initialValue.email || '',
        telefono: initialValue.telefono || '',
        indirizzo: initialValue.indirizzo || '',
        cap: initialValue.cap || '',
        citta: initialValue.citta || '',
        provincia: initialValue.provincia || '',
        stato: initialValue.stato || ''
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialValue]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      codiceFiscale: form.codiceFiscale || null,
      telefono: form.telefono || null,
      indirizzo: form.indirizzo || null,
      cap: form.cap || null,
      citta: form.citta || null,
      provincia: form.provincia || null,
      stato: form.stato || null
    };
    onSubmit(payload);
  }

  return (
    <form className="fornitore-form" onSubmit={handleSubmit}>
      {error && (
        <div className="fornitore-form__error">
          {typeof error === 'string' ? error : error.message}
        </div>
      )}
      <div className="fornitore-form__row">
        <label>
          Ragione sociale*
          <input
            name="ragioneSociale"
            value={form.ragioneSociale}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <div className="fornitore-form__row">
        <label>
          Partita IVA*
          <input
            name="partitaIva"
            value={form.partitaIva}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Codice Fiscale
          <input
            name="codiceFiscale"
            value={form.codiceFiscale}
            onChange={handleChange}
          />
        </label>
      </div>
      <div className="fornitore-form__row">
        <label>
          Email*
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Telefono
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
          />
        </label>
      </div>
      <div className="fornitore-form__row">
        <label>
          Indirizzo
          <input
            name="indirizzo"
            value={form.indirizzo}
            onChange={handleChange}
          />
        </label>
      </div>
      <div className="fornitore-form__row">
        <label>
          CAP
          <input name="cap" value={form.cap} onChange={handleChange} />
        </label>
        <label>
          Città
          <input name="citta" value={form.citta} onChange={handleChange} />
        </label>
        <label>
          Provincia
          <input name="provincia" value={form.provincia} onChange={handleChange} />
        </label>
        <label>
          Stato
          <input name="stato" value={form.stato} onChange={handleChange} />
        </label>
      </div>
      <div className="fornitore-form__actions">
        <button type="button" onClick={onCancel} disabled={saving}>
          Annulla
        </button>
        <button type="submit" disabled={saving}>
          {saving ? 'Salvataggio...' : 'Salva'}
        </button>
      </div>
    </form>
  );
}

FornitoreForm.propTypes = {
  initialValue: PropTypes.any,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  error: PropTypes.any
};

export default FornitoreForm;
