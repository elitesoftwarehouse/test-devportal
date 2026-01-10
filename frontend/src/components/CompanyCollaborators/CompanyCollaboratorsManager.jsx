import React, { useEffect, useState } from 'react';
import {
  getCompanyCollaborators,
  createCompanyCollaborator,
  updateCompanyCollaborator,
  toggleCompanyCollaboratorStatus
} from '../../api/companyCollaboratorsApi';
import './CompanyCollaboratorsManager.css';

const ROLES = ['ADMIN', 'MANAGER', 'USER'];
const STATI = ['ATTIVO', 'INATTIVO'];

export const CompanyCollaboratorsManager = ({ companyId, isAdmin }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [newCollaboratorId, setNewCollaboratorId] = useState('');
  const [newRole, setNewRole] = useState('USER');

  const [editRoleById, setEditRoleById] = useState({});

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCompanyCollaborators(companyId);
      setCollaborators(data);
    } catch (e) {
      setError(e.message || 'Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadCollaborators();
    }
  }, [companyId]);

  const handleCreate = async e => {
    e.preventDefault();
    if (!newCollaboratorId) return;
    try {
      setError('');
      const created = await createCompanyCollaborator(
        companyId,
        { collaboratorId: newCollaboratorId, role: newRole },
        isAdmin
      );
      setCollaborators(prev => [...prev, created]);
      setNewCollaboratorId('');
      setNewRole('USER');
    } catch (e) {
      setError(e.message || 'Errore nella creazione');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      setError('');
      const updated = await updateCompanyCollaborator(companyId, id, { role }, isAdmin);
      setCollaborators(prev => prev.map(c => (c.id === id ? updated : c)));
      setEditRoleById(prev => ({ ...prev, [id]: role }));
    } catch (e) {
      setError(e.message || 'Errore nella modifica ruolo');
    }
  };

  const handleToggleStatus = async (id, status) => {
    const newStatus = status === 'ATTIVO' ? 'INATTIVO' : 'ATTIVO';
    try {
      setError('');
      const updated = await toggleCompanyCollaboratorStatus(companyId, id, { status: newStatus }, isAdmin);
      setCollaborators(prev => prev.map(c => (c.id === id ? updated : c)));
    } catch (e) {
      setError(e.message || 'Errore nel cambio stato');
    }
  };

  return (
    <div className="company-collaborators-manager">
      <h2>Collaboratori azienda</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {loading && <div>Caricamento...</div>}

      {isAdmin && (
        <form className="create-form" onSubmit={handleCreate}>
          <h3>Aggiungi collaboratore</h3>
          <div className="form-row">
            <label>Collaborator ID</label>
            <input
              type="text"
              value={newCollaboratorId}
              onChange={e => setNewCollaboratorId(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Ruolo</label>
            <select value={newRole} onChange={e => setNewRole(e.target.value)}>
              {ROLES.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">Crea associazione</button>
        </form>
      )}

      <table className="collaborators-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Collaborator ID</th>
            <th>Ruolo</th>
            <th>Stato</th>
            {isAdmin && <th>Azioni</th>}
          </tr>
        </thead>
        <tbody>
          {collaborators.map(c => (
            <tr key={c.id} className={c.status === 'INATTIVO' ? 'row-inactive' : ''}>
              <td>{c.id}</td>
              <td>{c.collaboratorId}</td>
              <td>
                {isAdmin ? (
                  <select
                    value={editRoleById[c.id] || c.role}
                    onChange={e => handleRoleChange(c.id, e.target.value)}
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  c.role
                )}
              </td>
              <td>{c.status}</td>
              {isAdmin && (
                <td>
                  <button type="button" onClick={() => handleToggleStatus(c.id, c.status)}>
                    {c.status === 'ATTIVO' ? 'Disattiva' : 'Attiva'}
                  </button>
                </td>
              )}
            </tr>
          ))}
          {!loading && collaborators.length === 0 && (
            <tr>
              <td colSpan={isAdmin ? 5 : 4}>Nessun collaboratore associato</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyCollaboratorsManager;
