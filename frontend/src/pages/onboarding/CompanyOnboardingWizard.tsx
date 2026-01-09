import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyCompanyOnboardingStatus,
  createCompanyDraft,
  updateCompanyDraft,
  confirmCompanyOnboarding,
} from "../../api/companyOnboardingApi";
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
  stato: "",
};

const CompanyOnboardingWizard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [step1, setStep1] = useState<Step1Form>(initialStep1);
  const [step2, setStep2] = useState<Step2Form>(initialStep2);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadStatus = async () => {
      try {
        setLoading(true);
        const status = await getMyCompanyOnboardingStatus();
        if (status.hasCompany && status.onboardingCompleted) {
          // Se azienda già accreditata, reindirizza all'area aziendale
          navigate("/azienda", { replace: true, state: { info: "Azienda già accreditata." } });
          return;
        }
        if (status.hasCompany && !status.onboardingCompleted && status.companyId) {
          setCompanyId(status.companyId);
        }
      } catch (e) {
        setError("Impossibile recuperare lo stato di accreditamento. Riprova più tardi.");
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [navigate]);

  const validateStep1 = (): string | null => {
    if (!step1.ragioneSociale.trim()) return "La ragione sociale è obbligatoria.";
    if (!step1.partitaIva.trim()) return "La partita IVA è obbligatoria.";
    if (step1.partitaIva.trim().length < 11 || step1.partitaIva.trim().length > 16)
      return "La partita IVA deve avere tra 11 e 16 caratteri.";
    if (!step1.emailAziendale.trim()) return "L'email aziendale è obbligatoria.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(step1.emailAziendale.trim()))
      return "Formato email aziendale non valido.";
    if (!step1.telefono.trim()) return "Il telefono aziendale è obbligatorio.";
    if (step1.telefono.trim().length > 30) return "Il telefono può contenere al massimo 30 caratteri.";
    if (step1.codiceFiscale && step1.codiceFiscale.trim().length > 16)
      return "Il codice fiscale può contenere al massimo 16 caratteri.";
    return null;
  };

  const validateStep2 = (): string | null => {
    if (!step2.indirizzo.trim()) return "L'indirizzo è obbligatorio.";
    if (!step2.cap.trim()) return "Il CAP è obbligatorio.";
    if (!step2.citta.trim()) return "La città è obbligatoria.";
    if (!step2.provincia.trim()) return "La provincia è obbligatoria.";
    if (!step2.stato.trim()) return "Lo stato è obbligatorio.";
    return null;
  };

  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    const validationError = validateStep1();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      const draft = await createCompanyDraft({
        ragioneSociale: step1.ragioneSociale.trim(),
        partitaIva: step1.partitaIva.trim(),
        codiceFiscale: step1.codiceFiscale.trim() || null,
        emailAziendale: step1.emailAziendale.trim(),
        telefono: step1.telefono.trim(),
      });
      setCompanyId(draft.companyId);
      setCurrentStep(2);
    } catch (err: any) {
      if (err.response && err.response.status === 409 && err.response.data?.error === "COMPANY_VAT_CONFLICT") {
        setError("Esiste già un'azienda registrata con la stessa partita IVA.");
      } else if (err.response && err.response.status === 400) {
        setError("Alcuni dati non sono validi. Verifica i campi inseriti.");
      } else {
        setError("Si è verificato un errore durante il salvataggio dei dati. Riprova.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const validationError = validateStep2();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!companyId) {
      setError("Nessuna azienda in bozza trovata. Ricarica la pagina.");
      return;
    }

    try {
      setSubmitting(true);
      await updateCompanyDraft(companyId, {
        sedeLegale: {
          indirizzo: step2.indirizzo.trim(),
          cap: step2.cap.trim(),
          citta: step2.citta.trim(),
          provincia: step2.provincia.trim(),
          stato: step2.stato.trim(),
        },
      });
      setCurrentStep(3);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setError("Azienda non trovata o non accessibile.");
      } else if (err.response && err.response.status === 400) {
        setError("Alcuni dati della sede legale non sono validi.");
      } else {
        setError("Si è verificato un errore durante il salvataggio della sede legale.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    setError(null);
    setSuccessMessage(null);
    if (!companyId) {
      setError("Nessuna azienda trovata per la conferma.");
      return;
    }
    try {
      setSubmitting(true);
      await confirmCompanyOnboarding(companyId);
      setSuccessMessage(
        "Accreditamento completato con successo. Verrai reindirizzato all'area aziendale."
      );
      setTimeout(() => {
        navigate("/azienda", { replace: true });
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        setError("L'accreditamento risulta già completato.");
      } else if (err.response && err.response.status === 404) {
        setError("Azienda non trovata o non accessibile.");
      } else {
        setError("Si è verificato un errore durante la conferma dell'accreditamento.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <form className="ep-wizard-form" onSubmit={handleSubmitStep1}>
      <h2>Step 1 - Dati anagrafici azienda</h2>
      <div className="ep-form-row">
        <label>Ragione sociale *</label>
        <input
          type="text"
          value={step1.ragioneSociale}
          maxLength={255}
          onChange={(e) => setStep1({ ...step1, ragioneSociale: e.target.value })}
        />
      </div>
      <div className="ep-form-row">
        <label>Partita IVA / C.F. *</label>
        <input
          type="text"
          value={step1.partitaIva}
          maxLength={16}
          onChange={(e) => setStep1({ ...step1, partitaIva: e.target.value })}
        />
      </div>
      <div className="ep-form-row">
        <label>Codice Fiscale (opzionale)</label>
        <input
          type="text"
          value={step1.codiceFiscale}
          maxLength={16}
          onChange={(e) => setStep1({ ...step1, codiceFiscale: e.target.value })}
        />
      </div>
      <div className="ep-form-row">
        <label>Email aziendale *</label>
        <input
          type="email"
          value={step1.emailAziendale}
          maxLength={255}
          onChange={(e) => setStep1({ ...step1, emailAziendale: e.target.value })}
        />
      </div>
      <div className="ep-form-row">
        <label>Telefono aziendale *</label>
        <input
          type="text"
          value={step1.telefono}
          maxLength={30}
          onChange={(e) => setStep1({ ...step1, telefono: e.target.value })}
        />
      </div>
      <div className="ep-wizard-actions">
        <button type="submit" className="ep-btn-primary" disabled={submitting}>
          {submitting ? "Salvataggio..." : "Prosegui"}
        </button>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form className="ep-wizard-form" onSubmit={handleSubmitStep2}>
      <h2>Step 2 - Sede legale</h2>
      <div className="ep-form-row">
        <label>Indirizzo completo *</label>
        <input
          type="text"
          value={step2.indirizzo}
          maxLength={255}
          onChange={(e) => setStep2({ ...step2, indirizzo: e.target.value })}
        />
      </div>
      <div className="ep-form-row-inline">
        <div>
          <label>CAP *</label>
          <input
            type="text"
            value={step2.cap}
            maxLength={10}
            onChange={(e) => setStep2({ ...step2, cap: e.target.value })}
          />
        </div>
        <div>
          <label>Città *</label>
          <input
            type="text"
            value={step2.citta}
            maxLength={100}
            onChange={(e) => setStep2({ ...step2, citta: e.target.value })}
          />
        </div>
      </div>
      <div className="ep-form-row-inline">
        <div>
          <label>Provincia *</label>
          <input
            type="text"
            value={step2.provincia}
            maxLength={100}
            onChange={(e) => setStep2({ ...step2, provincia: e.target.value })}
          />
        </div>
        <div>
          <label>Stato *</label>
          <input
            type="text"
            value={step2.stato}
            maxLength={100}
            onChange={(e) => setStep2({ ...step2, stato: e.target.value })}
          />
        </div>
      </div>
      <div className="ep-wizard-actions">
        <button
          type="button"
          className="ep-btn-secondary"
          onClick={() => setCurrentStep(1)}
          disabled={submitting}
        >
          Indietro
        </button>
        <button type="submit" className="ep-btn-primary" disabled={submitting}>
          {submitting ? "Salvataggio..." : "Prosegui"}
        </button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <div className="ep-wizard-form">
      <h2>Step 3 - Riepilogo e conferma</h2>
      <p>
        Verifica i dati inseriti prima di confermare l'accreditamento. L'utente corrente
        sarà registrato come rappresentante legale / owner dell'azienda.
      </p>
      <div className="ep-summary">
        <h3>Dati anagrafici</h3>
        <p>
          <strong>Ragione sociale:</strong> {step1.ragioneSociale}
          <br />
          <strong>Partita IVA / C.F.:</strong> {step1.partitaIva}
          <br />
          {step1.codiceFiscale && (
            <>
              <strong>Codice fiscale:</strong> {step1.codiceFiscale}
              <br />
            </>
          )}
          <strong>Email aziendale:</strong> {step1.emailAziendale}
          <br />
          <strong>Telefono aziendale:</strong> {step1.telefono}
        </p>
        <h3>Sede legale</h3>
        <p>
          <strong>Indirizzo:</strong> {step2.indirizzo}
          <br />
          <strong>CAP:</strong> {step2.cap}
          <br />
          <strong>Città:</strong> {step2.citta}
          <br />
          <strong>Provincia:</strong> {step2.provincia}
          <br />
          <strong>Stato:</strong> {step2.stato}
        </p>
      </div>
      <div className="ep-wizard-actions">
        <button
          type="button"
          className="ep-btn-secondary"
          onClick={() => setCurrentStep(2)}
          disabled={submitting}
        >
          Indietro
        </button>
        <button
          type="button"
          className="ep-btn-primary"
          onClick={handleConfirm}
          disabled={submitting}
        >
          {submitting ? "Conferma in corso..." : "Conferma accreditamento"}
        </button>
      </div>
      <div className="ep-info-box">
        Una volta confermato l'accreditamento, non sarà più possibile modificare questi
        dati direttamente dal wizard. Potrai comunque richiedere aggiornamenti
        successivi tramite il supporto Elite.
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="ep-wizard-container">
        <div className="ep-spinner" />
        <p>Caricamento in corso...</p>
      </div>
    );
  }

  return (
    <div className="ep-wizard-container">
      <h1>Primo accreditamento azienda</h1>
      <div className="ep-wizard-steps">
        <div className={`ep-wizard-step ${currentStep === 1 ? "active" : ""}`}>
          1. Dati aziendali
        </div>
        <div className={`ep-wizard-step ${currentStep === 2 ? "active" : ""}`}>
          2. Sede legale
        </div>
        <div className={`ep-wizard-step ${currentStep === 3 ? "active" : ""}`}>
          3. Riepilogo
        </div>
      </div>

      {error && <div className="ep-alert ep-alert-error">{error}</div>}
      {successMessage && <div className="ep-alert ep-alert-success">{successMessage}</div>}

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </div>
  );
};

export default CompanyOnboardingWizard;
