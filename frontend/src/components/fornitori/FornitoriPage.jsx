import React, { useEffect, useState } from 'react';
import {
  fetchFornitori,
  createFornitore,
  updateFornitore,
  updateFornitoreStato
} from '../../api/fornitoriApi';
import FornitoreForm from './FornitoreForm';

export function FornitoriPage() {
  const [fornitori, setFornitori] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [attivoFilter, setAttivoFilter] = useState('true');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFornitore, setEditingFornitore] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadData(currentPage = page) {
    try {
      setLoading(true);
      setError(null);
      const attivoParam =
        attivoFilter === 'all' ? null : attivoFilter === 'true' ? true : false;
      const response = await fetchFornitori({
        search: search || undefined,
        attivo: attivoParam,
        page: currentPage,
        pageSize
      });
      setFornitori(response.data || []);
      setTotal(response.pagination?.total || 0);
      setPage(response.pagination?.page || currentPage);
    } catch (err) {
      setError('Errore nel caricamento fornitori');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(1);
  }, [search, attivoFilter]);

  function handleNew() {
    setEditingFornitore(null);
    setShowForm(true);
  }

  function handleEdit(fornitore) {
    setEditingFornitore(fornitore);
    setShowForm(true);
  }

  async function handleToggleStato(fornitore) {
    try {
      setLoading(true);
      await updateFornitoreStato(fornitore.id, !fornitore.attivo);
      await loadData(page);
    } catch (err) {
      setError('Errore nell\'aggiornamento dello stato fornitore');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitForm(payload) {
    try {
      setSaving(true);
      setError(null);
      if (editingFornitore) {
        await updateFornitore(editingFornitore.id, payload);
      } else {
        await createFornitore(payload);
      }
      setShowForm(false);
      setEditingFornitore(null);
      await loadData(1);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        const apiError = err.response.data.error;
        if (apiError.code === 'VALIDATION_ERROR') {
          setError('Dati non validi. Verifica i campi evidenziati.');
        } else if (apiError.code === 'DUPLICATE_PARTITA_IVA') {
          setError('Partita IVA già presente a sistema.');
        } else {
          setError(apiError.message || 'Errore nel salvataggio fornitore');
        }
      } else {
        setError('Errore nel salvataggio fornitore');
      }
    } finally {
      setSaving(false);
    }
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingFornitore(null);
    setError(null);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="fornitori-page">
      <div className="fornitori-page__header">
        <h1>Fornitori</h1>
        <button onClick={handleNew}>Nuovo fornitore</button>
      </div>

      <div className="fornitori-page__filters">
        <input
          type="text"
          placeholder="Cerca per ragione sociale o Partita IVA"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          value={attivoFilter}
          onChange={e => setAttivoFilter(e.target.value)}
        >
          <option value="true">Solo attivi</option>
          <option value="false">Solo non attivi</option>
          <option value="all">Tutti</option>
        </select>
      </div>

      {error && <div className="fornitori-page__error">{error}</div>}

      {loading ? (
        <div className="fornitori-page__loading">Caricamento...</div>
      ) : (
        <table className="fornitori-page__table">
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
            {fornitori.length === 0 && (
              <tr>
                <td colSpan={6}>Nessun fornitore trovato</td>
              </tr>
            )}
            {fornitori.map(f => (
              <tr key={f.id} className={!f.attivo ? 'fornitore--inactive' : ''}>
                <td>{f.ragioneSociale}</td>
                <td>{f.partitaIva}</td>
                <td>{f.email}</td>
                <td>{f.telefono}</td>
                <td>{f.attivo ? 'Attivo' : 'Non attivo'}</td>
                <td>
                  <button onClick={() => handleEdit(f)}>Modifica</button>
                  <button onClick={() => handleToggleStato(f)}>
                    {f.attivo ? 'Disattiva' : 'Attiva'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="fornitori-page__pagination">
        <button
          disabled={page <= 1}
          onClick={() => {
            const newPage = page - 1;
            setPage(newPage);
            loadData(newPage);
          }}
        >
          «
        </button>
        <span>
          Pagina {page} di {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => {
            const newPage = page + 1;
            setPage(newPage);
            loadData(newPage);
          }}
        >
          »
        </button>
      </div>

      {showForm && (
        <div className="fornitori-page__modal">
          <div className="fornitori-page__modal-content">
            <h2>{editingFornitore ? 'Modifica fornitore' : 'Nuovo fornitore'}</h2>
            <FornitoreForm
              initialValue={editingFornitore}
              onSubmit={handleSubmitForm}
              onCancel={handleCancelForm}
              saving={saving}
              error={error}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default FornitoriPage;
