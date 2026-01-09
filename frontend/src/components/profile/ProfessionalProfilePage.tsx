import React, { useEffect, useMemo, useState } from 'react';
import {
  getProfessionalProfile,
  createProfessionalProfile,
  updateProfessionalProfile,
  ProfessionalProfileDto,
} from '../../api/professionalProfileApi';
import './ProfessionalProfilePage.css';

// Pattern di validazione coerenti con il backend
const CF_REGEX = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i;
const PIVA_REGEX = /^[0-9]{11}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ValidationErrors {
  [key: string]: string | undefined;
}

const emptyProfile: ProfessionalProfileDto = {
  firstName: '',
  lastName: '',
  birthDate: '',
  birthPlace: '',
  email: '',
  phone: '',
  mobile: '',
  addressStreet: '',
  addressZip: '',
  addressCity: '',
  addressProvince: '',
  addressCountry: 'IT',
  fiscalCode: '',
  vatNumber: '',
  taxResidenceStreet: '',
  taxResidenceZip: '',
  taxResidenceCity: '',
  taxResidenceProvince: '',
  taxResidenceCountry: 'IT',
};

const ProfessionalProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfessionalProfileDto>(emptyProfile);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'anagrafica' | 'recapiti' | 'fiscali'>('anagrafica');
  const [exists, setExists] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    getProfessionalProfile()
      .then((data) => {
        if (data) {
          setProfile({ ...emptyProfile, ...data });
          setExists(true);
        } else {
          setProfile(emptyProfile);
          setExists(false);
        }
      })
      .catch(() => {
        setGlobalError('Errore durante il caricamento del profilo Professionista.');
      })
      .finally(() => {
        setLoading(false);
        setInitialLoaded(true);
      });
  }, []);

  const validate = (p: ProfessionalProfileDto): ValidationErrors => {
    const v: ValidationErrors = {};
    if (!p.firstName || !p.firstName.trim()) {
      v.firstName = 'Nome obbligatorio';
    }
    if (!p.lastName || !p.lastName.trim()) {
      v.lastName = 'Cognome obbligatorio';
    }
    if (!p.email || !EMAIL_REGEX.test(p.email)) {
      v.email = 'Email non valida';
    }
    if (!p.fiscalCode || !CF_REGEX.test(p.fiscalCode)) {
      v.fiscalCode = 'Codice fiscale non valido';
    }
    if (p.vatNumber && !PIVA_REGEX.test(p.vatNumber)) {
      v.vatNumber = 'Partita IVA non valida';
    }
    return v;
  };

  const handleChange = (field: keyof ProfessionalProfileDto, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setGlobalError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setGlobalError(null);

    const v = validate(profile);
    if (Object.keys(v).length > 0) {
      setErrors(v);
      const firstKey = Object.keys(v)[0] as keyof ProfessionalProfileDto;
      if (['firstName', 'lastName', 'birthDate', 'birthPlace', 'fiscalCode'].includes(firstKey as string)) {
        setActiveTab('anagrafica');
      } else if (['email', 'phone', 'mobile', 'addressStreet', 'addressZip', 'addressCity', 'addressProvince'].includes(firstKey as string)) {
        setActiveTab('recapiti');
      } else {
        setActiveTab('fiscali');
      }
      return;
    }

    setSaving(true);
    try {
      let saved: ProfessionalProfileDto;
      if (exists) {
        saved = await updateProfessionalProfile(profile);
      } else {
        saved = await createProfessionalProfile(profile);
        setExists(true);
      }
      setProfile({ ...profile, ...saved });
      setSuccess('Profilo Professionista salvato correttamente.');
    } catch (err: any) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.errors) {
          setErrors(data.errors);
        }
        setGlobalError(data.message || 'Errore durante il salvataggio del profilo.');
      } else {
        setGlobalError('Errore di comunicazione con il server.');
      }
    } finally {
      setSaving(false);
    }
  };

  const isFirstAccess = useMemo(() => initialLoaded && !exists, [initialLoaded, exists]);

  return (
    <div className="ep-page ep-professional-profile-page">
      <div className="ep-page-header">
        <h1>Profilo Professionista</h1>
        <p className="ep-page-subtitle">
          Gestisci i tuoi dati anagrafici, di contatto e fiscali utilizzati per Ordini di Lavoro, CV e documenti fiscali.
        </p>
      </div>

      {loading && <div className="ep-loader">Caricamento profilo...</div>}

      {!loading && isFirstAccess && (
        <div className="ep-info-box ep-info-box-primary">
          <h2>Primo accesso</h2>
          <p>
            Non hai ancora un profilo Professionista. Compila il form sottostante e premi "Crea profilo" per iniziare ad
            utilizzare le funzionalità avanzate del portale.
          </p>
        </div>
      )}

      {!loading && (
        <form className="ep-form ep-professional-profile-form" onSubmit={handleSubmit} noValidate>
          <div className="ep-tabs">
            <button
              type="button"
              className={`ep-tab ${activeTab === 'anagrafica' ? 'ep-tab-active' : ''}`}
              onClick={() => setActiveTab('anagrafica')}
            >
              Dati anagrafici
            </button>
            <button
              type="button"
              className={`ep-tab ${activeTab === 'recapiti' ? 'ep-tab-active' : ''}`}
              onClick={() => setActiveTab('recapiti')}
            >
              Recapiti
            </button>
            <button
              type="button"
              className={`ep-tab ${activeTab === 'fiscali' ? 'ep-tab-active' : ''}`}
              onClick={() => setActiveTab('fiscali')}
            >
              Dati fiscali
            </button>
          </div>

          {globalError && <div className="ep-alert ep-alert-error">{globalError}</div>}
          {success && <div className="ep-alert ep-alert-success">{success}</div>}

          {activeTab === 'anagrafica' && (
            <section className="ep-form-section">
              <h2>Dati anagrafici</h2>
              <div className="ep-form-grid">
                <div className="ep-form-field">
                  <label htmlFor="firstName">
                    Nome <span className="ep-required">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                  />
                  {errors.firstName && <div className="ep-field-error">{errors.firstName}</div>}
                </div>

                <div className="ep-form-field">
                  <label htmlFor="lastName">
                    Cognome <span className="ep-required">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                  />
                  {errors.lastName && <div className="ep-field-error">{errors.lastName}</div>}
                </div>

                <div className="ep-form-field">
                  <label htmlFor="birthDate">Data di nascita</label>
                  <input
                    id="birthDate"
                    type="date"
                    value={profile.birthDate || ''}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                  />
                </div>

                <div className="ep-form-field">
                  <label htmlFor="birthPlace">Luogo di nascita</label>
                  <input
                    id="birthPlace"
                    type="text"
                    value={profile.birthPlace || ''}
                    onChange={(e) => handleChange('birthPlace', e.target.value)}
                  />
                </div>

                <div className="ep-form-field ep-form-field-full">
                  <label htmlFor="fiscalCode">
                    Codice fiscale <span className="ep-required">*</span>
                    <span className="ep-field-hint"> Utilizzato per documenti fiscali.</span>
                  </label>
                  <input
                    id="fiscalCode"
                    type="text"
                    maxLength={16}
                    value={profile.fiscalCode}
                    onChange={(e) => handleChange('fiscalCode', e.target.value.toUpperCase())}
                  />
                  {errors.fiscalCode && <div className="ep-field-error">{errors.fiscalCode}</div>}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'recapiti' && (
            <section className="ep-form-section">
              <h2>Recapiti</h2>
              <p className="ep-section-description">
                Questi dati verranno utilizzati per contattarti e per la generazione di CV e OdL.
              </p>
              <div className="ep-form-grid">
                <div className="ep-form-field">
                  <label htmlFor="email">
                    Email <span className="ep-required">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                  {errors.email && <div className="ep-field-error">{errors.email}</div>}
                </div>

                <div className="ep-form-field">
                  <label htmlFor="mobile">Cellulare</label>
                  <input
                    id="mobile"
                    type="tel"
                    value={profile.mobile || ''}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                  />
                </div>

                <div className="ep-form-field">
                  <label htmlFor="phone">Telefono</label>
                  <input
                    id="phone"
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>

                <div className="ep-form-field ep-form-field-full">
                  <label htmlFor="addressStreet">Indirizzo (residenza)</label>
                  <input
                    id="addressStreet"
                    type="text"
                    value={profile.addressStreet || ''}
                    onChange={(e) => handleChange('addressStreet', e.target.value)}
                  />
                </div>

                <div className="ep-form-field">
                  <label htmlFor="addressZip">CAP</label>
                  <input
                    id="addressZip"
                    type="text"
                    maxLength={10}
                    value={profile.addressZip || ''}
                    onChange={(e) => handleChange('addressZip', e.target.value)}
                  />
                </div>

                <div className="ep-form-field">
                  <label htmlFor="addressCity">Città</label>
                  <input
                    id="addressCity"
                    type="text"
                    value={profile.addressCity || ''}
                    onChange={(e) => handleChange('addressCity', e.target.value)}
                  />
                </div>

                <div className="ep-form-field">
                  <label htmlFor="addressProvince">Provincia</label>
                  <input
                    id="addressProvince"
                    type="text"
                    maxLength={2}
                    value={profile.addressProvince || ''}
                    onChange={(e) => handleChange('addressProvince', e.target.value.toUpperCase())}
                  />
                </div>

                <div className="ep-form-field">
                  <label htmlFor="addressCountry">Nazione</label>
                  <input
                    id="addressCountry"
                    type="text"
                    maxLength={2}
                    value={profile.addressCountry || ''}
                    onChange={(e) => handleChange('addressCountry', e.target.value.toUpperCase())}
                  />
                </div>
              </div>
            </section>
          )}

          {activeTab === 'fiscali' && (
            <section className="ep-form-section">
              <h2>Dati fiscali</h2>
              <p className="ep-section-description">
                Questi dati vengono utilizzati per la fatturazione e i documenti fiscali emessi dal portale.
              </p>
              <div className="ep-form-grid">
                <div className="ep-form-field">
                  <label htmlFor="vatNumber">Partita IVA</label>
                  <input
                    id="vatNumber"
                    type="text"
                    maxLength={11}
                    value={profile.vatNumber || ''}
                    onChange={(e) => handleChange('vatNumber', e.target.value)}
                  />
                  {errors.vatNumber && <div className="ep-field-error">{errors.vatNumber}</div>}
                </div>

                <div className="ep-form-field ep-form-field-full">
                  <label htmlFor="taxResidenceStreet">Indirizzo sede fiscale</label>
                  <input
                    id="taxResidenceStreet"
                    type="text"
                    value={profile.taxResidenceStreet || ''}
                    onChange={(e) => handleChange('taxResidenceStreet', e.target.value)}
                  />
                </div>

                <div className="ep-form-field">
                  <label htmlFor="taxResidenceZip">CAP sede fiscale</label>
                  <input
                    id="taxResidenceZip"
                    type="text"
                    maxLength={10}
                    value={profile.taxResidenceZip || ''}
                    onChange={(e) => handleChange('taxResidenceZip', e.target.value)}
                  />
                </div>

                <div className="ep-form-field">
                  <label htmlFor="taxResidenceCity">Città sede fiscale</label>
                  <input
                    id="taxResidenceCity"
                    type="text"
                    value={profile.taxResidenceCity || ''}
                    onChange={(e) => handleChange('taxResidenceCity', e.target.value)}
                  />
                </div>

                <div className="ep-form-field">
                  <label htmlFor="taxResidenceProvince">Provincia sede fiscale</label>
                  <input
                    id="taxResidenceProvince"
                    type="text"
                    maxLength={2}
                    value={profile.taxResidenceProvince || ''}
                    onChange={(e) => handleChange('taxResidenceProvince', e.target.value.toUpperCase())}
                  />
                </div>

                <div className="ep-form-field">
                  <label htmlFor="taxResidenceCountry">Nazione sede fiscale</label>
                  <input
                    id="taxResidenceCountry"
                    type="text"
                    maxLength={2}
                    value={profile.taxResidenceCountry || ''}
                    onChange={(e) => handleChange('taxResidenceCountry', e.target.value.toUpperCase())}
                  />
                </div>
              </div>
            </section>
          )}

          <div className="ep-form-actions">
            <button type="submit" className="ep-btn ep-btn-primary" disabled={saving}>
              {saving ? 'Salvataggio in corso...' : exists ? 'Salva modifiche' : 'Crea profilo'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfessionalProfilePage;
