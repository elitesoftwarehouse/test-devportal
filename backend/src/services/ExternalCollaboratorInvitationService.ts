import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { ExternalCollaboratorInvitation } from '../models/ExternalCollaboratorInvitation';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { getLogger } from '../utils/logger';

export interface CreateExternalInvitationInput {
  email: string;
  firstName?: string;
  lastName?: string;
  message?: string;
  companyId: string;
  owner: User;
}

export interface CompleteExternalInvitationInput {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptPrivacy: boolean;
  acceptTerms: boolean;
}

export class ExternalCollaboratorInvitationService {
  private invitationRepo: Repository<ExternalCollaboratorInvitation>;
  private userRepo: Repository<User>;
  private companyRepo: Repository<Company>;
  private logger = getLogger('ExternalCollaboratorInvitationService');

  constructor(
    invitationRepo: Repository<ExternalCollaboratorInvitation>,
    userRepo: Repository<User>,
    companyRepo: Repository<Company>
  ) {
    this.invitationRepo = invitationRepo;
    this.userRepo = userRepo;
    this.companyRepo = companyRepo;
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  private getDefaultExpirationDate(): Date {
    const d = new Date();
    d.setDate(d.getDate() + 7); // 7 giorni di validità
    return d;
  }

  async createInvitation(input: CreateExternalInvitationInput): Promise<ExternalCollaboratorInvitation> {
    const { email, firstName, lastName, message, companyId, owner } = input;

    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company) {
      throw new Error('COMPANY_NOT_FOUND');
    }

    const existingUser = await this.userRepo.findOne({ where: { email: email.toLowerCase() } });

    const now = new Date();
    const activeInvitation = await this.invitationRepo.findOne({
      where: {
        email: email.toLowerCase(),
        company: { id: companyId },
        status: 'PENDING'
      },
      relations: ['company']
    });

    if (activeInvitation && activeInvitation.expiresAt > now) {
      throw new Error('ACTIVE_INVITATION_ALREADY_EXISTS');
    }

    const token = this.generateToken();

    const invitation = this.invitationRepo.create({
      email: email.toLowerCase(),
      firstName: firstName || null,
      lastName: lastName || null,
      message: message || null,
      token,
      expiresAt: this.getDefaultExpirationDate(),
      status: 'PENDING',
      owner,
      company,
      acceptedBy: null,
      acceptedAt: null
    });

    if (existingUser) {
      this.logger.info(
        `Creating external collaborator invitation for existing user ${existingUser.id} / ${email}`
      );
    } else {
      this.logger.info(`Creating external collaborator invitation for new user ${email}`);
    }

    const saved = await this.invitationRepo.save(invitation);

    // Integrazione con sistema di email/invio notifiche può essere aggiunta qui

    return saved;
  }

  async getInvitationByToken(token: string): Promise<ExternalCollaboratorInvitation> {
    const invitation = await this.invitationRepo.findOne({
      where: { token },
      relations: ['company', 'owner']
    });

    if (!invitation) {
      throw new Error('INVITATION_NOT_FOUND');
    }

    const now = new Date();
    if (invitation.expiresAt <= now) {
      throw new Error('INVITATION_EXPIRED');
    }

    if (invitation.status !== 'PENDING') {
      throw new Error('INVITATION_NOT_PENDING');
    }

    return invitation;
  }

  async completeInvitation(input: CompleteExternalInvitationInput): Promise<User> {
    const { token, password, firstName, lastName, acceptPrivacy, acceptTerms } = input;

    if (!acceptPrivacy || !acceptTerms) {
      throw new Error('CONSENTS_NOT_ACCEPTED');
    }

    const invitation = await this.getInvitationByToken(token);

    const existingUser = await this.userRepo.findOne({ where: { email: invitation.email } });

    let user: User;

    if (existingUser) {
      user = existingUser;
      if (!user.firstName) user.firstName = firstName;
      if (!user.lastName) user.lastName = lastName;
      if (!user.passwordHash) {
        user.setPassword(password);
      }
    } else {
      user = this.userRepo.create({
        email: invitation.email,
        firstName,
        lastName,
        role: 'EXTERNAL_COLLABORATOR',
        isActive: true
      } as any);
      user.setPassword(password);
    }

    if (!user.roles || !Array.isArray((user as any).roles)) {
      (user as any).roles = [];
    }

    if (!(user as any).roles.includes('EXTERNAL_COLLABORATOR')) {
      (user as any).roles.push('EXTERNAL_COLLABORATOR');
    }

    // associazione all'azienda invitante
    if (!(user as any).companies) {
      (user as any).companies = [];
    }
    const alreadyLinked = (user as any).companies.some((c: Company) => c.id === invitation.company.id);
    if (!alreadyLinked) {
      (user as any).companies.push(invitation.company);
    }

    const savedUser = await this.userRepo.save(user);

    invitation.status = 'ACCEPTED';
    invitation.acceptedBy = savedUser;
    invitation.acceptedAt = new Date();

    await this.invitationRepo.save(invitation);

    this.logger.info(
      `External collaborator invitation accepted by user ${savedUser.id} for company ${invitation.company.id}`
    );

    return savedUser;
  }
}
