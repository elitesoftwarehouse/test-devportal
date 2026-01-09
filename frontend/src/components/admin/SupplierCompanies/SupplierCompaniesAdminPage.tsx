import React, { useEffect, useState } from 'react';
import {
  SupplierCompanyDTO,
  SupplierCompanyStatus,
  listSupplierCompanies,
  createSupplierCompany,
  updateSupplierCompany,
  updateSupplierCompanyStatus,
} from '../../../api/supplierCompaniesApi';
import SupplierCompanyForm from './SupplierCompanyForm';

const SupplierCompaniesAdminPage: React.FC = () => {
  const [items, setItems] = useState<SupplierCompanyDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [vatFilter, setVatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | SupplierCompanyStatus>('');

  const [selected, setSelected] = useState<SupplierCompanyDTO | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSupplierCompanies({
        search: search || undefined,
        vatNumber: vatFilter || undefined,
        status: statusFilter || undefined,
      });
      setItems(data);
    } catch (e) {
      setError('Errore nel caricamento delle aziende fornitrici');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleCreateClick = () => {
    setSelected(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleEditClick = (item: SupplierCompanyDTO) => {
    setSelected(item);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelected(null);
  };

  const handleFormSubmit = async (data: SupplierCompanyDTO) => {
    if (formMode === 'create') {
      await createSupplierCompany(data);
    } else if (formMode === 'edit' && selected && selected.id) {
      await updateSupplierCompany(selected.id, data);
    }
    await loadData();
  };

  const handleToggleStatus = async (item: SupplierCompanyDTO) => {
    if (!item.id || !item.status) {
      return;
    }
    const newStatus: SupplierCompanyStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateSupplierCompanyStatus(item.id, newStatus);
      await loadData();
    } catch (e) {
      setError('Errore nell\'aggiornamento dello stato dell\'azienda');
    }
  };

  return (
    <div className="supplier-companies-admin">
      <div className="supplier-companies-admin__header">
        <h1>Aziende fornitrici</h1>
        <button className="btn btn--primary" type="button" onClick={handleCreateClick}>
          Nuova azienda fornitrice
        </button>
      </div>

      <form className="supplier-companies-admin__filters" onSubmit={handleSearchSubmit}>
        <div className="form-field">
          <label htmlFor="search">Ragione sociale</label>
          <input
            id="search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per ragione sociale"
          />
        </div>
        <div className="form-field">
          <label htmlFor="vatFilter">Partita IVA</label>
          <input
            id="vatFilter"
            type="text"
            value={vatFilter}
            onChange={(e) => setVatFilter(e.target.value)}
            placeholder="Cerca per partita IVA"
          />
        </div>
        <div className="form-field">
          <label htmlFor="statusFilter">Stato</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter((e.target.value as SupplierCompanyStatus) || '')}
          >
            <option value="">Tutti</option>
            <option value="ACTIVE">Attive</option>
            <option value="INACTIVE">Non attive</option>
          </select>
        </div>
        <div className="supplier-companies-admin__filters-actions">
          <button className="btn btn--secondary" type="button" onClick={() => { setSearch(''); setVatFilter(''); setStatusFilter(''); }}>
            Pulisci filtri
          </button>
          <button className="btn btn--primary" type="submit">
            Applica filtri
          </button>
        </div>
      </form>

      {error && <div className="supplier-companies-admin__alert supplier-companies-admin__alert--error">{error}</div>}

      <div className="supplier-companies-admin__content">
        <div className="supplier-companies-admin__list">
          {loading ? (
            <div>Caricamento in corso...</div>
          ) : items.length === 0 ? (
            <div>Nessuna azienda trovata con i filtri correnti.</div>
          ) : (
            <table className="supplier-companies-admin__table">
              <thead>
                <tr>
                  <th>Ragione sociale</th>
                  <th>Partita IVA</th>
                  <th>Stato</th>
                  <th>Email</th>
                  <th>Telefono</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={item.status === 'INACTIVE' ? 'is-inactive' : ''}>
                    <td>{item.businessName}</td>
                    <td>{item.vatNumber}</td>
                    <td>{item.status === 'ACTIVE' ? 'Attiva' : 'Inattiva'}</td>
                    <td>{item.email || '-'}</td>
                    <td>{item.phone || '-'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn--small btn--secondary"
                        onClick={() => handleEditClick(item)}
                      >
                        Modifica
                      </button>
                      <button
                        type="button"
                        className="btn btn--small btn--ghost"
                        onClick={() => handleToggleStatus(item)}
                      >
                        {item.status === 'ACTIVE' ? 'Disattiva' : 'Attiva'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showForm && (
          <div className="supplier-companies-admin__form-panel">
            <SupplierCompanyForm
              initialValue={selected}
              mode={formMode}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierCompaniesAdminPage;
