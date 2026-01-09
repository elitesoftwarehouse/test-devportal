import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchCompanyAccreditation, updateCompanyAccreditation } from '../../api/companyAccreditationApi';
import '../../styles/companyAccreditation.css';

const ACCREDITATION_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Bozza' },
  { value: 'PENDING_APPROVAL', label: 'In approvazione' },
  { value: 'ACTIVE', label: 'Attiva' },
  { value: 'REJECTED', label: 'Rifiutata' },
];

export function CompanyAccreditationForm({ companyId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    legalName: '',
    vatNumber: '',
    taxCode: '',
    legalAddressStreet: '',
    legalAddressPostalCode: '',
    legalAddressCity: '',
    legalAddressProvince: '',
    legalAddressCountry: 'Italia',
    businessEmail: '',
    businessPhone: '',
    accreditationStatus: 'DRAFT',
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCompanyAccreditation(companyId);
        setFormData({
          legalName: data.legalName || '',
          vatNumber: data.vatNumber || '',
          taxCode: data.taxCode || '',
          legalAddressStreet: data.legalAddressStreet || '',
          legalAddressPostalCode: data.legalAddressPostalCode || '',
          legalAddressCity: data.legalAddressCity || '',
          legalAddressProvince: data.legalAddressProvince || '',
          legalAddressCountry: data.legalAddressCountry || 'Italia',
          businessEmail: data.businessEmail || '',
          businessPhone: data.businessPhone || '',
          accreditationStatus: data.accreditationStatus || 'DRAFT',
        });
      } catch (e) {
        setError('Impossibile caricare i dati di accreditamento.');
      } finally {
        setLoading(false);
      }
    }

    if (companyId) {
      load();
    }
  }, [companyId]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateCompanyAccreditation(companyId, formData);
      setSuccess('Dati di accreditamento salvati correttamente.');
    } catch (e) {
      setError('Errore durante il salvataggio dei dati di accreditamento.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="company-accreditation-container">
      <h2>Accreditamento azienda</h2>
      {loading && <div className="company-accreditation-message">Caricamento...</div>}
      {error && <div className="company-accreditation-message error">{error}</div>}
      {success && <div className="company-accreditation-message success">{success}</div>}

      <form className="company-accreditation-form" onSubmit={handleSubmit}>
        <fieldset disabled={loading}>
          <div className="form-row">
            <label htmlFor="legalName">Ragione sociale</label>
            <input
              id="legalName"
              name="legalName"
              type="text"
              value={formData.legalName}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label htmlFor="vatNumber">Partita IVA</label>
            <input
              id="vatNumber"
              name="vatNumber"
              type="text"
              value={formData.vatNumber}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label htmlFor="taxCode">Codice fiscale</label>
            <input
              id="taxCode"
              name="taxCode"
              type="text"
              value={formData.taxCode}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label htmlFor="legalAddressStreet">Indirizzo sede legale</label>
            <input
              id="legalAddressStreet"
              name="legalAddressStreet"
              type="text"
              value={formData.legalAddressStreet}
              onChange={handleChange}
            />
          </div>

          <div className="form-row-inline">
            <div>
              <label htmlFor="legalAddressPostalCode">CAP</label>
              <input
                id="legalAddressPostalCode"
                name="legalAddressPostalCode"
                type="text"
                value={formData.legalAddressPostalCode}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="legalAddressCity">Città</label>
              <input
                id="legalAddressCity"
                name="legalAddressCity"
                type="text"
                value={formData.legalAddressCity}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="legalAddressProvince">Provincia</label>
              <input
                id="legalAddressProvince"
                name="legalAddressProvince"
                type="text"
                value={formData.legalAddressProvince}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="legalAddressCountry">Nazione</label>
            <input
              id="legalAddressCountry"
              name="legalAddressCountry"
              type="text"
              value={formData.legalAddressCountry}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label htmlFor="businessEmail">Email aziendale</label>
            <input
              id="businessEmail"
              name="businessEmail"
              type="email"
              value={formData.businessEmail}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label htmlFor="businessPhone">Telefono aziendale</label>
            <input
              id="businessPhone"
              name="businessPhone"
              type="text"
              value={formData.businessPhone}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label htmlFor="accreditationStatus">Stato accreditamento</label>
            <select
              id="accreditationStatus"
              name="accreditationStatus"
              value={formData.accreditationStatus}
              onChange={handleChange}
            >
              {ACREDITATION_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              Salva accreditamento
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

CompanyAccreditationForm.propTypes = {
  companyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default CompanyAccreditationForm;
