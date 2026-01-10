import React, { useEffect, useState, FormEvent, KeyboardEvent } from 'react';
import { getCompetenceProfile, updateCompetenceProfile, CompetenceProfileDTO } from '../../api/competenceProfileApi';
import '../../styles/competenceProfile.css';

interface ValidationErrors {
  role?: string;
  primaryLanguage?: string;
  yearsOfExperience?: string;
  generic?: string;
}

const ROLE_OPTIONS: string[] = [
  'Software Engineer',
  'Senior Software Engineer',
  'Tech Lead',
  'Project Manager',
  'Business Analyst',
  'QA Engineer',
];

const LANGUAGE_OPTIONS: { code: string; label: string }[] = [
  { code: 'it-IT', label: 'Italiano' },
  { code: 'en-GB', label: 'Inglese (UK)' },
  { code: 'en-US', label: 'Inglese (US)' },
  { code: 'fr-FR', label: 'Francese' },
  { code: 'de-DE', label: 'Tedesco' },
  { code: 'es-ES', label: 'Spagnolo' },
];

const defaultProfile: CompetenceProfileDTO = {
  role: '',
  keySkills: [],
  yearsOfExperience: null,
  primaryLanguage: '',
};

const CompetenceProfileCard: React.FC = () => {
  const [profile, setProfile] = useState<CompetenceProfileDTO>(defaultProfile);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [newSkill, setNewSkill] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setLoading(true);
      setErrors({});
      try {
        const data = await getCompetenceProfile();
        if (!isMounted) return;
        setProfile({
          role: data.role || '',
          keySkills: data.keySkills || [],
          yearsOfExperience: data.yearsOfExperience,
          primaryLanguage: data.primaryLanguage || '',
        });
      } catch (error) {
        if (!isMounted) return;
        setErrors({ generic: 'Errore nel caricamento del profilo competenze.' });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage('');

    const clientErrors: ValidationErrors = {};
    if (!profile.role || !profile.role.trim()) {
      clientErrors.role = 'Il ruolo è obbligatorio.';
    }
    if (!profile.primaryLanguage || !profile.primaryLanguage.trim()) {
      clientErrors.primaryLanguage = 'La lingua di lavoro principale è obbligatoria.';
    }
    if (profile.yearsOfExperience != null) {
      if (Number.isNaN(profile.yearsOfExperience)) {
        clientErrors.yearsOfExperience = 'Anni di esperienza deve essere un numero valido.';
      } else if (profile.yearsOfExperience < 0) {
        clientErrors.yearsOfExperience = 'Anni di esperienza non può essere negativo.';
      } else if (profile.yearsOfExperience > 60) {
        clientErrors.yearsOfExperience = 'Anni di esperienza non può essere maggiore di 60.';
      }
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSaving(true);
    setErrors({});
    try {
      const payload: CompetenceProfileDTO = {
        role: profile.role.trim(),
        keySkills: profile.keySkills,
        yearsOfExperience:
          profile.yearsOfExperience !== null && profile.yearsOfExperience !== undefined
            ? Number(profile.yearsOfExperience)
            : null,
        primaryLanguage: profile.primaryLanguage.trim(),
      };

      const updated = await updateCompetenceProfile(payload);
      setProfile({
        role: updated.role || '',
        keySkills: updated.keySkills || [],
        yearsOfExperience: updated.yearsOfExperience,
        primaryLanguage: updated.primaryLanguage || '',
      });
      setSuccessMessage('Profilo competenze aggiornato con successo.');
    } catch (error: any) {
      if (error?.response?.status === 400 && error.response.data?.errors) {
        const apiErrors = error.response.data.errors as Record<string, string>;
        const newErrors: ValidationErrors = {};
        if (apiErrors.role) newErrors.role = apiErrors.role;
        if (apiErrors.primaryLanguage) newErrors.primaryLanguage = apiErrors.primaryLanguage;
        if (apiErrors.yearsOfExperience) newErrors.yearsOfExperience = apiErrors.yearsOfExperience;
        newErrors.generic = error.response.data.message || 'Errore di validazione.';
        setErrors(newErrors);
      } else {
        setErrors({ generic: 'Errore nel salvataggio del profilo competenze.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    const skill = newSkill.trim();
    if (!skill) return;
    if (profile.keySkills.includes(skill)) {
      setNewSkill('');
      return;
    }
    setProfile((prev) => ({ ...prev, keySkills: [...prev.keySkills, skill] }));
    setNewSkill('');
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile((prev) => ({ ...prev, keySkills: prev.keySkills.filter((s) => s !== skill) }));
  };

  return (
    <section
      className="ep-card ep-competence-profile-card"
      aria-labelledby="competence-profile-title"
    >
      <div className="ep-card-header">
        <h2 id="competence-profile-title" className="ep-card-title">
          Profilo competenze / Metadati CV
        </h2>
        <p className="ep-card-subtitle">
          Gestisci ruolo, competenze chiave, anni di esperienza e lingua di lavoro principale.
        </p>
      </div>

      {errors.generic && (
        <div className="ep-alert ep-alert-error" role="alert">
          {errors.generic}
        </div>
      )}

      {successMessage && (
        <div className="ep-alert ep-alert-success" role="status">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="ep-loading" aria-busy="true">
          Caricamento profilo competenze...
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate aria-describedby="competence-profile-help">
          <div id="competence-profile-help" className="ep-visually-hidden">
            I campi contrassegnati con asterisco sono obbligatori.
          </div>

          <div className="ep-form-grid">
            <div className="ep-form-field">
              <label htmlFor="cp-role" className="ep-label">
                Ruolo <span className="ep-required">*</span>
              </label>
              <select
                id="cp-role"
                className={`ep-input ${errors.role ? 'ep-input-error' : ''}`}
                value={profile.role || ''}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    role: e.target.value,
                  }))
                }
                aria-invalid={!!errors.role}
                aria-describedby={errors.role ? 'cp-role-error' : undefined}
              >
                <option value="">Seleziona ruolo...</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.role && (
                <div id="cp-role-error" className="ep-field-error">
                  {errors.role}
                </div>
              )}
            </div>

            <div className="ep-form-field">
              <label htmlFor="cp-years" className="ep-label">
                Anni di esperienza
              </label>
              <input
                id="cp-years"
                type="number"
                min={0}
                max={60}
                className={`ep-input ${errors.yearsOfExperience ? 'ep-input-error' : ''}`}
                value={profile.yearsOfExperience ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setProfile((prev) => ({
                    ...prev,
                    yearsOfExperience: val === '' ? null : Number(val),
                  }));
                }}
                aria-invalid={!!errors.yearsOfExperience}
                aria-describedby="cp-years-help cp-years-tooltip"
              />
              <div id="cp-years-tooltip" className="ep-field-help">
                Inserisci gli anni complessivi di esperienza nel ruolo attuale o in ruoli simili.
              </div>
              {errors.yearsOfExperience && (
                <div id="cp-years-help" className="ep-field-error">
                  {errors.yearsOfExperience}
                </div>
              )}
            </div>

            <div className="ep-form-field">
              <label htmlFor="cp-language" className="ep-label">
                Lingua di lavoro principale <span className="ep-required">*</span>
              </label>
              <select
                id="cp-language"
                className={`ep-input ${errors.primaryLanguage ? 'ep-input-error' : ''}`}
                value={profile.primaryLanguage || ''}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    primaryLanguage: e.target.value,
                  }))
                }
                aria-invalid={!!errors.primaryLanguage}
                aria-describedby={errors.primaryLanguage ? 'cp-language-error' : undefined}
              >
                <option value="">Seleziona lingua...</option>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label} ({lang.code})
                  </option>
                ))}
              </select>
              {errors.primaryLanguage && (
                <div id="cp-language-error" className="ep-field-error">
                  {errors.primaryLanguage}
                </div>
              )}
            </div>
          </div>

          <div className="ep-form-field">
            <label htmlFor="cp-skills-input" className="ep-label">
              Skills chiave
            </label>
            <div className="ep-skills-input-wrapper">
              <input
                id="cp-skills-input"
                type="text"
                className="ep-input ep-skills-input"
                placeholder="Aggiungi una skill e premi Invio o clicca su Aggiungi"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleSkillKeyDown}
              />
              <button
                type="button"
                className="ep-btn ep-btn-secondary ep-skills-add-btn"
                onClick={handleAddSkill}
              >
                Aggiungi
              </button>
            </div>
            <div className="ep-field-help">
              Le skills chiave sono opzionali ma raccomandate per una migliore ricerca interna.
            </div>
            {profile.keySkills.length > 0 && (
              <ul className="ep-skills-list" aria-label="Skills chiave attuali">
                {profile.keySkills.map((skill) => (
                  <li key={skill} className="ep-skill-tag">
                    <span className="ep-skill-label">{skill}</span>
                    <button
                      type="button"
                      className="ep-skill-remove-btn"
                      onClick={() => handleRemoveSkill(skill)}
                      aria-label={`Rimuovi skill ${skill}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="ep-form-actions">
            <button
              type="submit"
              className="ep-btn ep-btn-primary"
              disabled={saving}
              aria-busy={saving}
            >
              {saving ? 'Salvataggio in corso...' : 'Salva profilo competenze'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default CompetenceProfileCard;
