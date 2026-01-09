import React, { useEffect, useState } from 'react';
import {
  fetchMyProfessionalProfile,
  createProfessionalProfile,
  updateProfessionalProfile,
} from '../api/professionalProfileApi';
import '../styles/ProfessionalProfile.css';

const defaultForm = {
  nome: '',
  cognome: '',
  codiceFiscale: '',
  partitaIva: '',
  email: '',
  pec: '',
  telefono: '',
  cellulare: '',
  indirizzo: '',
  cap: '',
  citta: '',
  provincia: '',
};

export function ProfessionalProfileForm({ userId }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingProfile, setExistingProfile] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    setLoading(true);
    fetchMyProfessionalProfile(userId)
      .then((profile) => {
        if (!mounted) return;
        if (profile) {
          setExistingProfile(profile);
          setForm({
            nome: profile.nome || '',
            cognome: profile.cognome || '',
            codiceFiscale: profile.codiceFiscale || '',
            partitaIva: profile.partitaIva || '',
            email: profile.email || '',
            pec: profile.pec || '',
            telefono: profile.telefono || '',
            cellulare: profile.cellulare || '',
            indirizzo: profile.indirizzo || '',
            cap: profile.cap || '',
            citta: profile.citta || '',
            provincia: profile.provincia || '',
          });
        }
      })
      .catch(() => {
        if (!mounted) return;
        setError('Errore nel caricamento del profilo');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [userId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload = {
        ...form,
      };
      let result;
      if (existingProfile) {
        payload.id = existingProfile.id;
        result = await updateProfessionalProfile(userId, payload);
      } else {
        result = await createProfessionalProfile(userId, payload);
      }
      setExistingProfile(result);
      setSuccess('Profilo salvato con successo');
    } catch (err) {
      setError(err.message || 'Errore nel salvataggio del profilo');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ep-professional-profile">
      <h2>Profilo Professionista</h2>
      {loading && <p>Caricamento profilo in corso...</p>}
      {error && <p className="ep-error">{error}</p>}
      {success && <p className="ep-success">{success}</p>}

      <form onSubmit={handleSubmit} className="ep-professional-profile-form">
        <div className="ep-form-row">
          <label>Nome*</label>
          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="ep-form-row">
          <label>Cognome*</label>
          <input
            type="text"
            name="cognome"
            value={form.cognome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="ep-form-row">
          <label>Codice Fiscale</label>
          <input
            type="text"
            name="codiceFiscale"
            value={form.codiceFiscale}
            onChange={handleChange}
          />
        </div>

        <div className="ep-form-row">
          <label>Partita IVA</label>
          <input
            type="text"
            name="partitaIva"
            value={form.partitaIva}
            onChange={handleChange}
          />
        </div>

        <div className="ep-form-row">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="ep-form-row">
          <label>PEC</label>
          <input
            type="email"
            name="pec"
            value={form.pec}
            onChange={handleChange}
          />
        </div>

        <div className="ep-form-row">
          <label>Telefono</label>
          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
          />
        </div>

        <div className="ep-form-row">
          <label>Cellulare</label>
          <input
            type="text"
            name="cellulare"
            value={form.cellulare}
            onChange={handleChange}
          />
        </div>

        <div className="ep-form-row">
          <label>Indirizzo</label>
          <input
            type="text"
            name="indirizzo"
            value={form.indirizzo}
            onChange={handleChange}
          />
        </div>

        <div className="ep-form-row">
          <label>CAP</label>
          <input
            type="text"
            name="cap"
            value={form.cap}
            onChange={handleChange}
          />
        </div>

        <div className="ep-form-row">
          <label>Città</label>
          <input
            type="text"
            name="citta"
            value={form.citta}
            onChange={handleChange}
          />
        </div>

        <div className="ep-form-row">
          <label>Provincia</label>
          <input
            type="text"
            name="provincia"
            maxLength={2}
            value={form.provincia}
            onChange={handleChange}
          />
        </div>

        <div className="ep-form-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Salvataggio...' : 'Salva profilo'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfessionalProfileForm;
