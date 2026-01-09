import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../../shared/logger/Logger';
import { MailerService } from '../../../shared/mailer/MailerService';
import { ExternalCollaboratorInvitationRepository } from '../repositories/ExternalCollaboratorInvitationRepository';
import { loadExternalCollaboratorInvitationConfig } from '../../../config/externalCollaboratorInvitation.config';
import {
  renderExternalCollaboratorInvitationEmail,
  ExternalCollaboratorInvitationEmailContext
} from '../templates/externalCollaboratorInvitationEmail.template';

export interface CreateExternalCollaboratorInvitationCommand {
  externalOwnerId: string;
  externalOwnerName: string;
  externalOwnerCompanyName: string;
  externalOwnerSupportEmail?: string;
  recipientEmail: string;
  locale?: string;
}

export interface ExternalCollaboratorInvitationServiceDeps {
  mailerService: MailerService;
  invitationRepository: ExternalCollaboratorInvitationRepository;
  logger: Logger;
  env: NodeJS.ProcessEnv;
}

export class ExternalCollaboratorInvitationService {
  private readonly mailerService: MailerService;
  private readonly invitationRepository: ExternalCollaboratorInvitationRepository;
  private readonly logger: Logger;
  private readonly config = loadExternalCollaboratorInvitationConfig(process.env);

  constructor(deps: ExternalCollaboratorInvitationServiceDeps) {
    this.mailerService = deps.mailerService;
    this.invitationRepository = deps.invitationRepository;
    this.logger = deps.logger;
    this.config = loadExternalCollaboratorInvitationConfig(deps.env);
  }

  async createAndSendInvitation(
    command: CreateExternalCollaboratorInvitationCommand
  ): Promise<{ invitationId: string; invitedEmail: string; expiresAt: Date }> {
    const token = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.tokenTtlHours * 60 * 60 * 1000);

    const invitation = await this.invitationRepository.createInvitation({
      externalOwnerId: command.externalOwnerId,
      email: command.recipientEmail,
      token,
      expiresAt,
      locale: command.locale || this.config.localeDefault
    });

    const activationLink = this.buildActivationLink(token);

    const emailContext: ExternalCollaboratorInvitationEmailContext = {
      recipientEmail: command.recipientEmail,
      externalOwnerName: command.externalOwnerName,
      externalOwnerCompanyName: command.externalOwnerCompanyName,
      activationLink,
      expiresAt,
      supportEmail: command.externalOwnerSupportEmail,
      locale: command.locale || this.config.localeDefault
    };

    const { subject, html, text } = renderExternalCollaboratorInvitationEmail(emailContext);

    try {
      await this.mailerService.sendMail({
        to: command.recipientEmail,
        from: this.config.mailFrom,
        subject,
        html,
        text
      });
    } catch (error: any) {
      // Non esporre il token nei log
      this.logger.error('Errore durante l\'invio email di invito collaboratore esterno', {
        error: error?.message || error,
        recipientEmail: command.recipientEmail,
        externalOwnerId: command.externalOwnerId,
        invitationId: invitation.id
      });

      // Se il sistema prevede un meccanismo di retry asincrono, qui potremmo
      // inserire un messaggio in coda. Per ora ci limitiamo a rilanciare l\'errore.
      throw new Error('EMAIL_SEND_FAILED');
    }

    return {
      invitationId: invitation.id,
      invitedEmail: command.recipientEmail,
      expiresAt
    };
  }

  private buildActivationLink(token: string): string {
    const baseUrl = this.config.portalBaseUrl;
    // Esempio di path: /external-collaborators/activate?token=...
    const url = new URL('/external-collaborators/activate', baseUrl);
    url.searchParams.set('token', token);
    return url.toString();
  }
}
