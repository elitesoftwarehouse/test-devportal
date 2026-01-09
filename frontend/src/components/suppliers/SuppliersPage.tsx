import React, { useEffect, useState } from 'react';
import {
  SupplierDto,
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../../api/suppliersApi';
import './SuppliersPage.css';

const emptyForm: SupplierDto = {
  ragioneSociale: '',
  partitaIva: '',
  codiceFiscale: '',
  codiceSdi: '',
  pec: '',
  indirizzoVia: '',
  indirizzoCap: '',
  indirizzoCitta: '',
  indirizzoProvincia: '',
  indirizzoNazione: '',
  telefono: '',
  email: '',
  sitoWeb: '',
  isActive: true,
};

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SupplierDto>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSuppliers();
      setSuppliers(data);
    } catch (e: any) {
      setError(e.message || 'Errore nel caricamento dei fornitori');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (!form.ragioneSociale || form.ragioneSociale.trim() === '') {
        setError('La ragione sociale è obbligatoria');
        return;
      }
      if (editingId) {
        await updateSupplier(editingId, form);
      } else {
        await createSupplier(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (e: any) {
      setError(e.message || 'Errore nel salvataggio del fornitore');
    }
  };

  const handleEdit = (supplier: SupplierDto) => {
    setEditingId(supplier.id || null);
    setForm({
      ragioneSociale: supplier.ragioneSociale || '',
      partitaIva: supplier.partitaIva || '',
      codiceFiscale: supplier.codiceFiscale || '',
      codiceSdi: supplier.codiceSdi || '',
      pec: supplier.pec || '',
      indirizzoVia: supplier.indirizzoVia || '',
      indirizzoCap: supplier.indirizzoCap || '',
      indirizzoCitta: supplier.indirizzoCitta || '',
      indirizzoProvincia: supplier.indirizzoProvincia || '',
      indirizzoNazione: supplier.indirizzoNazione || '',
      telefono: supplier.telefono || '',
      email: supplier.email || '',
      sitoWeb: supplier.sitoWeb || '',
      isActive: supplier.isActive !== undefined ? supplier.isActive : true,
    });
  };

  const handleDelete = async (supplier: SupplierDto) => {
    if (!supplier.id) return;
    if (!window.confirm('Sei sicuro di voler eliminare questo fornitore?')) return;
    try {
      await deleteSupplier(supplier.id);
      await loadData();
    } catch (e: any) {
      setError(e.message || 'Errore nell\'eliminazione del fornitore');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="suppliers-page">
      <h1>Fornitori</h1>
      {error && <div className="suppliers-error">{error}</div>}
      <div className="suppliers-layout">
        <div className="suppliers-form-container">
          <h2>{editingId ? 'Modifica fornitore' : 'Nuovo fornitore'}</h2>
          <form onSubmit={handleSubmit} className="suppliers-form">
            <div className="form-row">
              <label>Ragione sociale *</label>
              <input
                type="text"
                name="ragioneSociale"
                value={form.ragioneSociale}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <label>Partita IVA</label>
              <input
                type="text"
                name="partitaIva"
                value={form.partitaIva || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-row">
              <label>Codice fiscale</label>
              <input
                type="text"
                name="codiceFiscale"
                value={form.codiceFiscale || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-row">
              <label>Codice SDI</label>
              <input
                type="text"
                name="codiceSdi"
                value={form.codiceSdi || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-row">
              <label>PEC</label>
              <input
                type="email"
                name="pec"
                value={form.pec || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-row">
              <label>Indirizzo (via)</label>
              <input
                type="text"
                name="indirizzoVia"
                value={form.indirizzoVia || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-row-inline">
              <div>
                <label>CAP</label>
                <input
                  type="text"
                  name="indirizzoCap"
                  value={form.indirizzoCap || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Città</label>
                <input
                  type="text"
                  name="indirizzoCitta"
                  value={form.indirizzoCitta || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row-inline">
              <div>
                <label>Provincia</label>
                <input
                  type="text"
                  name="indirizzoProvincia"
                  value={form.indirizzoProvincia || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Nazione</label>
                <input
                  type="text"
                  name="indirizzoNazione"
                  value={form.indirizzoNazione || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row-inline">
              <div>
                <label>Telefono</label>
                <input
                  type="text"
                  name="telefono"
                  value={form.telefono || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <label>Sito web</label>
              <input
                type="url"
                name="sitoWeb"
                value={form.sitoWeb || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-row form-row-inline">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={!!form.isActive}
                  onChange={handleChange}
                />
                Attivo
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {editingId ? 'Salva modifiche' : 'Crea fornitore'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="secondary"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Annulla
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="suppliers-list-container">
          <h2>Elenco fornitori</h2>
          {loading && <div>Caricamento...</div>}
          {!loading && suppliers.length === 0 && (
            <div>Nessun fornitore presente.</div>
          )}
          {!loading && suppliers.length > 0 && (
            <table className="suppliers-table">
              <thead>
                <tr>
                  <th>Ragione sociale</th>
                  <th>Partita IVA</th>
                  <th>Email</th>
                  <th>Telefono</th>
                  <th>Stato</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id}>
                    <td>{s.ragioneSociale}</td>
                    <td>{s.partitaIva}</td>
                    <td>{s.email}</td>
                    <td>{s.telefono}</td>
                    <td>{s.isActive ? 'Attivo' : 'Inattivo'}</td>
                    <td>
                      <button type="button" onClick={() => handleEdit(s)}>
                        Modifica
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => handleDelete(s)}
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuppliersPage;
