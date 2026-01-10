import { Pool } from 'pg';
import { db } from '../utils/db';

interface DownloadAuditEntry {
  userId: number;
  resourceId: number;
  cvId: number;
  fileName: string;
  timestamp: Date;
}

class AuditLogger {
  private pool: Pool;

  constructor() {
    this.pool = db.getPool();
  }

  public async logDownload(entry: DownloadAuditEntry): Promise<void> {
    try {
      const query = `
        INSERT INTO audit_log_downloads (user_id, resource_id, cv_id, file_name, downloaded_at)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await this.pool.query(query, [
        entry.userId,
        entry.resourceId,
        entry.cvId,
        entry.fileName,
        entry.timestamp.toISOString()
      ]);
    } catch (err) {
      // Per policy minime possiamo loggare su console senza bloccare il flusso
      // In un sistema reale si userebbe un logger strutturato
      // eslint-disable-next-line no-console
      console.error('Errore in auditLogger.logDownload', err);
    }
  }
}

export const auditLogger = new AuditLogger();
