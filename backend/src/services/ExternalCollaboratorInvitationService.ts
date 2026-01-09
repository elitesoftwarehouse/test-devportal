import { ExternalCollaboratorInvitation } from '../domain/externalCollaboration/ExternalCollaboratorInvitation';
import { ExternalCollaboratorInvitationRepository } from '../repositories/ExternalCollaboratorInvitationRepository';
import { UserRepository } from '../repositories/UserRepository';
import { Mailer } from '../services/Mailer';
import { AuthorizationService } from '../services/AuthorizationService';

export interface InviteExternalCollaboratorPayload {
  email: string;
}

export interface CompleteExternalActivationPayload {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}

export class ExternalCollaboratorInvitationService {
  constructor(
    private readonly invitationRepository: ExternalCollaboratorInvitationRepository,
    private readonly userRepository: UserRepository,
    private readonly mailer: Mailer,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async inviteExternalCollaborator(currentUserId: string, payload: InviteExternalCollaboratorPayload) {
    await this.authorizationService.assertCanInviteExternalCollaborator(currentUserId);

    const normalizedEmail = payload.email.toLowerCase();

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_IN_USE');
    }

    const existingInvitation = await this.invitationRepository.findPendingByEmail(normalizedEmail);
    if (existingInvitation) {
      throw new Error('INVITATION_ALREADY_EXISTS');
    }

    const owner = await this.userRepository.findById(currentUserId);
    if (!owner || !owner.companyId) {
      throw new Error('EXTERNAL_OWNER_COMPANY_NOT_FOUND');
    }

    const invitation = ExternalCollaboratorInvitation.createNew(normalizedEmail, owner.companyId);

    await this.invitationRepository.save(invitation);

    try {
      await this.mailer.sendExternalCollaboratorInvitation({
        to: normalizedEmail,
        token: invitation.token,
        companyId: owner.companyId,
      });
    } catch (err) {
      await this.invitationRepository.delete(invitation.id);
      throw new Error('MAIL_SENDING_FAILED');
    }

    return invitation.toPrimitives();
  }

  async completeActivation(payload: CompleteExternalActivationPayload) {
    const invitation = await this.invitationRepository.findByToken(payload.token);
    if (!invitation) {
      throw new Error('INVITATION_NOT_FOUND');
    }

    if (invitation.status === 'ACCEPTED') {
      throw new Error('INVITATION_ALREADY_USED');
    }

    if (invitation.isExpired()) {
      invitation.expire();
      await this.invitationRepository.save(invitation);
      throw new Error('INVITATION_EXPIRED');
    }

    const existingUser = await this.userRepository.findByEmail(invitation.email);
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_IN_USE');
    }

    const user = await this.userRepository.createExternalCollaborator({
      email: invitation.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      password: payload.password,
      companyId: invitation.externalOwnerCompanyId,
      role: 'EXTERNAL_COLLABORATOR',
    });

    invitation.accept();
    await this.invitationRepository.save(invitation);

    return {
      userId: user.id,
      role: user.role,
      companyId: user.companyId,
      invitationStatus: invitation.status,
    };
  }
}
