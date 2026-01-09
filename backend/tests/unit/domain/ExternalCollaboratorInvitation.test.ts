import { ExternalCollaboratorInvitation } from '../../../src/domain/externalCollaboration/ExternalCollaboratorInvitation';

describe('ExternalCollaboratorInvitation domain', () => {
  it('genera un token se non fornito', () => {
    const invitation = ExternalCollaboratorInvitation.createNew('test@example.com', 'company-1');
    expect(invitation.token).toBeDefined();
    expect(typeof invitation.token).toBe('string');
  });

  it('calcola una scadenza di 7 giorni', () => {
    const now = new Date('2024-01-01T00:00:00Z');
    const expires = ExternalCollaboratorInvitation.calculateExpiry(now);
    const expected = new Date('2024-01-08T00:00:00Z');
    expect(expires.toISOString()).toBe(expected.toISOString());
  });

  it('stato iniziale PENDING e transizione a ACCEPTED', () => {
    const invitation = ExternalCollaboratorInvitation.createNew('test@example.com', 'company-1');
    expect(invitation.status).toBe('PENDING');
    invitation.accept();
    expect(invitation.status).toBe('ACCEPTED');
    expect(invitation.acceptedAt).toBeInstanceOf(Date);
  });

  it('transizione a EXPIRED se accettato dopo la scadenza', () => {
    const now = new Date('2024-01-01T00:00:00Z');
    const expires = ExternalCollaboratorInvitation.calculateExpiry(now);
    const invitation = ExternalCollaboratorInvitation.rehydrate({
      id: 'inv-1',
      email: 'test@example.com',
      externalOwnerCompanyId: 'company-1',
      token: 'tok-1',
      expiresAt: expires,
      status: 'PENDING',
      createdAt: now,
      acceptedAt: null,
    });

    const afterExpiry = new Date('2024-01-09T00:00:00Z');
    invitation.accept(afterExpiry);
    expect(invitation.status).toBe('EXPIRED');
    expect(invitation.acceptedAt).toBeNull();
  });

  it('expire() forza lo stato EXPIRED se non già ACCEPTED', () => {
    const invitation = ExternalCollaboratorInvitation.createNew('test@example.com', 'company-1');
    invitation.expire();
    expect(invitation.status).toBe('EXPIRED');
  });

  it('expire() non modifica uno stato già ACCEPTED', () => {
    const invitation = ExternalCollaboratorInvitation.createNew('test@example.com', 'company-1');
    invitation.accept();
    const statusBefore = invitation.status;
    invitation.expire();
    expect(invitation.status).toBe(statusBefore);
  });
});
