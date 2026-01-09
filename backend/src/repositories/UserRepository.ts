import { Pool } from 'pg';

export interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  role: string;
  companyId: string | null;
  roles?: string[];
}

export class UserRepository {
  constructor(private readonly db: Pool) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const res = await this.db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (res.rowCount === 0) return null;
    return res.rows[0];
  }

  async findById(id: string): Promise<UserRecord | null> {
    const res = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rowCount === 0) return null;
    const row = res.rows[0];
    const roles: string[] = [];
    if (row.role) roles.push(row.role);
    if (row.additional_roles && Array.isArray(row.additional_roles)) {
      roles.push(...row.additional_roles);
    }
    return { ...row, roles };
  }

  async createExternalCollaborator(params: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    companyId: string;
    role: 'EXTERNAL_COLLABORATOR';
  }): Promise<UserRecord> {
    const res = await this.db.query(
      `INSERT INTO users (email, first_name, last_name, password_hash, role, company_id)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [params.email, params.firstName, params.lastName, params.password, params.role, params.companyId],
    );
    return res.rows[0];
  }
}
