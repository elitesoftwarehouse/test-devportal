import { Pool } from 'pg';
import { db } from '../utils/db';

export interface ResourceCv {
  id: number;
  resourceId: number;
  storageReference: string;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
}

// Recupera un CV verificando che sia associato alla risorsa indicata
export async function getResourceCvById(resourceId: number, cvId: number): Promise<ResourceCv | null> {
  const pool: Pool = db.getPool();
  const query = `
    SELECT id, resource_id AS "resourceId", storage_reference AS "storageReference",
           file_name AS "fileName", mime_type AS "mimeType", file_size AS "fileSize"
    FROM resource_cvs
    WHERE id = $1 AND resource_id = $2 AND deleted_at IS NULL
  `;

  const result = await pool.query<ResourceCv>(query, [cvId, resourceId]);
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0];
}
