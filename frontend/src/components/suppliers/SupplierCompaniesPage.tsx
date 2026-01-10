import React, { useEffect, useState } from "react";
import { SupplierCompanyDto, fetchSupplierCompanies } from "../../api/supplierCompaniesApi";
import SupplierCompanyForm from "./SupplierCompanyForm";

export const SupplierCompaniesPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierCompanyDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SupplierCompanyDto | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [onlyActive, setOnlyActive] = useState<boolean>(true);

  const loadSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSupplierCompanies(onlyActive);
      setSuppliers(data);
    } catch (err) {
      setError("Errore durante il caricamento delle aziende fornitrici.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyActive]);

  const handleNew = () => {
    setSelected(null);
    setShowForm(true);
  };

  const handleEdit = (supplier: SupplierCompanyDto) => {
    setSelected(supplier);
    setShowForm(true);
  };

  const handleSaved = (supplier: SupplierCompanyDto) => {
    setShowForm(false);
    setSelected(null);
    // ricarica lista per semplicità, mantenendo coerenza con backend
    loadSuppliers();
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelected(null);
  };

  return (
    <div className="supplier-page">
      <div className="supplier-page__header">
        <h1>Aziende fornitrici</h1>
        <div className="supplier-page__header-actions">
          <label className="supplier-page__filter">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
            />
            Solo attivi
          </label>
          <button className="btn btn-primary" onClick={handleNew}>
            Nuova azienda fornitrice
          </button>
        </div>
      </div>

      {error && <div className="supplier-page__error">{error}</div>}

      {loading ? (
        <div>Caricamento in corso...</div>
      ) : (
        <table className="supplier-page__table">
          <thead>
            <tr>
              <th>Codice</th>
              <th>Ragione sociale</th>
              <th>Partita IVA</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={7} className="supplier-page__empty">
                  Nessuna azienda fornitrice trovata.
                </td>
              </tr>
            )}
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td>{s.codice}</td>
                <td>{s.ragioneSociale}</td>
                <td>{s.partitaIva}</td>
                <td>{s.email}</td>
                <td>{s.telefono}</td>
                <td>{s.attivo ? "Attivo" : "Non attivo"}</td>
                <td>
                  <button className="btn btn-link" onClick={() => handleEdit(s)}>
                    Modifica
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="supplier-page__drawer">
          <SupplierCompanyForm initialValue={selected} onSaved={handleSaved} onCancel={handleCancel} />
        </div>
      )}
    </div>
  );
};

export default SupplierCompaniesPage;
