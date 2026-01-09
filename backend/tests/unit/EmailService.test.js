import { EmailService } from '../../src/services/EmailService.js';

describe('EmailService', () => {
  let emailProviderMock;
  let service;

  beforeEach(() => {
    emailProviderMock = {
      send: jest.fn().mockResolvedValue(true)
    };
    service = new EmailService(emailProviderMock, { fromAddress: 'no-reply@test.local' });
  });

  it('invoca il provider con i parametri corretti', async () => {
    const params = {
      email: 'user@example.com',
      firstName: 'Mario',
      activationLink: 'https://portal.test/activate?token=abc'
    };

    await service.sendActivationEmail(params);

    expect(emailProviderMock.send).toHaveBeenCalledTimes(1);
    const msg = emailProviderMock.send.mock.calls[0][0];
    expect(msg.from).toBe('no-reply@test.local');
    expect(msg.to).toBe(params.email);
    expect(msg.subject).toContain('Attiva il tuo account');
    expect(msg.body).toContain(params.activationLink);
  });

  it('lancia errore se parametri non validi', async () => {
    await expect(service.sendActivationEmail({})).rejects.toThrow('INVALID_EMAIL_PARAMS');
  });
});
