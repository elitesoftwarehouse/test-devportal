import React, { useEffect, useState } from "react";
import { SupplierCompanyDto, UpsertSupplierCompanyRequest, createSupplierCompany, updateSupplierCompany } from "../../api/supplierCompaniesApi";

export interface SupplierCompanyFormProps {
  initialValue?: SupplierCompanyDto | null;
  onSaved?: (supplier: SupplierCompanyDto) => void;
  onCancel?: () => void;
}

const emptyForm: UpsertSupplierCompanyRequest = {
  codice: "",
  ragioneSociale: "",
  nomeCommerciale: "",
  partitaIva: "",
  codiceFiscale: "",
  indirizzo: "",
  cap: "",
  citta: "",
  provincia: "",
  nazione: "",
  telefono: "",
  email: "",
  sitoWeb: "",
  attivo: true,
};

export const SupplierCompanyForm: React.FC<SupplierCompanyFormProps> = ({ initialValue, onSaved, onCancel }) => {
  const [form, setForm] = useState<UpsertSupplierCompanyRequest>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValue) {
      setForm({
        id: initialValue.id,
        codice: initialValue.codice,
        ragioneSociale: initialValue.ragioneSociale,
        nomeCommerciale: initialValue.nomeCommerciale || "",
        partitaIva: initialValue.partitaIva || "",
        codiceFiscale: initialValue.codiceFiscale || "",
        indirizzo: initialValue.indirizzo || "",
        cap: initialValue.cap || "",
        citta: initialValue.citta || "",
        provincia: initialValue.provincia || "",
        nazione: initialValue.nazione || "",
        telefono: initialValue.telefono || "",
        email: initialValue.email || "",
        sitoWeb: initialValue.sitoWeb || "",
        attivo: initialValue.attivo,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let result: SupplierCompanyDto;
      if (form.id) {
        result = await updateSupplierCompany(form.id, form);
      } else {
        result = await createSupplierCompany(form);
      }
      if (onSaved) {
        onSaved(result);
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError("Errore di validazione o di salvataggio. Verificare i campi.");
      } else {
        setError("Errore imprevisto durante il salvataggio.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="supplier-form" onSubmit={handleSubmit}>
      <h2>{form.id ? "Modifica Azienda fornitrice" : "Nuova Azienda fornitrice"}</h2>
      {error && <div className="supplier-form__error">{error}</div>}
      <div className="supplier-form__grid">
        <div className="supplier-form__field">
          <label htmlFor="codice">Codice *</label>
          <input
            id="codice"
            name="codice"
            value={form.codice}
            onChange={handleChange}
            required
            maxLength={32}
          />
        </div>
        <div className="supplier-form__field supplier-form__field--full">
          <label htmlFor="ragioneSociale">Ragione sociale *</label>
          <input
            id="ragioneSociale"
            name="ragioneSociale"
            value={form.ragioneSociale}
            onChange={handleChange}
            required
            maxLength={256}
          />
        </div>
        <div className="supplier-form__field supplier-form__field--full">
          <label htmlFor="nomeCommerciale">Nome commerciale</label>
          <input
            id="nomeCommerciale"
            name="nomeCommerciale"
            value={form.nomeCommerciale || ""}
            onChange={handleChange}
            maxLength={256}
          />
        </div>
        <div className="supplier-form__field">
          <label htmlFor="partitaIva">Partita IVA</label>
          <input
            id="partitaIva"
            name="partitaIva"
            value={form.partitaIva || ""}
            onChange={handleChange}
            maxLength={32}
          />
        </div>
        <div className="supplier-form__field">
          <label htmlFor="codiceFiscale">Codice fiscale</label>
          <input
            id="codiceFiscale"
            name="codiceFiscale"
            value={form.codiceFiscale || ""}
            onChange={handleChange}
            maxLength={32}
          />
        </div>
        <div className="supplier-form__field supplier-form__field--full">
          <label htmlFor="indirizzo">Indirizzo</label>
          <input
            id="indirizzo"
            name="indirizzo"
            value={form.indirizzo || ""}
            onChange={handleChange}
            maxLength={256}
          />
        </div>
        <div className="supplier-form__field">
          <label htmlFor="cap">CAP</label>
          <input
            id="cap"
            name="cap"
            value={form.cap || ""}
            onChange={handleChange}
            maxLength={16}
          />
        </div>
        <div className="supplier-form__field">
          <label htmlFor="citta">Città</label>
          <input
            id="citta"
            name="citta"
            value={form.citta || ""}
            onChange={handleChange}
            maxLength={128}
          />
        </div>
        <div className="supplier-form__field">
          <label htmlFor="provincia">Provincia</label>
          <input
            id="provincia"
            name="provincia"
            value={form.provincia || ""}
            onChange={handleChange}
            maxLength={64}
          />
        </div>
        <div className="supplier-form__field">
          <label htmlFor="nazione">Nazione</label>
          <input
            id="nazione"
            name="nazione"
            value={form.nazione || ""}
            onChange={handleChange}
            maxLength={64}
          />
        </div>
        <div className="supplier-form__field">
          <label htmlFor="telefono">Telefono</label>
          <input
            id="telefono"
            name="telefono"
            value={form.telefono || ""}
            onChange={handleChange}
            maxLength={64}
          />
        </div>
        <div className="supplier-form__field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email || ""}
            onChange={handleChange}
            maxLength={256}
          />
        </div>
        <div className="supplier-form__field supplier-form__field--full">
          <label htmlFor="sitoWeb">Sito web</label>
          <input
            id="sitoWeb"
            name="sitoWeb"
            value={form.sitoWeb || ""}
            onChange={handleChange}
            maxLength={256}
          />
        </div>
        <div className="supplier-form__field supplier-form__field--inline">
          <label htmlFor="attivo">Attivo</label>
          <input
            id="attivo"
            name="attivo"
            type="checkbox"
            checked={form.attivo}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="supplier-form__actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
            Annulla
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Salvataggio..." : "Salva"}
        </button>
      </div>
    </form>
  );
};

export default SupplierCompanyForm;
