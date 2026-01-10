import React, { useEffect, useState } from 'react';
import axios from 'axios';

export interface CompetenceProfileTest {
  role: string | null;
  keySkills: string[];
  yearsOfExperience: number | null;
  workingLanguage: string | null;
}

interface ValidationErrors {
  role?: string;
  yearsOfExperience?: string;
  workingLanguage?: string;
}

const API_BASE = process.env.REACT_APP_TEST_API_BASE || 'http://localhost:4001/api/test/competence-profile';

/**
 * Pagina di test funzionale per il profilo competenze.
 * Replica il flusso chiave usato nei test end-to-end (Cypress).
 */
const CompetenceProfileTestPage: React.FC = () => {
  const [profile, setProfile] = useState<CompetenceProfileTest | null>(null);
  const [form, setForm] = useState<CompetenceProfileTest>({
    role: '',
    keySkills: [],
    yearsOfExperience: null,
    workingLanguage: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/profile`, {
          headers: {
            'x-test-user-id': 'standard-user-1',
            'x-test-user-role': 'STANDARD_USER'
          }
        });
        if (cancelled) return;
        const p = response.data;
        const mapped: CompetenceProfileTest = {
          role: p.role,
          keySkills: p.keySkills || [],
          yearsOfExperience: p.yearsOfExperience,
          workingLanguage: p.workingLanguage
        };
        setProfile(mapped);
        setForm(mapped);
      } catch (error) {
        if (cancelled) return;
        setBackendError('Errore nel caricamento del profilo.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleChangeField(field: keyof CompetenceProfileTest, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
    setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleChangeYears(value: string) {
    const parsed = value === '' ? null : Number(value);
    setForm((prev) => ({ ...prev, yearsOfExperience: Number.isNaN(parsed) ? null : parsed }));
    setValidationErrors((prev) => ({ ...prev, yearsOfExperience: undefined }));
  }

  function handleChangeSkills(value: string) {
    const parts = value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setForm((prev) => ({ ...prev, keySkills: parts }));
  }

  function validate(): boolean {
    const errors: ValidationErrors = {};

    if (!form.role || form.role.trim().length === 0) {
      errors.role = 'Il ruolo è obbligatorio.';
    }

    if (form.yearsOfExperience != null && form.yearsOfExperience < 0) {
      errors.yearsOfExperience = 'Gli anni di esperienza non possono essere negativi.';
    }

    if (!form.workingLanguage || form.workingLanguage.trim().length === 0) {
      errors.workingLanguage = 'La lingua di lavoro è obbligatoria.';
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);
    setBackendError(null);

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      const payload = {
        role: form.role,
        keySkills: form.keySkills,
        yearsOfExperience: form.yearsOfExperience,
        workingLanguage: form.workingLanguage
      };

      const response = await axios.put(`${API_BASE}/profile`, payload, {
        headers: {
          'x-test-user-id': 'standard-user-1',
          'x-test-user-role': 'STANDARD_USER'
        }
      });

      const updated: CompetenceProfileTest = {
        role: response.data.role,
        keySkills: response.data.keySkills || [],
        yearsOfExperience: response.data.yearsOfExperience,
        workingLanguage: response.data.workingLanguage
      };

      setProfile(updated);
      setForm(updated);
      setSuccessMessage('Profilo competenze aggiornato con successo.');
    } catch (error: any) {
      if (error.response && error.response.data && error.response.status === 400) {
        const apiErrors = error.response.data.errors || [];
        const newValidationErrors: ValidationErrors = {};
        apiErrors.forEach((e: { field: string; message: string }) => {
          if (e.field === 'role') newValidationErrors.role = e.message;
          if (e.field === 'yearsOfExperience') newValidationErrors.yearsOfExperience = e.message;
          if (e.field === 'workingLanguage') newValidationErrors.workingLanguage = e.message;
        });
        setValidationErrors(newValidationErrors);
        setBackendError('Correggere gli errori evidenziati.');
      } else {
        setBackendError('Errore durante il salvataggio del profilo.');
      }
    } finally {
      setSaving(false);
    }
  }

  const skillsText = form.keySkills.join(', ');

  return (
    <div className="competence-profile-page" data-testid="competence-profile-page">
      <h1>Profilo competenze - Test</h1>

      {loading && <div data-testid="loader">Caricamento profilo in corso...</div>}

      {backendError && (
        <div className="alert alert-danger" data-testid="backend-error">
          {backendError}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success" data-testid="success-message">
          {successMessage}
        </div>
      )}

      {!loading && profile && (
        <form onSubmit={handleSave} data-testid="competence-profile-form">
          <div className="form-group">
            <label htmlFor="role-input">Ruolo</label>
            <input
              id="role-input"
              data-testid="role-input"
              type="text"
              className={validationErrors.role ? 'input error' : 'input'}
              value={form.role || ''}
              onChange={(e) => handleChangeField('role', e.target.value)}
            />
            {validationErrors.role && (
              <div className="field-error" data-testid="role-error">
                {validationErrors.role}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="skills-input">Skills chiave (separate da virgola)</label>
            <input
              id="skills-input"
              data-testid="skills-input"
              type="text"
              className="input"
              value={skillsText}
              onChange={(e) => handleChangeSkills(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="years-input">Anni di esperienza</label>
            <input
              id="years-input"
              data-testid="years-input"
              type="number"
              className={validationErrors.yearsOfExperience ? 'input error' : 'input'}
              value={form.yearsOfExperience != null ? String(form.yearsOfExperience) : ''}
              onChange={(e) => handleChangeYears(e.target.value)}
            />
            {validationErrors.yearsOfExperience && (
              <div className="field-error" data-testid="years-error">
                {validationErrors.yearsOfExperience}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="language-select">Lingua di lavoro</label>
            <select
              id="language-select"
              data-testid="language-select"
              className={validationErrors.workingLanguage ? 'input error' : 'input'}
              value={form.workingLanguage || ''}
              onChange={(e) => handleChangeField('workingLanguage', e.target.value)}
            >
              <option value="">Seleziona...</option>
              <option value="IT">Italiano</option>
              <option value="EN">Inglese</option>
              <option value="ES">Spagnolo</option>
            </select>
            {validationErrors.workingLanguage && (
              <div className="field-error" data-testid="language-error">
                {validationErrors.workingLanguage}
              </div>
            )}
          </div>

          <button
            type="submit"
            data-testid="save-button"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Salvataggio in corso...' : 'Salva'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CompetenceProfileTestPage;
