import React, { useState, FormEvent } from 'react';
import './ExternalCollaboratorInvitationsPage.css';

interface Invitation {
  id: string;
  invitedEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELED';
  tokenExpiry: string;
  registrationCompleted: boolean;
  firstActivationAt: string | null;
  createdAt: string;
}

const statusConfig: Record<Invitation['status'], { label: string; class: string; icon: string }> = {
  PENDING: { label: 'In Attesa', class: 'status-pending', icon: '⏳' },
  ACCEPTED: { label: 'Accettato', class: 'status-accepted', icon: '✓' },
  EXPIRED: { label: 'Scaduto', class: 'status-expired', icon: '⏰' },
  CANCELED: { label: 'Annullato', class: 'status-canceled', icon: '✗' }
};

// Mock data
const mockInvitations: Invitation[] = [
  {
    id: '1',
    invitedEmail: 'mario.rossi@email.com',
    status: 'PENDING',
    tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    registrationCompleted: false,
    firstActivationAt: null,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    invitedEmail: 'laura.bianchi@email.com',
    status: 'ACCEPTED',
    tokenExpiry: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    registrationCompleted: true,
    firstActivationAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    invitedEmail: 'giuseppe.verdi@email.com',
    status: 'EXPIRED',
    tokenExpiry: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    registrationCompleted: false,
    firstActivationAt: null,
    createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const ExternalCollaboratorInvitationsPage: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>(mockInvitations);
  const [email, setEmail] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!email || !email.includes('@')) {
      setError('Inserire un indirizzo email valido.');
      return;
    }

    setCreating(true);
    
    // Simula chiamata API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newInvitation: Invitation = {
      id: String(Date.now()),
      invitedEmail: email,
      status: 'PENDING',
      tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      registrationCompleted: false,
      firstActivationAt: null,
      createdAt: new Date().toISOString()
    };
    
    setInvitations([newInvitation, ...invitations]);
    setEmail('');
    setSuccess(`✉️ Invito inviato con successo a ${email}`);
    setCreating(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="invitations-page">
      <div className="page-header">
        <div className="header-content">
          <h1>👥 Collaboratori Esterni</h1>
          <p>Invita e gestisci i collaboratori della tua azienda</p>
        </div>
        <div className="header-stats">
          <div className="stat-pill">
            <span className="stat-number">{invitations.filter(i => i.status === 'PENDING').length}</span>
            <span className="stat-text">In attesa</span>
          </div>
          <div className="stat-pill active">
            <span className="stat-number">{invitations.filter(i => i.status === 'ACCEPTED').length}</span>
            <span className="stat-text">Attivi</span>
          </div>
        </div>
      </div>

      {/* Invite Form */}
      <div className="invite-card">
        <div className="invite-card-header">
          <h2>✉️ Nuovo Invito</h2>
          <p>Invia un invito via email per aggiungere un nuovo collaboratore</p>
        </div>
        
        <form className="invite-form" onSubmit={handleSubmit}>
          <div className="form-input-group">
            <span className="input-icon">📧</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nome.cognome@email.com"
              required
            />
            <button type="submit" disabled={creating}>
              {creating ? (
                <span className="btn-loading">
                  <span className="spinner-small"></span>
                  Invio...
                </span>
              ) : (
                <>
                  <span>Invia Invito</span>
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="invite-alert error">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="invite-alert success">
            {success}
          </div>
        )}
      </div>

      {/* Invitations List */}
      <div className="invitations-list">
        <div className="list-header">
          <h2>📋 Inviti Inviati</h2>
          <span className="list-count">{invitations.length} totali</span>
        </div>

        {invitations.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>Nessun invito inviato</p>
            <span className="empty-hint">Usa il form sopra per invitare il primo collaboratore</span>
          </div>
        ) : (
          <div className="invitations-grid">
            {invitations.map(inv => (
              <div key={inv.id} className={`invitation-card ${inv.status.toLowerCase()}`}>
                <div className="invitation-header">
                  <div className="invitation-avatar">
                    {inv.invitedEmail.charAt(0).toUpperCase()}
                  </div>
                  <div className="invitation-info">
                    <span className="invitation-email">{inv.invitedEmail}</span>
                    <span className="invitation-date">Inviato il {formatDate(inv.createdAt)}</span>
                  </div>
                  <span className={`invitation-status ${statusConfig[inv.status].class}`}>
                    {statusConfig[inv.status].icon} {statusConfig[inv.status].label}
                  </span>
                </div>
                
                <div className="invitation-details">
                  <div className="detail-item">
                    <span className="detail-label">Scadenza token</span>
                    <span className="detail-value">{formatDate(inv.tokenExpiry)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Registrazione</span>
                    <span className={`detail-value ${inv.registrationCompleted ? 'completed' : ''}`}>
                      {inv.registrationCompleted ? '✓ Completata' : 'In attesa'}
                    </span>
                  </div>
                  {inv.firstActivationAt && (
                    <div className="detail-item">
                      <span className="detail-label">Prima attivazione</span>
                      <span className="detail-value">{formatDate(inv.firstActivationAt)}</span>
                    </div>
                  )}
                </div>

                <div className="invitation-actions">
                  {inv.status === 'PENDING' && (
                    <>
                      <button className="action-btn resend" title="Reinvia">
                        🔄 Reinvia
                      </button>
                      <button className="action-btn cancel" title="Annulla">
                        ✗ Annulla
                      </button>
                    </>
                  )}
                  {inv.status === 'EXPIRED' && (
                    <button className="action-btn resend" title="Reinvia">
                      🔄 Reinvia invito
                    </button>
                  )}
                  {inv.status === 'ACCEPTED' && (
                    <button className="action-btn view" title="Visualizza profilo">
                      👤 Vedi profilo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExternalCollaboratorInvitationsPage;
