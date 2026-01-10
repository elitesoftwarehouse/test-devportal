import React, { useState } from "react";
import "./CompanyOnboardingWizard.css";

interface Step1Form {
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale: string;
  emailAziendale: string;
  telefono: string;
}

interface Step2Form {
  indirizzo: string;
  cap: string;
  citta: string;
  provincia: string;
  stato: string;
}

const initialStep1: Step1Form = {
  ragioneSociale: "",
  partitaIva: "",
  codiceFiscale: "",
  emailAziendale: "",
  telefono: "",
};

const initialStep2: Step2Form = {
  indirizzo: "",
  cap: "",
  citta: "",
  provincia: "",
  stato: "Italia",
};

const CompanyOnboardingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [step1, setStep1] = useState<Step1Form>(initialStep1);
  const [step2, setStep2] = useState<Step2Form>(initialStep2);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    { num: 1, label: "Dati Aziendali", icon: "🏢" },
    { num: 2, label: "Sede Legale", icon: "📍" },
    { num: 3, label: "Conferma", icon: "✓" },
  ];

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!step1.ragioneSociale.trim()) {
      setError("La ragione sociale è obbligatoria");
      return;
    }
    if (!step1.partitaIva.trim() || step1.partitaIva.length < 11) {
      setError("Inserire una partita IVA valida (min 11 caratteri)");
      return;
    }
    if (!step1.emailAziendale.trim() || !step1.emailAziendale.includes("@")) {
      setError("Inserire un'email aziendale valida");
      return;
    }
    
    setCurrentStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!step2.indirizzo.trim()) {
      setError("L'indirizzo è obbligatorio");
      return;
    }
    if (!step2.cap.trim() || !step2.citta.trim() || !step2.provincia.trim()) {
      setError("Completare tutti i campi della sede legale");
      return;
    }
    
    setCurrentStep(3);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    
    // Simula chiamata API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSuccess("🎉 Accreditamento completato con successo! La tua azienda è stata registrata.");
    setSubmitting(false);
  };

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <h1>🏢 Accreditamento Azienda</h1>
        <p>Completa i passaggi per registrare la tua azienda nel portale</p>
      </div>

      {/* Progress Steps */}
      <div className="wizard-progress">
        {steps.map((step, index) => (
          <React.Fragment key={step.num}>
            <div className={`progress-step ${currentStep >= step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}>
              <div className="step-circle">
                {currentStep > step.num ? '✓' : step.icon}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`progress-line ${currentStep > step.num ? 'active' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <div className="wizard-alert error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}
      {success && (
        <div className="wizard-alert success">
          <span className="alert-icon">✅</span>
          {success}
        </div>
      )}

      {/* Step 1: Company Data */}
      {currentStep === 1 && (
        <form className="wizard-form" onSubmit={handleStep1Submit}>
          <div className="form-section">
            <h2>Dati Anagrafici Azienda</h2>
            
            <div className="form-field">
              <label>Ragione Sociale *</label>
              <input
                type="text"
                value={step1.ragioneSociale}
                onChange={(e) => setStep1({ ...step1, ragioneSociale: e.target.value })}
                placeholder="Es. Tech Solutions Srl"
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Partita IVA *</label>
                <input
                  type="text"
                  value={step1.partitaIva}
                  onChange={(e) => setStep1({ ...step1, partitaIva: e.target.value })}
                  placeholder="Es. 12345678901"
                  maxLength={16}
                />
              </div>
              <div className="form-field">
                <label>Codice Fiscale</label>
                <input
                  type="text"
                  value={step1.codiceFiscale}
                  onChange={(e) => setStep1({ ...step1, codiceFiscale: e.target.value })}
                  placeholder="Opzionale"
                  maxLength={16}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Email Aziendale *</label>
                <input
                  type="email"
                  value={step1.emailAziendale}
                  onChange={(e) => setStep1({ ...step1, emailAziendale: e.target.value })}
                  placeholder="info@azienda.it"
                />
              </div>
              <div className="form-field">
                <label>Telefono</label>
                <input
                  type="tel"
                  value={step1.telefono}
                  onChange={(e) => setStep1({ ...step1, telefono: e.target.value })}
                  placeholder="+39 02 1234567"
                />
              </div>
            </div>
          </div>

          <div className="wizard-actions">
            <button type="submit" className="btn-primary">
              Continua <span>→</span>
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Legal Address */}
      {currentStep === 2 && (
        <form className="wizard-form" onSubmit={handleStep2Submit}>
          <div className="form-section">
            <h2>Sede Legale</h2>
            
            <div className="form-field">
              <label>Indirizzo Completo *</label>
              <input
                type="text"
                value={step2.indirizzo}
                onChange={(e) => setStep2({ ...step2, indirizzo: e.target.value })}
                placeholder="Via Roma, 123"
              />
            </div>

            <div className="form-row triple">
              <div className="form-field">
                <label>CAP *</label>
                <input
                  type="text"
                  value={step2.cap}
                  onChange={(e) => setStep2({ ...step2, cap: e.target.value })}
                  placeholder="00100"
                  maxLength={5}
                />
              </div>
              <div className="form-field">
                <label>Città *</label>
                <input
                  type="text"
                  value={step2.citta}
                  onChange={(e) => setStep2({ ...step2, citta: e.target.value })}
                  placeholder="Roma"
                />
              </div>
              <div className="form-field">
                <label>Provincia *</label>
                <input
                  type="text"
                  value={step2.provincia}
                  onChange={(e) => setStep2({ ...step2, provincia: e.target.value })}
                  placeholder="RM"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="form-field">
              <label>Stato</label>
              <select
                value={step2.stato}
                onChange={(e) => setStep2({ ...step2, stato: e.target.value })}
              >
                <option value="Italia">Italia</option>
                <option value="San Marino">San Marino</option>
                <option value="Svizzera">Svizzera</option>
              </select>
            </div>
          </div>

          <div className="wizard-actions">
            <button type="button" className="btn-secondary" onClick={() => setCurrentStep(1)}>
              <span>←</span> Indietro
            </button>
            <button type="submit" className="btn-primary">
              Continua <span>→</span>
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Confirmation */}
      {currentStep === 3 && !success && (
        <div className="wizard-form">
          <div className="form-section">
            <h2>Riepilogo Dati</h2>
            
            <div className="summary-grid">
              <div className="summary-card">
                <h3>🏢 Dati Aziendali</h3>
                <div className="summary-row">
                  <span>Ragione Sociale:</span>
                  <strong>{step1.ragioneSociale}</strong>
                </div>
                <div className="summary-row">
                  <span>Partita IVA:</span>
                  <strong>{step1.partitaIva}</strong>
                </div>
                {step1.codiceFiscale && (
                  <div className="summary-row">
                    <span>Codice Fiscale:</span>
                    <strong>{step1.codiceFiscale}</strong>
                  </div>
                )}
                <div className="summary-row">
                  <span>Email:</span>
                  <strong>{step1.emailAziendale}</strong>
                </div>
                {step1.telefono && (
                  <div className="summary-row">
                    <span>Telefono:</span>
                    <strong>{step1.telefono}</strong>
                  </div>
                )}
              </div>

              <div className="summary-card">
                <h3>📍 Sede Legale</h3>
                <div className="summary-row">
                  <span>Indirizzo:</span>
                  <strong>{step2.indirizzo}</strong>
                </div>
                <div className="summary-row">
                  <span>Località:</span>
                  <strong>{step2.cap} {step2.citta} ({step2.provincia})</strong>
                </div>
                <div className="summary-row">
                  <span>Stato:</span>
                  <strong>{step2.stato}</strong>
                </div>
              </div>
            </div>

            <div className="confirm-notice">
              <span className="notice-icon">ℹ️</span>
              <p>
                Confermando l'accreditamento, dichiari che i dati inseriti sono corretti e completi.
                Una volta confermato, riceverai una notifica quando la tua richiesta sarà stata elaborata.
              </p>
            </div>
          </div>

          <div className="wizard-actions">
            <button type="button" className="btn-secondary" onClick={() => setCurrentStep(2)}>
              <span>←</span> Indietro
            </button>
            <button 
              type="button" 
              className="btn-success" 
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner"></span> Invio in corso...
                </>
              ) : (
                <>
                  ✓ Conferma Accreditamento
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success State */}
      {success && (
        <div className="wizard-form success-state">
          <div className="success-icon">🎉</div>
          <h2>Accreditamento Completato!</h2>
          <p>La tua azienda <strong>{step1.ragioneSociale}</strong> è stata registrata con successo.</p>
          <p className="success-subtitle">Riceverai una notifica email quando la tua richiesta sarà stata approvata.</p>
          
          <div className="success-actions">
            <button className="btn-primary" onClick={() => window.location.href = '/'}>
              Vai alla Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyOnboardingWizard;
