export class EmailProvider {
  /**
   * Metodo generico di invio email. Nell'implementazione reale userà SMTP o un servizio esterno.
   * Qui viene lasciato minimale per essere facilmente mockato nei test.
   * @param {{from: string, to: string, subject: string, body: string}} message
   */
  async send(message) {
    // Implementazione reale delegata a provider specifico (Mailgun, SES, ecc.)
    // Qui solo placeholder.
    if (!message || !message.to) {
      throw new Error('INVALID_MESSAGE');
    }
    return true;
  }
}
