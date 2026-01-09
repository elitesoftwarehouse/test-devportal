import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/pool';

export type ExternalInviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface CreateInviteParams {
  ownerUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  message: string | null;
  companyId: string | null;
}

export interface ListInvitesParams {
  ownerUserId: string;
  companyId: string | null;
}

export interface ExternalInviteDTO {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: ExternalInviteStatus;
  sentAt: string;
  expiresAt: string | null;
  companyId: string | null;
}

export class ExternalInviteService {
  private defaultExpiryDays = 14;

  async createInvite(params: CreateInviteParams): Promise<ExternalInviteDTO> {
    const client = await pool.connect();
    try {
      const { ownerUserId, email, firstName, lastName, message, companyId } = params;

      // Controllo di ownership azienda se companyId valorizzato
      if (companyId) {
        const companyCheck = await client.query(
          'SELECT id FROM companies WHERE id = $1 AND owner_user_id = $2',
          [companyId, ownerUserId]
        );
        if (companyCheck.rowCount === 0) {
          const error: any = new Error('Forbidden company');
          error.code = 'FORBIDDEN_COMPANY';
          throw error;
        }
      }

      // Controllo se esiste già un invito pendente per stessa email e company
      const existing = await client.query(
        'SELECT id FROM external_invites WHERE email = $1 AND owner_user_id = $2 AND (company_id = $3 OR ($3 IS NULL AND company_id IS NULL)) AND status = \'PENDING\'',
        [email.toLowerCase(), ownerUserId, companyId]
      );

      if (existing.rowCount > 0) {
        const error: any = new Error('Invite already exists');
        error.code = 'INVITE_ALREADY_EXISTS';
        throw error;
      }

      const id = uuidv4();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.defaultExpiryDays * 24 * 60 * 60 * 1000);

      const insertQuery = `
        INSERT INTO external_invites (
          id,
          owner_user_id,
          email,
          first_name,
          last_name,
          message,
          status,
          sent_at,
          expires_at,
          company_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING id, email, first_name, last_name, status, sent_at, expires_at, company_id
      `;

      const result = await client.query(insertQuery, [
        id,
        ownerUserId,
        email.toLowerCase(),
        firstName,
        lastName,
        message,
        'PENDING',
        now,
        expiresAt,
        companyId
      ]);

      const row = result.rows[0];

      const dto: ExternalInviteDTO = {
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        status: row.status,
        sentAt: row.sent_at.toISOString(),
        expiresAt: row.expires_at ? row.expires_at.toISOString() : null,
        companyId: row.company_id
      };

      // TODO: integrazione con sistema email per invio effettivo invito

      return dto;
    } finally {
      client.release();
    }
  }

  async listInvites(params: ListInvitesParams): Promise<ExternalInviteDTO[]> {
    const client = await pool.connect();
    try {
      const { ownerUserId, companyId } = params;

      let query = `
        SELECT id, email, first_name, last_name, status, sent_at, expires_at, company_id
        FROM external_invites
        WHERE owner_user_id = $1
      `;
      const values: any[] = [ownerUserId];

      if (companyId) {
        query += ' AND company_id = $2';
        values.push(companyId);
      }

      query += ' ORDER BY sent_at DESC LIMIT 200';

      const result = await client.query(query, values);

      return result.rows.map((row: any) => ({
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        status: row.status,
        sentAt: row.sent_at.toISOString(),
        expiresAt: row.expires_at ? row.expires_at.toISOString() : null,
        companyId: row.company_id
      }));
    } finally {
      client.release();
    }
  }
}
