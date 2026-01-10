const db = require('../utils/db');
const { createReadStream } = require('fs');
const path = require('path');

async function getResourceDetail(id) {
  // Dati anagrafici/sintetici risorsa
  const resourceRow = await db.oneOrNone(
    `SELECT r.id,
            r.first_name,
            r.last_name,
            r.role,
            r.seniority,
            c.name AS company,
            r.status
     FROM resources r
     LEFT JOIN companies c ON c.id = r.company_id
     WHERE r.id = $1`,
    [id]
  );

  if (!resourceRow) {
    return null;
  }

  // Profilo competenze
  const skills = await db.any(
    `SELECT s.id,
            s.name,
            rs.level,
            rs.years_experience,
            s.category,
            ARRAY_REMOVE(ARRAY_AGG(DISTINCT st.name), NULL) AS tags
     FROM resource_skills rs
     JOIN skills s ON s.id = rs.skill_id
     LEFT JOIN resource_skill_tags rst ON rst.resource_skill_id = rs.id
     LEFT JOIN skill_tags st ON st.id = rst.tag_id
     WHERE rs.resource_id = $1
     GROUP BY s.id, s.name, rs.level, rs.years_experience, s.category
     ORDER BY s.category NULLS LAST, s.name ASC`,
    [id]
  );

  // Elenco CV
  const cvs = await db.any(
    `SELECT rc.id,
            rc.title,
            rc.file_name,
            rc.language,
            rc.updated_at,
            rc.format,
            rc.is_primary
     FROM resource_cvs rc
     WHERE rc.resource_id = $1
     ORDER BY rc.is_primary DESC, rc.updated_at DESC`,
    [id]
  );

  return {
    id: resourceRow.id,
    fullName: `${resourceRow.first_name} ${resourceRow.last_name}`.trim(),
    role: resourceRow.role,
    seniority: resourceRow.seniority,
    company: resourceRow.company,
    status: resourceRow.status,
    skills: skills.map((s) => ({
      id: s.id,
      name: s.name,
      level: s.level,
      yearsExperience: s.years_experience,
      category: s.category,
      tags: s.tags || []
    })),
    cvs: cvs.map((cv) => ({
      id: cv.id,
      title: cv.title,
      fileName: cv.file_name,
      language: cv.language,
      updatedAt: cv.updated_at,
      format: cv.format,
      isPrimary: cv.is_primary
    }))
  };
}

async function getResourceCvFile(resourceId, cvId) {
  const row = await db.oneOrNone(
    `SELECT id,
            resource_id,
            file_name,
            file_path,
            mime_type
     FROM resource_cvs
     WHERE id = $1 AND resource_id = $2`,
    [cvId, resourceId]
  );

  if (!row) {
    return null;
  }

  const absolutePath = path.resolve(row.file_path);
  const stream = createReadStream(absolutePath);

  return {
    stream,
    fileName: row.file_name,
    mimeType: row.mime_type
  };
}

module.exports = {
  getResourceDetail,
  getResourceCvFile
};
