import React, { useEffect, useMemo, useState } from 'react';
import { companyCollaboratorsApi, CompanyCollaboratorDTO } from '../../api/companyCollaboratorsApi';
import { collaboratorsApi, CollaboratorOption } from '../../api/collaboratorsApi';
import { useNotifications } from '../../hooks/useNotifications';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { Button } from '../ui/Button';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { IconEdit, IconPlus, IconToggleOn, IconToggleOff } from '../ui/Icons';
import { Modal } from '../ui/Modal';

export interface CompanyCollaboratorsSectionProps {
  companyId: number;
}

type Mode = 'view' | 'add' | 'edit';

interface CollaboratorFormState {
  associationId?: number;
  collaboratorId?: number;
  createNew: boolean;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const defaultFormState: CollaboratorFormState = {
  createNew: false,
  name: '',
  email: '',
  phone: '',
  role: '',
  status: 'ACTIVE'
};

export const CompanyCollaboratorsSection: React.FC<CompanyCollaboratorsSectionProps> = ({ companyId }) => {
  const [items, setItems] = useState<CompanyCollaboratorDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>('view');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formState, setFormState] = useState<CollaboratorFormState>(defaultFormState);
  const [saving, setSaving] = useState<boolean>(false);

  const [collaboratorOptions, setCollaboratorOptions] = useState<CollaboratorOption[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState<boolean>(false);

  const notifications = useNotifications();
  const confirmDialog = useConfirmDialog();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await companyCollaboratorsApi.list(companyId);
      setItems(data);
    } catch (e: any) {
      console.error('Errore caricamento collaboratori azienda', e);
      setError('Impossibile caricare i collaboratori associati all\'azienda.');
    } finally {
      setLoading(false);
    }
  };

  const loadCollaboratorOptions = async () => {
    setLoadingCollaborators(true);
    try {
      const data = await collaboratorsApi.listOptions();
      setCollaboratorOptions(data);
    } catch (e: any) {
      console.error('Errore caricamento elenco collaboratori', e);
      notifications.error('Impossibile caricare l\'elenco dei collaboratori.');
    } finally {
      setLoadingCollaborators(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  const openAddModal = () => {
    setFormState({ ...defaultFormState });
    setMode('add');
    setIsModalOpen(true);
    loadCollaboratorOptions();
  };

  const openEditModal = (item: CompanyCollaboratorDTO) => {
    setFormState({
      associationId: item.associationId,
      collaboratorId: item.collaboratorId,
      createNew: false,
      name: item.name,
      email: item.email || '',
      phone: item.phone || '',
      role: item.role,
      status: item.status
    });
    setMode('edit');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSaving(false);
  };

  const handleFormChange = (field: keyof CollaboratorFormState, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);

    try {
      if (mode === 'add') {
        const payload = {
          collaboratorId: formState.createNew ? undefined : formState.collaboratorId,
          createNew: formState.createNew,
          name: formState.createNew ? formState.name : undefined,
          email: formState.email || undefined,
          phone: formState.phone || undefined,
          role: formState.role,
          status: formState.status
        };

        const created = await companyCollaboratorsApi.add(companyId, payload);
        setItems(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        notifications.success('Collaboratore associato all\'azienda con successo.');
      } else if (mode === 'edit' && formState.associationId) {
        const payload = {
          role: formState.role,
          status: formState.status,
          email: formState.email,
          phone: formState.phone
        };
        const updated = await companyCollaboratorsApi.update(
          companyId,
          formState.associationId,
          payload
        );
        setItems(prev => prev.map(i => (i.associationId === updated.associationId ? updated : i)));
        notifications.success('Collaboratore aggiornato con successo.');
      }

      closeModal();
    } catch (e: any) {
      console.error('Errore salvataggio collaboratore azienda', e);
      notifications.error('Si è verificato un errore durante il salvataggio del collaboratore.');
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item: CompanyCollaboratorDTO) => {
    const nextStatus: 'ACTIVE' | 'INACTIVE' = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const confirmed = await confirmDialog.confirm({
      title: nextStatus === 'ACTIVE' ? 'Attivare collaboratore' : 'Disattivare collaboratore',
      message:
        nextStatus === 'ACTIVE'
          ? `Confermi di attivare il collaboratore ${item.name}?`
          : `Confermi di disattivare il collaboratore ${item.name}?`,
      confirmLabel: nextStatus === 'ACTIVE' ? 'Attiva' : 'Disattiva',
      cancelLabel: 'Annulla'
    });

    if (!confirmed) return;

    try {
      const updated = await companyCollaboratorsApi.updateStatus(
        companyId,
        item.associationId,
        nextStatus
      );
      setItems(prev => prev.map(i => (i.associationId === updated.associationId ? updated : i)));
      notifications.success('Stato del collaboratore aggiornato.');
    } catch (e: any) {
      console.error('Errore aggiornamento stato collaboratore', e);
      notifications.error('Impossibile aggiornare lo stato del collaboratore.');
    }
  };

  const statusBadge = (status: 'ACTIVE' | 'INACTIVE') => {
    if (status === 'ACTIVE') {
      return <Badge variant="success">Attivo</Badge>;
    }
    return <Badge variant="neutral">Inattivo</Badge>;
  };

  const sortedItems = useMemo(
    () => items.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  return (
    <section className="company-collaborators-section">
      <header className="company-collaborators-header">
        <h2>Collaboratori</h2>
        <Button variant="primary" size="sm" onClick={openAddModal} iconLeft={<IconPlus />}> 
          Aggiungi collaboratore
        </Button>
      </header>

      {loading && <div className="company-collaborators-loading">Caricamento collaboratori...</div>}
      {error && !loading && <div className="company-collaborators-error">{error}</div>}

      {!loading && !error && (
        <Table
          columns=[
            { key: 'name', header: 'Nome', width: '30%' },
            { key: 'contacts', header: 'Email / Telefono', width: '30%' },
            { key: 'role', header: 'Ruolo', width: '20%' },
            { key: 'status', header: 'Stato', width: '10%' },
            { key: 'actions', header: 'Azioni', width: '10%' }
          ]
          data={sortedItems.map(item => ({
            key: item.associationId,
            cells: {
              name: item.name,
              contacts: (
                <div className="company-collaborators-contacts">
                  {item.email && <div className="contact-line">{item.email}</div>}
                  {item.phone && <div className="contact-line">{item.phone}</div>}
                  {!item.email && !item.phone && <span className="muted">N/D</span>}
                </div>
              ),
              role: item.role,
              status: statusBadge(item.status),
              actions: (
                <div className="company-collaborators-actions">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => openEditModal(item)}
                    iconLeft={<IconEdit />}
                  >
                    Modifica
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleToggleStatus(item)}
                    iconLeft={item.status === 'ACTIVE' ? <IconToggleOff /> : <IconToggleOn />}
                  >
                    {item.status === 'ACTIVE' ? 'Disattiva' : 'Attiva'}
                  </Button>
                </div>
              )
            }
          }))}
          emptyMessage="Nessun collaboratore associato all'azienda."
        />
      )}

      {isModalOpen && (
        <Modal onClose={closeModal} title={mode === 'add' ? 'Aggiungi collaboratore' : 'Modifica collaboratore'}>
          <form className="company-collaborators-form" onSubmit={handleSubmit}>
            {mode === 'add' && (
              <div className="form-group">
                <label className="label-inline">
                  <input
                    type="checkbox"
                    checked={formState.createNew}
                    onChange={e => handleFormChange('createNew', e.target.checked)}
                  />
                  <span>Crea nuovo collaboratore</span>
                </label>
              </div>
            )}

            {mode === 'add' && !formState.createNew && (
              <div className="form-group">
                <label>Collaboratore esistente</label>
                <select
                  value={formState.collaboratorId || ''}
                  onChange={e => handleFormChange('collaboratorId', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  required
                  disabled={loadingCollaborators}
                >
                  <option value="">Seleziona collaboratore...</option>
                  {collaboratorOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} {opt.email ? `(${opt.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(mode === 'edit' || formState.createNew) && (
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={e => handleFormChange('name', e.target.value)}
                  required={formState.createNew}
                  disabled={mode === 'edit'}
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formState.email}
                onChange={e => handleFormChange('email', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Telefono</label>
              <input
                type="tel"
                value={formState.phone}
                onChange={e => handleFormChange('phone', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Ruolo</label>
              <input
                type="text"
                value={formState.role}
                onChange={e => handleFormChange('role', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Stato</label>
              <select
                value={formState.status}
                onChange={e => handleFormChange('status', e.target.value as 'ACTIVE' | 'INACTIVE')}
              >
                <option value="ACTIVE">Attivo</option>
                <option value="INACTIVE">Inattivo</option>
              </select>
            </div>

            <div className="modal-footer">
              <Button type="button" variant="ghost" onClick={closeModal} disabled={saving}>
                Annulla
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Salvataggio...' : 'Salva'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
};

export default CompanyCollaboratorsSection;
