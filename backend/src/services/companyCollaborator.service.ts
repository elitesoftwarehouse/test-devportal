import { Pool } from 'pg';
import { db } from '../db';

export interface CompanyCollaboratorListItem {
  associationId: number;
  collaboratorId: number;
  companyId: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface AddToCompanyInput {
  companyId: number;
  collaboratorId?: number;
  createNew: boolean;
  name?: string;
  email?: string;
  phone?: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface UpdateAssociationInput {
  companyId: number;
  associationId: number;
  role?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  email?: string;
  phone?: string;
}

interface UpdateStatusInput {
  companyId: number;
  associationId: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export class CompanyCollaboratorService {
  private pool: Pool;

  constructor() {
    this.pool = db;
  }

  async listByCompanyId(companyId: number): Promise<CompanyCollaboratorListItem[]> {
    const query = `
      SELECT
        cca.id AS "associationId",
        c.id AS "collaboratorId",
        cca.company_id AS "companyId",
        c.name AS "name",
        c.email AS "email",
        c.phone AS "phone",
        cca.role AS "role",
        cca.status AS "status"
      FROM company_collaborators cca
      JOIN collaborators c ON c.id = cca.collaborator_id
      WHERE cca.company_id = $1
      ORDER BY c.name ASC
    `;

    const result = await this.pool.query(query, [companyId]);
    return result.rows as CompanyCollaboratorListItem[];
  }

  async addToCompany(input: AddToCompanyInput): Promise<CompanyCollaboratorListItem> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      let collaboratorId = input.collaboratorId || null;

      if (input.createNew) {
        if (!input.name) {
          throw Object.assign(new Error('Nome obbligatorio per creare un nuovo collaboratore'), { code: 'VALIDATION_ERROR' });
        }

        const insertCollaboratorQuery = `
          INSERT INTO collaborators (name, email, phone)
          VALUES ($1, $2, $3)
          RETURNING id
        `;
        const collaboratorResult = await client.query(insertCollaboratorQuery, [
          input.name,
          input.email || null,
          input.phone || null
        ]);
        collaboratorId = collaboratorResult.rows[0].id;
      } else {
        if (!collaboratorId) {
          throw Object.assign(new Error('ID collaboratore mancante'), { code: 'VALIDATION_ERROR' });
        }

        const existsResult = await client.query('SELECT id FROM collaborators WHERE id = $1', [collaboratorId]);
        if (existsResult.rowCount === 0) {
          throw Object.assign(new Error('Collaboratore non trovato'), { code: 'NOT_FOUND' });
        }
      }

      const insertAssociationQuery = `
        INSERT INTO company_collaborators (company_id, collaborator_id, role, status)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;

      const associationResult = await client.query(insertAssociationQuery, [
        input.companyId,
        collaboratorId,
        input.role,
        input.status
      ]);

      const associationId = associationResult.rows[0].id;

      const full = await this.getAssociationById(client, input.companyId, associationId);

      await client.query('COMMIT');
      return full;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateAssociation(input: UpdateAssociationInput): Promise<CompanyCollaboratorListItem> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const associationExists = await client.query(
        'SELECT id, collaborator_id FROM company_collaborators WHERE id = $1 AND company_id = $2',
        [input.associationId, input.companyId]
      );

      if (associationExists.rowCount === 0) {
        throw Object.assign(new Error('Associazione collaboratore-azienda non trovata'), { code: 'NOT_FOUND' });
      }

      const collaboratorId = associationExists.rows[0].collaborator_id as number;

      if (input.role || input.status) {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (input.role) {
          fields.push(`role = $${idx++}`);
          values.push(input.role);
        }

        if (input.status) {
          fields.push(`status = $${idx++}`);
          values.push(input.status);
        }

        if (fields.length > 0) {
          values.push(input.associationId, input.companyId);

          const updateAssociationQuery = `
            UPDATE company_collaborators
            SET ${fields.join(', ')}
            WHERE id = $${idx++} AND company_id = $${idx}
          `;

          await client.query(updateAssociationQuery, values);
        }
      }

      if (input.email !== undefined || input.phone !== undefined) {
        const cFields: string[] = [];
        const cValues: any[] = [];
        let cIdx = 1;

        if (input.email !== undefined) {
          cFields.push(`email = $${cIdx++}`);
          cValues.push(input.email);
        }

        if (input.phone !== undefined) {
          cFields.push(`phone = $${cIdx++}`);
          cValues.push(input.phone);
        }

        if (cFields.length > 0) {
          cValues.push(collaboratorId);
          const updateCollaboratorQuery = `
            UPDATE collaborators
            SET ${cFields.join(', ')}
            WHERE id = $${cIdx}
          `;
          await client.query(updateCollaboratorQuery, cValues);
        }
      }

      const full = await this.getAssociationById(client, input.companyId, input.associationId);
      await client.query('COMMIT');
      return full;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateStatus(input: UpdateStatusInput): Promise<CompanyCollaboratorListItem> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'UPDATE company_collaborators SET status = $1 WHERE id = $2 AND company_id = $3 RETURNING id',
        [input.status, input.associationId, input.companyId]
      );

      if (result.rowCount === 0) {
        throw Object.assign(new Error('Associazione collaboratore-azienda non trovata'), { code: 'NOT_FOUND' });
      }

      const full = await this.getAssociationById(client, input.companyId, input.associationId);
      return full;
    } finally {
      client.release();
    }
  }

  private async getAssociationById(client: Pool | any, companyId: number, associationId: number): Promise<CompanyCollaboratorListItem> {
    const query = `
      SELECT
        cca.id AS "associationId",
        c.id AS "collaboratorId",
        cca.company_id AS "companyId",
        c.name AS "name",
        c.email AS "email",
        c.phone AS "phone",
        cca.role AS "role",
        cca.status AS "status"
      FROM company_collaborators cca
      JOIN collaborators c ON c.id = cca.collaborator_id
      WHERE cca.company_id = $1 AND cca.id = $2
    `;

    const result = await client.query(query, [companyId, associationId]);
    if (result.rowCount === 0) {
      throw Object.assign(new Error('Associazione collaboratore-azienda non trovata'), { code: 'NOT_FOUND' });
    }

    return result.rows[0] as CompanyCollaboratorListItem;
  }
}
