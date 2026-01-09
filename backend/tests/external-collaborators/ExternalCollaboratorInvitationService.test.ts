import { ExternalCollaboratorInvitationService } from '../../src/modules/external-collaborators/services/ExternalCollaboratorInvitationService';
import { ExternalCollaboratorInvitationRepository } from '../../src/modules/external-collaborators/repositories/ExternalCollaboratorInvitationRepository';
import { MailerService } from '../../src/shared/mailer/MailerService';
import { Logger } from '../../src/shared/logger/Logger';

class FakeInvitationRepository extends ExternalCollaboratorInvitationRepository {
  constructor() {
    // @ts-ignore - non usiamo realmente il pool in test
    super({});
  }

  async createInvitation(dto: any): Promise<any> {
    return {
      id: 'invitation-id-123',
      externalOwnerId: dto.externalOwnerId,
      email: dto.email,
      tokenHash: 'hash',
      expiresAt: dto.expiresAt,
      createdAt: new Date(),
      locale: dto.locale
    };
  }
}

class FakeMailerService extends MailerService {
  public sent: any[] = [];

  constructor() {
    // @ts-ignore
    super(new Logger(), {});
  }

  async sendMail(message: any): Promise<void> {
    this.sent.push(message);
  }
}

describe('ExternalCollaboratorInvitationService', () => {
  it('crea invito e invia email con link di attivazione', async () => {
    const fakeMailer = new FakeMailerService();
    const fakeRepo = new FakeInvitationRepository();
    const logger = new Logger();

    const service = new ExternalCollaboratorInvitationService({
      mailerService: fakeMailer,
      invitationRepository: fakeRepo,
      logger,
      env: {
        EXTERNAL_COLLABORATOR_INVITATION_TOKEN_TTL_HOURS: '24',
        EXTERNAL_COLLABORATOR_PORTAL_BASE_URL: 'https://portal.example.com',
        EXTERNAL_COLLABORATOR_MAIL_FROM: 'no-reply@example.com',
        EXTERNAL_COLLABORATOR_INVITATION_LOCALE_DEFAULT: 'it'
      } as any
    });

    const result = await service.createAndSendInvitation({
      externalOwnerId: 'owner-123',
      externalOwnerName: 'Mario Rossi',
      externalOwnerCompanyName: 'ACME S.p.A.',
      recipientEmail: 'collab@example.com',
      locale: 'it'
    });

    expect(result.invitationId).toBe('invitation-id-123');
    expect(fakeMailer.sent.length).toBe(1);
    const mail = fakeMailer.sent[0];
    expect(mail.to).toBe('collab@example.com');
    expect(mail.from).toBe('no-reply@example.com');
    expect(mail.subject).toContain('ACME S.p.A.');
    expect(mail.text).toContain('collaboratore esterno');
    expect(mail.html).toContain('Attiva il tuo accesso');
    expect(mail.html).toContain('https://portal.example.com');
  });
});
