import { ExternalUserRegistrationService, EXTERNAL_ROLES, USER_STATUSES } from '../../src/services/ExternalUserRegistrationService.js';
import { EmailService } from '../../src/services/EmailService.js';

jest.mock('../../src/services/EmailService.js');

describe('ExternalUserRegistrationService', () => {
  let userRepositoryMock;
  let emailServiceMock;
  let service;

  beforeEach(() => {
    userRepositoryMock = {
      findByEmail: jest.fn(),
      create: jest.fn()
    };
    emailServiceMock = new EmailService();
    emailServiceMock.sendActivationEmail = jest.fn();

    service = new ExternalUserRegistrationService(userRepositoryMock, emailServiceMock, {
      activationBaseUrl: 'https://portal.test/activate',
      activationTokenTtlMs: 1000 * 60 * 60
    });
  });

  it('crea un utente con ruolo EXTERNAL_OWNER', async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);
    userRepositoryMock.create.mockImplementation(async (u) => ({ id: 1, ...u }));

    const payload = {
      email: 'owner@example.com',
      password: 'Password123',
      firstName: 'Mario',
      lastName: 'Rossi',
      role: EXTERNAL_ROLES.OWNER
    };

    const result = await service.registerExternalUser(payload);

    expect(result.role).toBe(EXTERNAL_ROLES.OWNER);
    expect(result.status).toBe(USER_STATUSES.PENDING);
    expect(result.activationToken).toBeDefined();
    expect(result.activationTokenExpiration).toBeInstanceOf(Date);

    expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
    expect(emailServiceMock.sendActivationEmail).toHaveBeenCalledTimes(1);
    const emailArgs = emailServiceMock.sendActivationEmail.mock.calls[0][0];
    expect(emailArgs.email).toBe(payload.email);
    expect(emailArgs.activationLink).toMatch(/^https:\/\/portal\.test\/activate\?token=/);
  });

  it('crea un utente con ruolo EXTERNAL_COLLABORATOR', async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);
    userRepositoryMock.create.mockImplementation(async (u) => ({ id: 2, ...u }));

    const payload = {
      email: 'collab@example.com',
      password: 'Password123',
      firstName: 'Luca',
      lastName: 'Bianchi',
      role: EXTERNAL_ROLES.COLLABORATOR
    };

    const result = await service.registerExternalUser(payload);

    expect(result.role).toBe(EXTERNAL_ROLES.COLLABORATOR);
  });

  it('rifiuta email duplicata', async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({ id: 1, email: 'dup@example.com' });

    const payload = {
      email: 'dup@example.com',
      password: 'Password123',
      firstName: 'Mario',
      lastName: 'Rossi',
      role: EXTERNAL_ROLES.OWNER
    };

    await expect(service.registerExternalUser(payload)).rejects.toThrow('EMAIL_ALREADY_USED');
  });

  it('rifiuta password troppo corta', async () => {
    const payload = {
      email: 'short@example.com',
      password: 'short',
      firstName: 'Mario',
      lastName: 'Rossi',
      role: EXTERNAL_ROLES.OWNER
    };

    await expect(service.registerExternalUser(payload)).rejects.toThrow('PASSWORD_TOO_SHORT');
  });

  it('rifiuta ruolo non valido', async () => {
    const payload = {
      email: 'invalid-role@example.com',
      password: 'Password123',
      firstName: 'Mario',
      lastName: 'Rossi',
      role: 'INVALID_ROLE'
    };

    await expect(service.registerExternalUser(payload)).rejects.toThrow('INVALID_ROLE');
  });

  it('rifiuta campi mancanti', async () => {
    await expect(service.registerExternalUser({})).rejects.toThrow('EMAIL_REQUIRED');

    await expect(
      service.registerExternalUser({ email: 'a@b.c', password: 'Password123', lastName: 'Rossi', role: EXTERNAL_ROLES.OWNER })
    ).rejects.toThrow('FIRST_NAME_REQUIRED');

    await expect(
      service.registerExternalUser({ email: 'a@b.c', password: 'Password123', firstName: 'Mario', role: EXTERNAL_ROLES.OWNER })
    ).rejects.toThrow('LAST_NAME_REQUIRED');
  });

  it('genera e persiste correttamente activationToken e scadenza', async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);
    userRepositoryMock.create.mockImplementation(async (u) => ({ id: 3, ...u }));

    const payload = {
      email: 'token@example.com',
      password: 'Password123',
      firstName: 'Mario',
      lastName: 'Rossi',
      role: EXTERNAL_ROLES.OWNER
    };

    const before = Date.now();
    const result = await service.registerExternalUser(payload);
    const after = Date.now();

    expect(result.activationToken).toBeDefined();
    const expTime = new Date(result.activationTokenExpiration).getTime();
    expect(expTime).toBeGreaterThanOrEqual(before + 1000 * 60 * 60 - 1000); // tolleranza 1s
    expect(expTime).toBeLessThanOrEqual(after + 1000 * 60 * 60 + 1000);
  });
});
