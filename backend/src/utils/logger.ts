export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, meta?: any): void {
    // Logging essenziale, in reale progetto integrato con logger esistente
    // eslint-disable-next-line no-console
    console.log(`[INFO] [${this.context}] ${message}`, meta || '');
  }

  error(message: string, meta?: any): void {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] [${this.context}] ${message}`, meta || '');
  }
}
