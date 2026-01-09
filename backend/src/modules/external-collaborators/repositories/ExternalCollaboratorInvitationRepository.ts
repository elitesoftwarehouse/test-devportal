import { Pool } from 'pg';

export interface CreateInvitationDTO {
  externalOwnerId: string;
  email: string;
  token: string;
  expiresAt: Date;
  locale: string;
}

export interface ExternalCollaboratorInvitation {
  id: string;
  externalOwnerId: string;
  email: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  locale: string;
}

export class ExternalCollaboratorInvitationRepository {
  private readonly db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  async createInvitation(dto: CreateInvitationDTO): Promise<ExternalCollaboratorInvitation> {
    // Per sicurezza non salviamo il token in chiaro. Usiamo una hash semplice.
    const crypto = await import('crypto');
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');

    const result = await this.db.query(
      `INSERT INTO external_collaborator_invitations
        (external_owner_id, email, token_hash, expires_at, locale)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, external_owner_id as "externalOwnerId", email, token_hash as "tokenHash", expires_at as "expiresAt", created_at as "createdAt", locale`,
      [dto.externalOwnerId, dto.email, tokenHash, dto.expiresAt, dto.locale]
    );

    return result.rows[0];
  }
}
