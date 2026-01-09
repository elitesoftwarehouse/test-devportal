import React, { useEffect, useState } from 'react';
import {
  fetchProfessionalProfile,
  createProfessionalProfile,
  updateProfessionalProfile,
} from '../api/professionalProfileApi';
import '../styles/ProfessionalProfileForm.css';

const initialState = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  placeOfBirth: '',
  taxCode: '',
  vatNumber: '',
  address: '',
  zipCode: '',
  city: '',
  province: '',
  country: 'Italia',
  phone: '',
  mobilePhone: '',
  email: '',
  pecEmail: '',
  sdiCode: '',
};

export default function ProfessionalProfileForm() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exists, setExists] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const profile = await fetchProfessionalProfile();
        if (mounted && profile) {
          setExists(true);
          setForm({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            dateOfBirth: profile.dateOfBirth || '',
            placeOfBirth: profile.placeOfBirth || '',
            taxCode: profile.taxCode || '',
            vatNumber: profile.vatNumber || '',
            address: profile.address || '',
            zipCode: profile.zipCode || '',
            city: profile.city || '',
            province: profile.province || '',
            country: profile.country || 'Italia',
            phone: profile.phone || '',
            mobilePhone: profile.mobilePhone || '',
            email: profile.email || '',
            pecEmail: profile.pecEmail || '',
            sdiCode: profile.sdiCode || '',
          });
        }
      } catch (e) {
        if (mounted) setError('Errore nel caricamento del profilo.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = { ...form };
      if (!payload.taxCode) payload.taxCode = null;
      if (!payload.vatNumber) payload.vatNumber = null;
      if (!payload.dateOfBirth) payload.dateOfBirth = null;
      if (!payload.placeOfBirth) payload.placeOfBirth = null;
      if (!payload.address) payload.address = null;
      if (!payload.zipCode) payload.zipCode = null;
      if (!payload.city) payload.city = null;
      if (!payload.province) payload.province = null;
      if (!payload.country) payload.country = payload.country || 'Italia';
      if (!payload.phone) payload.phone = null;
      if (!payload.mobilePhone) payload.mobilePhone = null;
      if (!payload.email) payload.email = null;
      if (!payload.pecEmail) payload.pecEmail = null;
      if (!payload.sdiCode) payload.sdiCode = null;

      if (!exists) {
        await createProfessionalProfile(payload);
        setExists(true);
        setSuccess('Profilo creato con successo.');
      } else {
        await updateProfessionalProfile(payload);
        setSuccess('Profilo aggiornato con successo.');
      }
    } catch (err) {
      const code = err?.response?.data?.error?.code || '';
      if (code === 'validation.required') {
        setError('Compila tutti i campi obbligatori.');
      } else if (code === 'professionalProfile.alreadyExists') {
        setError('Esiste già un profilo associato a questo utente.');
      } else if (code.startsWith('validation.')) {
        setError('Alcuni dati inseriti non sono validi. Verifica i campi.');
      } else {
        setError('Errore nel salvataggio del profilo.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="professional-profile-form">
      <h2>Profilo Professionista</h2>
      {loading ? (
        <div className="ppf-message">Caricamento in corso...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div className="ppf-alert ppf-alert-error">{error}</div>}
          {success && <div className="ppf-alert ppf-alert-success">{success}</div>}

          <div className="ppf-row">
            <div className="ppf-field">
              <label htmlFor="firstName">Nome *</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>
            <div className="ppf-field">
              <label htmlFor="lastName">Cognome *</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>
          </div>

          <div className="ppf-row">
            <div className="ppf-field">
              <label htmlFor="dateOfBirth">Data di nascita</label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth || ''}
                onChange={handleChange}
              />
            </div>
            <div className="ppf-field">
              <label htmlFor="placeOfBirth">Luogo di nascita</label>
              <input
                id="placeOfBirth"
                name="placeOfBirth"
                type="text"
                value={form.placeOfBirth}
                onChange={handleChange}
                maxLength={150}
              />
            </div>
          </div>

          <div className="ppf-row">
            <div className="ppf-field">
              <label htmlFor="taxCode">Codice fiscale</label>
              <input
                id="taxCode"
                name="taxCode"
                type="text"
                value={form.taxCode}
                onChange={handleChange}
                maxLength={16}
              />
            </div>
            <div className="ppf-field">
              <label htmlFor="vatNumber">Partita IVA</label>
              <input
                id="vatNumber"
                name="vatNumber"
                type="text"
                value={form.vatNumber}
                onChange={handleChange}
                maxLength={20}
              />
            </div>
          </div>

          <div className="ppf-row">
            <div className="ppf-field ppf-field-full">
              <label htmlFor="address">Indirizzo</label>
              <input
                id="address"
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                maxLength={255}
              />
            </div>
          </div>

          <div className="ppf-row">
            <div className="ppf-field">
              <label htmlFor="zipCode">CAP</label>
              <input
                id="zipCode"
                name="zipCode"
                type="text"
                value={form.zipCode}
                onChange={handleChange}
                maxLength={10}
              />
            </div>
            <div className="ppf-field">
              <label htmlFor="city">Città</label>
              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                maxLength={150}
              />
            </div>
            <div className="ppf-field">
              <label htmlFor="province">Provincia</label>
              <input
                id="province"
                name="province"
                type="text"
                value={form.province}
                onChange={handleChange}
                maxLength={50}
              />
            </div>
          </div>

          <div className="ppf-row">
            <div className="ppf-field">
              <label htmlFor="country">Nazione</label>
              <input
                id="country"
                name="country"
                type="text"
                value={form.country}
                onChange={handleChange}
                maxLength={100}
              />
            </div>
          </div>

          <div className="ppf-row">
            <div className="ppf-field">
              <label htmlFor="phone">Telefono</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                maxLength={20}
              />
            </div>
            <div className="ppf-field">
              <label htmlFor="mobilePhone">Cellulare</label>
              <input
                id="mobilePhone"
                name="mobilePhone"
                type="tel"
                value={form.mobilePhone}
                onChange={handleChange}
                maxLength={20}
              />
            </div>
          </div>

          <div className="ppf-row">
            <div className="ppf-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                maxLength={255}
              />
            </div>
            <div className="ppf-field">
              <label htmlFor="pecEmail">PEC</label>
              <input
                id="pecEmail"
                name="pecEmail"
                type="email"
                value={form.pecEmail}
                onChange={handleChange}
                maxLength={255}
              />
            </div>
          </div>

          <div className="ppf-row">
            <div className="ppf-field">
              <label htmlFor="sdiCode">Codice SDI</label>
              <input
                id="sdiCode"
                name="sdiCode"
                type="text"
                value={form.sdiCode}
                onChange={handleChange}
                maxLength={7}
              />
            </div>
          </div>

          <div className="ppf-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Salvataggio...' : exists ? 'Aggiorna profilo' : 'Crea profilo'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
