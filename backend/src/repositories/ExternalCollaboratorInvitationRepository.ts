import { ExternalCollaboratorInvitation } from '../domain/externalCollaboration/ExternalCollaboratorInvitation';
import { Pool } from 'pg';

export class ExternalCollaboratorInvitationRepository {
  constructor(private readonly db: Pool) {}

  async save(invitation: ExternalCollaboratorInvitation): Promise<void> {
    const data = invitation.toPrimitives();

    await this.db.query(
      `INSERT INTO external_collaborator_invitations
        (id, email, token, expires_at, status, external_owner_company_id, created_at, accepted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         token = EXCLUDED.token,
         expires_at = EXCLUDED.expires_at,
         status = EXCLUDED.status,
         external_owner_company_id = EXCLUDED.external_owner_company_id,
         created_at = EXCLUDED.created_at,
         accepted_at = EXCLUDED.accepted_at`,
      [
        data.id,
        data.email,
        data.token,
        data.expiresAt,
        data.status,
        data.externalOwnerCompanyId,
        data.createdAt,
        data.acceptedAt,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.query('DELETE FROM external_collaborator_invitations WHERE id = $1', [id]);
  }

  async findPendingByEmail(email: string): Promise<ExternalCollaboratorInvitation | null> {
    const res = await this.db.query(
      'SELECT * FROM external_collaborator_invitations WHERE email = $1 AND status = $2',
      [email.toLowerCase(), 'PENDING'],
    );
    if (res.rowCount === 0) return null;
    const row = res.rows[0];
    return ExternalCollaboratorInvitation.rehydrate({
      id: row.id,
      email: row.email,
      token: row.token,
      expiresAt: row.expires_at,
      status: row.status,
      externalOwnerCompanyId: row.external_owner_company_id,
      createdAt: row.created_at,
      acceptedAt: row.accepted_at,
    });
  }

  async findByToken(token: string): Promise<ExternalCollaboratorInvitation | null> {
    const res = await this.db.query('SELECT * FROM external_collaborator_invitations WHERE token = $1', [token]);
    if (res.rowCount === 0) return null;
    const row = res.rows[0];
    return ExternalCollaboratorInvitation.rehydrate({
      id: row.id,
      email: row.email,
      token: row.token,
      expiresAt: row.expires_at,
      status: row.status,
      externalOwnerCompanyId: row.external_owner_company_id,
      createdAt: row.created_at,
      acceptedAt: row.accepted_at,
    });
  }
}
