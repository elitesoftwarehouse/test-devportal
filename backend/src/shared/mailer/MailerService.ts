export interface MailerService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendInvitationEmail(to: string, token: string, companyId: number): Promise<void>;
}

export const createMailerService = (): MailerService => ({
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(`[MAILER] Sending email to ${to}: ${subject}`);
    // Mock implementation - in production use nodemailer or similar
  },
  async sendInvitationEmail(to: string, token: string, companyId: number): Promise<void> {
    console.log(`[MAILER] Sending invitation to ${to} for company ${companyId}`);
  }
});

export default createMailerService;


