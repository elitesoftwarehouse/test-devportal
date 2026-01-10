import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { companyCollaboratorsApi } from '../../api/companyCollaboratorsApi';
import './CompanyCollaboratorsTab.css';

const DEFAULT_PAGE_SIZE = 10;

export const CompanyCollaboratorsTab = ({ companyId }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingRole, setEditingRole] = useState('');
  const [editingNotes, setEditingNotes] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const totalPages = useMemo(() => {
    return total === 0 ? 1 : Math.ceil(total / size);
  }, [total, size]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, size };
      if (statusFilter) {
        (params as any).status = statusFilter;
      }
      const data = await companyCollaboratorsApi.list(companyId, params);
      setCollaborators(data.content);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
      setError('Errore durante il caricamento dei collaboratori.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, page, size, statusFilter]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!newUserId || !newRole) {
      setError('UserId e ruolo sono obbligatori per creare un collaboratore.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await companyCollaboratorsApi.create(companyId, {
        userId: newUserId,
        role: newRole,
        notes: newNotes || undefined,
      });
      setNewUserId('');
      setNewRole('');
      setNewNotes('');
      setPage(0);
      await loadData();
    } catch (e) {
      console.error(e);
      const message = (e.response && e.response.data && e.response.data.message) || 'Errore durante la creazione del collaboratore.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (collab) => {
    setEditingId(collab.id);
    setEditingRole(collab.role);
    setEditingNotes(collab.notes || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingRole('');
    setEditingNotes('');
  };

  const handleSaveEdit = async (collabId) => {
    setSaving(true);
    setError('');
    try {
      await companyCollaboratorsApi.update(companyId, collabId, {
        role: editingRole,
        notes: editingNotes,
      });
      cancelEditing();
      await loadData();
    } catch (e) {
      console.error(e);
      const message = (e.response && e.response.data && e.response.data.message) || 'Errore durante l\'aggiornamento del collaboratore.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (collab) => {
    const newStatus = collab.status === 'ATTIVO' ? 'INATTIVO' : 'ATTIVO';
    setUpdatingStatusId(collab.id);
    setError('');
    try {
      await companyCollaboratorsApi.updateStatus(companyId, collab.id, newStatus);
      await loadData();
    } catch (e) {
      console.error(e);
      const message = (e.response && e.response.data && e.response.data.message) || 'Errore durante il cambio di stato.';
      setError(message);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="company-collaborators-tab">
      <h2>Collaboratori associati all'azienda</h2>

      {error && <div className="cc-alert cc-alert-error">{error}</div>}

      <div className="cc-filters">
        <label>
          Stato:
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tutti</option>
            <option value="ATTIVO">Attivi</option>
            <option value="INATTIVO">Inattivi</option>
          </select>
        </label>

        <label>
          Elementi per pagina:
          <select value={size} onChange={(e) => { setSize(parseInt(e.target.value, 10)); setPage(0); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>
      </div>

      <div className="cc-table-wrapper">
        {loading ? (
          <div className="cc-loading">Caricamento collaboratori...</div>
        ) : (
          <table className="cc-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Ruolo</th>
                <th>Note</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {collaborators.length === 0 && (
                <tr>
                  <td colSpan={6} className="cc-empty">Nessun collaboratore associato.</td>
                </tr>
              )}
              {collaborators.map((collab) => (
                <tr key={collab.id} className={collab.status === 'INATTIVO' ? 'cc-row-inactive' : ''}>
                  <td>{collab.user.firstName} {collab.user.lastName}</td>
                  <td>{collab.user.email}</td>
                  <td>
                    {editingId === collab.id ? (
                      <input
                        type="text"
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value)}
                      />
                    ) : (
                      collab.role
                    )}
                  </td>
                  <td>
                    {editingId === collab.id ? (
                      <input
                        type="text"
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                      />
                    ) : (
                      collab.notes || ''
                    )}
                  </td>
                  <td>
                    <span className={collab.status === 'ATTIVO' ? 'cc-status-active' : 'cc-status-inactive'}>
                      {collab.status === 'ATTIVO' ? 'Attivo' : 'Inattivo'}
                    </span>
                  </td>
                  <td>
                    {editingId === collab.id ? (
                      <>
                        <button
                          type="button"
                          className="cc-btn cc-btn-primary"
                          disabled={saving}
                          onClick={() => handleSaveEdit(collab.id)}
                        >
                          Salva
                        </button>
                        <button
                          type="button"
                          className="cc-btn cc-btn-secondary"
                          onClick={cancelEditing}
                          disabled={saving}
                        >
                          Annulla
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="cc-btn cc-btn-secondary"
                          onClick={() => startEditing(collab)}
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          className="cc-btn cc-btn-link"
                          disabled={updatingStatusId === collab.id}
                          onClick={() => handleToggleStatus(collab)}
                        >
                          {collab.status === 'ATTIVO' ? 'Disattiva' : 'Attiva'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="cc-pagination">
        <button
          type="button"
          className="cc-btn"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          « Precedente
        </button>
        <span>
          Pagina {page + 1} di {totalPages}
        </span>
        <button
          type="button"
          className="cc-btn"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Successiva »
        </button>
      </div>

      <div className="cc-new-form">
        <h3>Aggiungi collaboratore</h3>
        <form onSubmit={handleCreate}>
          <div className="cc-form-row">
            <label>
              User ID
              <input
                type="text"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="ID utente esistente"
              />
            </label>
          </div>
          <div className="cc-form-row">
            <label>
              Ruolo
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Es. Referente commerciale"
              />
            </label>
          </div>
          <div className="cc-form-row">
            <label>
              Note
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Note opzionali"
              />
            </label>
          </div>
          <div className="cc-form-actions">
            <button type="submit" className="cc-btn cc-btn-primary" disabled={saving}>
              Aggiungi collaboratore
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CompanyCollaboratorsTab.propTypes = {
  companyId: PropTypes.string.isRequired,
};

export default CompanyCollaboratorsTab;
