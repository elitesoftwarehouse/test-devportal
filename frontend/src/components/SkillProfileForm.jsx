import React, { useEffect, useState } from 'react';
import { fetchMySkillProfile, updateMySkillProfile } from '../api/skillProfileApi';
import './SkillProfile.css';

const MOCK_USER_ID = 1; // solo per ambiente di sviluppo

export function SkillProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [role, setRole] = useState('');
  const [keySkills, setKeySkills] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('');
  const [summary, setSummary] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchMySkillProfile(MOCK_USER_ID)
      .then((data) => {
        if (!isMounted) return;
        setRole(data.role || '');
        setKeySkills((data.keySkills || []).join(', '));
        setYearsOfExperience(
          typeof data.yearsOfExperience === 'number' ? String(data.yearsOfExperience) : ''
        );
        setPrimaryLanguage(data.primaryLanguage || '');
        setSummary(data.summary || '');
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.response?.data?.message || 'Errore nel caricamento del profilo');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const skillsArray = keySkills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      role: role || null,
      keySkills: skillsArray,
      yearsOfExperience: yearsOfExperience === '' ? null : Number(yearsOfExperience),
      primaryLanguage: primaryLanguage || null,
      summary: summary || null,
    };

    try {
      await updateMySkillProfile(payload, MOCK_USER_ID);
      setSuccess('Profilo competenze aggiornato con successo.');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Errore durante il salvataggio del profilo competenze';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="skill-profile-card">Caricamento profilo competenze...</div>;
  }

  return (
    <div className="skill-profile-card">
      <h2>Profilo competenze</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit} className="skill-profile-form">
        <div className="form-row">
          <label htmlFor="role">Ruolo principale</label>
          <input
            id="role"
            type="text"
            value={role}
            maxLength={100}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label htmlFor="keySkills">Competenze chiave (separate da virgola)</label>
          <input
            id="keySkills"
            type="text"
            value={keySkills}
            onChange={(e) => setKeySkills(e.target.value)}
          />
        </div>

        <div className="form-row-inline">
          <div className="form-row">
            <label htmlFor="yearsOfExperience">Anni di esperienza</label>
            <input
              id="yearsOfExperience"
              type="number"
              min={0}
              max={60}
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="primaryLanguage">Lingua di lavoro principale (ISO, es. it, en)</label>
            <input
              id="primaryLanguage"
              type="text"
              value={primaryLanguage}
              maxLength={5}
              onChange={(e) => setPrimaryLanguage(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="summary">Descrizione sintetica profilo</label>
          <textarea
            id="summary"
            value={summary}
            maxLength={1000}
            rows={4}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Salvataggio in corso...' : 'Salva profilo'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SkillProfileForm;
