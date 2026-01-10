import React, { useEffect, useMemo, useState } from 'react';
import { SupplierCompanyDTO, SupplierCompanyStatus, parseApiError } from '../../../api/supplierCompaniesApi';

export interface SupplierCompanyFormProps {
  initialValue?: SupplierCompanyDTO | null;
  mode: 'create' | 'edit';
  onSubmit: (data: SupplierCompanyDTO) => Promise<void>;
  onCancel: () => void;
}

interface FieldErrorMap {
  [field: string]: string | undefined;
}

const emptyForm: SupplierCompanyDTO = {
  businessName: '',
  vatNumber: '',
  taxCode: '',
  addressStreet: '',
  addressCity: '',
  addressZip: '',
  addressProvince: '',
  addressCountry: '',
  phone: '',
  email: '',
  pec: '',
  status: 'ACTIVE',
};

export const SupplierCompanyForm: React.FC<SupplierCompanyFormProps> = ({ initialValue, mode, onSubmit, onCancel }) => {
  const [form, setForm] = useState<SupplierCompanyDTO>(emptyForm);
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialValue) {
      setForm({
        ...emptyForm,
        ...initialValue,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
    setGlobalError(null);
    setSuccessMessage(null);
  }, [initialValue, mode]);

  const isEditMode = mode === 'edit';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setGlobalError(null);
  };

  const validateClient = (): boolean => {
    const newErrors: FieldErrorMap = {};

    if (!form.businessName || !form.businessName.trim()) {
      newErrors.businessName = 'La ragione sociale è obbligatoria';
    } else if (form.businessName.length > 255) {
      newErrors.businessName = 'La ragione sociale non può superare 255 caratteri';
    }

    if (!form.vatNumber || !form.vatNumber.trim()) {
      newErrors.vatNumber = 'La partita IVA è obbligatoria';
    } else if (form.vatNumber.length < 8 || form.vatNumber.length > 20) {
      newErrors.vatNumber = 'La partita IVA deve avere tra 8 e 20 caratteri';
    }

    if (form.taxCode && form.taxCode.length > 20) {
      newErrors.taxCode = 'Il codice fiscale non può superare 20 caratteri';
    }

    if (form.phone && form.phone.length > 30) {
      newErrors.phone = 'Il telefono non può superare 30 caratteri';
    }

    if (form.email && form.email.length > 255) {
      newErrors.email = 'L\'email non può superare 255 caratteri';
    }

    if (form.pec && form.pec.length > 255) {
      newErrors.pec = 'La PEC non può superare 255 caratteri';
    }

    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Formato email non valido';
    }

    if (form.pec && !/^\S+@\S+\.\S+$/.test(form.pec)) {
      newErrors.pec = 'Formato PEC non valido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setGlobalError(null);

    if (!validateClient()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        businessName: form.businessName.trim(),
        vatNumber: form.vatNumber.trim(),
      });
      setSuccessMessage('Salvataggio avvenuto con successo');
    } catch (error) {
      const info = parseApiError(error);
      if (info.type === 'validation' && info.fieldErrors) {
        const apiErrors: FieldErrorMap = {};
        info.fieldErrors.forEach((fe) => {
          apiErrors[fe.field] = fe.message;
        });
        setErrors((prev) => ({ ...prev, ...apiErrors }));
        setGlobalError(info.message);
      } else if (info.type === 'conflict') {
        setErrors((prev) => ({ ...prev, vatNumber: info.message }));
        setGlobalError(info.message);
      } else {
        setGlobalError(info.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions: { value: SupplierCompanyStatus; label: string }[] = useMemo(
    () => [
      { value: 'ACTIVE', label: 'Attiva' },
      { value: 'INACTIVE', label: 'Inattiva' },
    ],
    []
  );

  return (
    <form className="supplier-company-form" onSubmit={handleSubmit} noValidate>
      <h2 className="supplier-company-form__title">
        {isEditMode ? 'Modifica azienda fornitrice' : 'Nuova azienda fornitrice'}
      </h2>

      {globalError && <div className="supplier-company-form__alert supplier-company-form__alert--error">{globalError}</div>}
      {successMessage && <div className="supplier-company-form__alert supplier-company-form__alert--success">{successMessage}</div>}

      <div className="supplier-company-form__grid">
        <div className="form-field">
          <label htmlFor="businessName">Ragione sociale *</label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            value={form.businessName}
            onChange={handleChange}
            maxLength={255}
          />
          {errors.businessName && <div className="form-field__error">{errors.businessName}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="vatNumber">Partita IVA *</label>
          <input
            id="vatNumber"
            name="vatNumber"
            type="text"
            value={form.vatNumber}
            onChange={handleChange}
            maxLength={20}
          />
          {errors.vatNumber && <div className="form-field__error">{errors.vatNumber}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="taxCode">Codice fiscale</label>
          <input
            id="taxCode"
            name="taxCode"
            type="text"
            value={form.taxCode || ''}
            onChange={handleChange}
            maxLength={20}
          />
          {errors.taxCode && <div className="form-field__error">{errors.taxCode}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="status">Stato</label>
          <select id="status" name="status" value={form.status || 'ACTIVE'} onChange={handleChange}>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="addressStreet">Indirizzo</label>
          <input
            id="addressStreet"
            name="addressStreet"
            type="text"
            value={form.addressStreet || ''}
            onChange={handleChange}
            maxLength={255}
          />
        </div>

        <div className="form-field">
          <label htmlFor="addressZip">CAP</label>
          <input
            id="addressZip"
            name="addressZip"
            type="text"
            value={form.addressZip || ''}
            onChange={handleChange}
            maxLength={10}
          />
        </div>

        <div className="form-field">
          <label htmlFor="addressCity">Città</label>
          <input
            id="addressCity"
            name="addressCity"
            type="text"
            value={form.addressCity || ''}
            onChange={handleChange}
            maxLength={100}
          />
        </div>

        <div className="form-field">
          <label htmlFor="addressProvince">Provincia</label>
          <input
            id="addressProvince"
            name="addressProvince"
            type="text"
            value={form.addressProvince || ''}
            onChange={handleChange}
            maxLength={50}
          />
        </div>

        <div className="form-field">
          <label htmlFor="addressCountry">Stato</label>
          <input
            id="addressCountry"
            name="addressCountry"
            type="text"
            value={form.addressCountry || ''}
            onChange={handleChange}
            maxLength={100}
          />
        </div>

        <div className="form-field">
          <label htmlFor="phone">Telefono</label>
          <input
            id="phone"
            name="phone"
            type="text"
            value={form.phone || ''}
            onChange={handleChange}
            maxLength={30}
          />
          {errors.phone && <div className="form-field__error">{errors.phone}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email || ''}
            onChange={handleChange}
            maxLength={255}
          />
          {errors.email && <div className="form-field__error">{errors.email}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="pec">PEC</label>
          <input
            id="pec"
            name="pec"
            type="email"
            value={form.pec || ''}
            onChange={handleChange}
            maxLength={255}
          />
          {errors.pec && <div className="form-field__error">{errors.pec}</div>}
        </div>
      </div>

      <div className="supplier-company-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={submitting}>
          Annulla
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Salvataggio in corso...' : isEditMode ? 'Salva modifiche' : 'Crea azienda'}
        </button>
      </div>
    </form>
  );
};

export default SupplierCompanyForm;
