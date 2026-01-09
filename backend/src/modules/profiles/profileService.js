/*
 * Service di consultazione unificata dei profili.
 *
 * In questa implementazione viene usato un modello semplificato con Sequelize-like
 * per permettere i test di integrazione su N+1 e performance di base.
 */

import { Op } from 'sequelize';
import { ProfessionalProfile } from '../../models/ProfessionalProfile.js';
import { Company } from '../../models/Company.js';
import { CollaboratorProfile } from '../../models/CollaboratorProfile.js';

/**
 * Recupera i profili unificati dal database, senza applicare permessi o completezza.
 *
 * @param {{ type?: string|null, limit?: number, offset?: number }} options
 * @returns {Promise<{ profiles: any[], total: number }>}
 */
export async function getUnifiedProfiles(options = {}) {
  const { type, limit = 50, offset = 0 } = options;

  const typesToFetch = type ? [type] : ['PROFESSIONISTA', 'AZIENDA', 'COLLABORATORE'];

  const queries = [];

  if (typesToFetch.includes('PROFESSIONISTA')) {
    queries.push(
      ProfessionalProfile.findAndCountAll({
        limit,
        offset,
        include: [
          {
            model: Company,
            as: 'company',
            required: false
          }
        ]
      }).then((res) => ({
        type: 'PROFESSIONISTA',
        rows: res.rows.map((row) => ({
          id: row.id,
          type: 'PROFESSIONISTA',
          userId: row.userId,
          companyId: row.companyId,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          role: row.role,
          skills: row.skills || [],
          phone: row.phone,
          address: row.address,
          linkedinUrl: row.linkedinUrl,
          taxCode: row.taxCode,
          salary: row.salary,
          internalNotes: row.internalNotes
        })),
        count: res.count
      }))
    );
  }

  if (typesToFetch.includes('AZIENDA')) {
    queries.push(
      Company.findAndCountAll({
        limit,
        offset
      }).then((res) => ({
        type: 'AZIENDA',
        rows: res.rows.map((row) => ({
          id: row.id,
          type: 'AZIENDA',
          name: row.name,
          vatNumber: row.vatNumber,
          legalAddress: row.legalAddress,
          website: row.website,
          industry: row.industry,
          internalNotes: row.internalNotes
        })),
        count: res.count
      }))
    );
  }

  if (typesToFetch.includes('COLLABORATORE')) {
    queries.push(
      CollaboratorProfile.findAndCountAll({
        limit,
        offset,
        include: [
          {
            model: Company,
            as: 'company',
            required: false
          }
        ]
      }).then((res) => ({
        type: 'COLLABORATORE',
        rows: res.rows.map((row) => ({
          id: row.id,
          type: 'COLLABORATORE',
          userId: row.userId,
          companyId: row.companyId,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          phone: row.phone,
          taxCode: row.taxCode,
          internalNotes: row.internalNotes
        })),
        count: res.count
      }))
    );
  }

  const results = await Promise.all(queries);

  const profiles = [];
  let total = 0;

  for (const block of results) {
    profiles.push(...block.rows);
    total += block.count;
  }

  return { profiles, total };
}
