import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/UserRepository.js';
import { EmailService } from './EmailService.js';

// Costanti ruolo e stato per coerenza con il dominio esistente
export const EXTERNAL_ROLES = {
  OWNER: 'EXTERNAL_OWNER',
  COLLABORATOR: 'EXTERNAL_COLLABORATOR'
};

export const USER_STATUSES = {
  PENDING: 'PENDING_ACTIVATION',
  ACTIVE: 'ACTIVE'
};

export class ExternalUserRegistrationService {
  /**
   * @param {UserRepository} userRepository
   * @param {EmailService} emailService
   * @param {Object} options
   * @param {string} options.activationBaseUrl - URL base per link attivazione (es. https://portal.example.com/activate)
   * @param {number} options.activationTokenTtlMs - durata token attivazione in millisecondi
   */
  constructor(userRepository, emailService, options = {}) {
    this.userRepository = userRepository;
    this.emailService = emailService;
    this.activationBaseUrl = options.activationBaseUrl || 'https://portal.example.com/activate';
    this.activationTokenTtlMs = options.activationTokenTtlMs || 1000 * 60 * 60 * 24; // 24h default
  }

  async registerExternalUser(payload) {
    const { email, password, firstName, lastName, role } = payload || {};

    // Validazioni base
    if (!email) {
      throw new Error('EMAIL_REQUIRED');
    }
    if (!password) {
      throw new Error('PASSWORD_REQUIRED');
    }
    if (password.length < 8) {
      throw new Error('PASSWORD_TOO_SHORT');
    }
    if (!firstName) {
      throw new Error('FIRST_NAME_REQUIRED');
    }
    if (!lastName) {
      throw new Error('LAST_NAME_REQUIRED');
    }

    if (![EXTERNAL_ROLES.OWNER, EXTERNAL_ROLES.COLLABORATOR].includes(role)) {
      throw new Error('INVALID_ROLE');
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error('EMAIL_ALREADY_USED');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const activationToken = uuidv4();
    const activationTokenExpiration = new Date(Date.now() + this.activationTokenTtlMs);

    const userToCreate = {
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      role,
      status: USER_STATUSES.PENDING,
      activationToken,
      activationTokenExpiration
    };

    const created = await this.userRepository.create(userToCreate);

    await this.emailService.sendActivationEmail({
      email: created.email,
      firstName: created.firstName,
      activationLink: `${this.activationBaseUrl}?token=${encodeURIComponent(activationToken)}`
    });

    return created;
  }
}
