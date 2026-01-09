import { ExternalCollaboratorInvitationService } from '../../../src/services/ExternalCollaboratorInvitationService';
import { ExternalCollaboratorInvitation } from '../../../src/domain/externalCollaboration/ExternalCollaboratorInvitation';

class InMemoryInvitationRepo {
  items: any[] = [];
  async save(invitation: ExternalCollaboratorInvitation) {
    const existingIdx = this.items.findIndex((i) => i.id === invitation.id);
    const data = invitation.toPrimitives();
    if (existingIdx >= 0) this.items[existingIdx] = data;
    else this.items.push(data);
  }
  async delete(id: string) {
    this.items = this.items.filter((i) => i.id !== id);
  }
  async findPendingByEmail(email: string) {
    const found = this.items.find((i) => i.email === email && i.status === 'PENDING');
    return found
      ? ExternalCollaboratorInvitation.rehydrate({
          id: found.id,
          email: found.email,
          token: found.token,
          expiresAt: found.expiresAt,
          status: found.status,
          externalOwnerCompanyId: found.externalOwnerCompanyId,
          createdAt: found.createdAt,
          acceptedAt: found.acceptedAt,
        })
      : null;
  }
  async findByToken(token: string) {
    const found = this.items.find((i) => i.token === token);
    return found
      ? ExternalCollaboratorInvitation.rehydrate({
          id: found.id,
          email: found.email,
          token: found.token,
          expiresAt: found.expiresAt,
          status: found.status,
          externalOwnerCompanyId: found.externalOwnerCompanyId,
          createdAt: found.createdAt,
          acceptedAt: found.acceptedAt,
        })
      : null;
  }
}

class InMemoryUserRepo {
  items: any[] = [];
  async findByEmail(email: string) {
    return this.items.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }
  async findById(id: string) {
    return this.items.find((u) => u.id === id) || null;
  }
  async createExternalCollaborator(params: any) {
    const user = {
      id: 'user-' + (this.items.length + 1),
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      passwordHash: params.password,
      role: params.role,
      companyId: params.companyId,
      roles: [params.role],
    };
    this.items.push(user);
    return user;
  }
}

class FakeMailer {
  calls: any[] = [];
  shouldFail = false;
  async sendExternalCollaboratorInvitation(params: any) {
    if (this.shouldFail) throw new Error('SMTP_ERROR');
    this.calls.push(params);
  }
}

class FakeAuthService {
  shouldForbid = false;
  async assertCanInviteExternalCollaborator(_id: string) {
    if (this.shouldForbid) throw new Error('FORBIDDEN');
  }
}

