import { EmailProvider } from '../providers/EmailProvider.js';

export class EmailService {
  /**
   * @param {EmailProvider} emailProvider
   * @param {{fromAddress?: string}} options
   */
  constructor(emailProvider, options = {}) {
    this.emailProvider = emailProvider;
    this.fromAddress = options.fromAddress || 'no-reply@elite-portal.local';
  }

  async sendActivationEmail({ email, firstName, activationLink }) {
    if (!email || !activationLink) {
      throw new Error('INVALID_EMAIL_PARAMS');
    }

    const subject = 'Attiva il tuo account Elite Portal';
    const body = `Ciao ${firstName || ''}\n\n` +
      'Per completare la registrazione e attivare il tuo account, clicca sul seguente link:\n' +
      `${activationLink}\n\n` +
      'Se non hai richiesto questa registrazione, ignora questa email.';

    await this.emailProvider.send({
      from: this.fromAddress,
      to: email,
      subject,
      body
    });
  }
}
