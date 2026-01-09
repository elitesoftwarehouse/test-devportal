import React, { useEffect, useState } from 'react';
import {
  listFornitori,
  createFornitore,
  updateFornitore,
  changeStatoFornitore,
  deleteFornitore
} from '../api/fornitoriAziendeApi';
import './FornitoriAziendePage.css';

function emptyForm() {
  return {
    ragioneSociale: '',
    partitaIva: '',
    email: '',
    telefono: '',
    indirizzo: ''
  };
}

export function FornitoriAziendePage() {
  const [fornitori, setFornitori] = useState([]);
  const [soloAttivi, setSoloAttivi] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const data = await listFornitori({ soloAttivi });
      setFornitori(data);
    } catch (e) {
      setError('Errore nel caricamento dei fornitori');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soloAttivi]);

  function onChangeField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await updateFornitore(editingId, form);
      } else {
        await createFornitore(form);
      }
      setForm(emptyForm());
      setEditingId(null);
      await loadData();
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || 'Errore di salvataggio');
      } else {
        setError('Errore di rete');
      }
    }
  }

  function onEdit(fornitore) {
    setEditingId(fornitore.id);
    setForm({
      ragioneSociale: fornitore.ragioneSociale || '',
      partitaIva: fornitore.partitaIva || '',
      email: fornitore.email || '',
      telefono: fornitore.telefono || '',
      indirizzo: fornitore.indirizzo || ''
    });
  }

  async function onToggleStato(fornitore) {
    try {
      await changeStatoFornitore(fornitore.id, !fornitore.attivo);
      await loadData();
    } catch (err) {
      setError('Errore nel cambio di stato');
    }
  }

  async function onDelete(fornitore) {
    if (!window.confirm(`Eliminare il fornitore ${fornitore.ragioneSociale}?`)) {
      return;
    }
    try {
      await deleteFornitore(fornitore.id);
      await loadData();
    } catch (err) {
      setError('Errore nell\'eliminazione');
    }
  }

  function onCancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
  }

  return (
    <div className="fornitori-page">
      <h1>Aziende fornitrici</h1>

      <div className="fornitori-filters">
        <label>
          <input
            type="checkbox"
            checked={soloAttivi}
            onChange={(e) => setSoloAttivi(e.target.checked)}
          />
          Mostra solo attivi
        </label>
      </div>

      {error && <div className="fornitori-error">{error}</div>}

      <form className="fornitori-form" onSubmit={onSubmit}>
        <h2>{editingId ? 'Modifica fornitore' : 'Nuovo fornitore'}</h2>
        <div className="form-row">
          <label>Ragione sociale *</label>
          <input
            name="ragioneSociale"
            value={form.ragioneSociale}
            onChange={onChangeField}
            required
          />
        </div>
        <div className="form-row">
          <label>Partita IVA *</label>
          <input
            name="partitaIva"
            value={form.partitaIva}
            onChange={onChangeField}
            required
          />
        </div>
        <div className="form-row">
          <label>Email</label>
          <input name="email" value={form.email} onChange={onChangeField} />
        </div>
        <div className="form-row">
          <label>Telefono</label>
          <input name="telefono" value={form.telefono} onChange={onChangeField} />
        </div>
        <div className="form-row">
          <label>Indirizzo</label>
          <input name="indirizzo" value={form.indirizzo} onChange={onChangeField} />
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {editingId ? 'Salva modifiche' : 'Crea fornitore'}
          </button>
          {editingId && (
            <button type="button" onClick={onCancelEdit} disabled={loading}>
              Annulla
            </button>
          )}
        </div>
      </form>

      <table className="fornitori-table">
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
          {fornitori.map((f) => (
            <tr key={f.id} className={!f.attivo ? 'fornitore-inattivo' : ''}>
              <td>{f.ragioneSociale}</td>
              <td>{f.partitaIva}</td>
              <td>{f.email}</td>
              <td>{f.telefono}</td>
              <td>{f.attivo ? 'Attivo' : 'Inattivo'}</td>
              <td>
                <button type="button" onClick={() => onEdit(f)}>
                  Modifica
                </button>
                <button type="button" onClick={() => onToggleStato(f)}>
                  {f.attivo ? 'Disattiva' : 'Attiva'}
                </button>
                <button type="button" onClick={() => onDelete(f)}>
                  Elimina
                </button>
              </td>
            </tr>
          ))}
          {fornitori.length === 0 && !loading && (
            <tr>
              <td colSpan={6} className="fornitori-empty">
                Nessun fornitore presente
              </td>
            </tr>
          )}
          {loading && (
            <tr>
              <td colSpan={6} className="fornitori-loading">
                Caricamento...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default FornitoriAziendePage;