describe('ExternalCollaboratorInvitationService', () => {
  it('crea invito, salva su repo e chiama il mailer', async () => {
    const invitationRepo = new InMemoryInvitationRepo();
    const userRepo = new InMemoryUserRepo();
    userRepo.items.push({ id: 'owner-1', email: 'owner@acme.com', companyId: 'company-1', roles: ['EXTERNAL_OWNER'] });
    const mailer = new FakeMailer();
    const auth = new FakeAuthService();
    const service = new ExternalCollaboratorInvitationService(invitationRepo as any, userRepo as any, mailer as any, auth as any);

    const result = await service.inviteExternalCollaborator('owner-1', { email: 'collab@example.com' });

    expect(result.email).toBe('collab@example.com');
    expect(invitationRepo.items.length).toBe(1);
    expect(mailer.calls.length).toBe(1);
    expect(mailer.calls[0].to).toBe('collab@example.com');
    expect(mailer.calls[0].token).toBe(result.token);
  });

  it('non permette invito se email già usata da utente', async () => {
    const invitationRepo = new InMemoryInvitationRepo();
    const userRepo = new InMemoryUserRepo();
    userRepo.items.push({ id: 'u1', email: 'collab@example.com', companyId: 'company-1', roles: ['EXTERNAL_COLLABORATOR'] });
    userRepo.items.push({ id: 'owner-1', email: 'owner@acme.com', companyId: 'company-1', roles: ['EXTERNAL_OWNER'] });
    const mailer = new FakeMailer();
    const auth = new FakeAuthService();
    const service = new ExternalCollaboratorInvitationService(invitationRepo as any, userRepo as any, mailer as any, auth as any);

    await expect(
      service.inviteExternalCollaborator('owner-1', { email: 'collab@example.com' }),
    ).rejects.toThrow('EMAIL_ALREADY_IN_USE');
  });

  it('non permette invito duplicato se esiste invito PENDING', async () => {
    const invitationRepo = new InMemoryInvitationRepo();
    const userRepo = new InMemoryUserRepo();
    userRepo.items.push({ id: 'owner-1', email: 'owner@acme.com', companyId: 'company-1', roles: ['EXTERNAL_OWNER'] });
    const mailer = new FakeMailer();
    const auth = new FakeAuthService();
    const service = new ExternalCollaboratorInvitationService(invitationRepo as any, userRepo as any, mailer as any, auth as any);

    await service.inviteExternalCollaborator('owner-1', { email: 'collab@example.com' });
    await expect(
      service.inviteExternalCollaborator('owner-1', { email: 'collab@example.com' }),
    ).rejects.toThrow('INVITATION_ALREADY_EXISTS');
  });

  it('rimuove invito se il mailer fallisce', async () => {
    const invitationRepo = new InMemoryInvitationRepo();
    const userRepo = new InMemoryUserRepo();
    userRepo.items.push({ id: 'owner-1', email: 'owner@acme.com', companyId: 'company-1', roles: ['EXTERNAL_OWNER'] });
    const mailer = new FakeMailer();
    mailer.shouldFail = true;
    const auth = new FakeAuthService();
    const service = new ExternalCollaboratorInvitationService(invitationRepo as any, userRepo as any, mailer as any, auth as any);

    await expect(
      service.inviteExternalCollaborator('owner-1', { email: 'collab@example.com' }),
    ).rejects.toThrow('MAIL_SENDING_FAILED');

    expect(invitationRepo.items.length).toBe(0);
  });

  it('completa attivazione creando utente con ruolo EXTERNAL_COLLABORATOR e collegato ad azienda', async () => {
    const invitationRepo = new InMemoryInvitationRepo();
    const userRepo = new InMemoryUserRepo();
    const mailer = new FakeMailer();
    const auth = new FakeAuthService();
    const service = new ExternalCollaboratorInvitationService(invitationRepo as any, userRepo as any, mailer as any, auth as any);

    // pre-popoliamo un invito
    const inv = ExternalCollaboratorInvitation.createNew('collab@example.com', 'company-1');
    await invitationRepo.save(inv);

    const result = await service.completeActivation({
      token: inv.token,
      firstName: 'Mario',
      lastName: 'Rossi',
      password: 'Password123',
    });

    expect(result.role).toBe('EXTERNAL_COLLABORATOR');
    expect(result.companyId).toBe('company-1');
    expect(result.invitationStatus).toBe('ACCEPTED');
    expect(userRepo.items.length).toBe(1);
    expect(userRepo.items[0].role).toBe('EXTERNAL_COLLABORATOR');
    expect(userRepo.items[0].companyId).toBe('company-1');
  });

  it('non permette attivazione con token inesistente', async () => {
    const invitationRepo = new InMemoryInvitationRepo();
    const userRepo = new InMemoryUserRepo();
    const mailer = new FakeMailer();
    const auth = new FakeAuthService();
    const service = new ExternalCollaboratorInvitationService(invitationRepo as any, userRepo as any, mailer as any, auth as any);

    await expect(
      service.completeActivation({ token: 'non-esiste', firstName: 'a', lastName: 'b', password: 'p' }),
    ).rejects.toThrow('INVITATION_NOT_FOUND');
  });
});
