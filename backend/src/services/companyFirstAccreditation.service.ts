import { PrismaClient, StatoAccreditamento } from '@prisma/client';
import { logger } from '../infrastructure/logger';

const prisma = new PrismaClient();

export interface SedeLegaleInput {
  indirizzo: string;
  cap: string;
  citta: string;
  provincia: string;
}

interface CreateDraftWithOwnerInput {
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale?: string;
  sedeLegale: SedeLegaleInput;
  email: string;
  telefono?: string;
  currentUserId: number;
}

interface CompleteAndConfirmInput extends CreateDraftWithOwnerInput {
  companyId: number;
}

export class CompanyFirstAccreditationService {
  async createDraftWithOwner(input: CreateDraftWithOwnerInput) {
    // Controllo unicità P.IVA / CF per aziende già accreditate o in stato non bozza
    const existing = await prisma.company.findFirst({
      where: {
        OR: [
          { partitaIva: input.partitaIva },
          input.codiceFiscale ? { codiceFiscale: input.codiceFiscale } : undefined
        ].filter(Boolean) as any[],
        NOT: { statoAccreditamento: 'DRAFT' as StatoAccreditamento }
      }
    });

    if (existing) {
      logger.warn('Attempt to create company draft with existing VAT/CF', {
        partitaIva: input.partitaIva,
        codiceFiscale: input.codiceFiscale,
        existingCompanyId: existing.id
      });
      const error: any = new Error('Esiste già un\'azienda accreditata con la stessa partita IVA / codice fiscale.');
      error.code = 'COMPANY_VAT_CONFLICT';
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          ragioneSociale: input.ragioneSociale,
          partitaIva: input.partitaIva,
          codiceFiscale: input.codiceFiscale || null,
          sedeLegaleIndirizzo: input.sedeLegale.indirizzo,
          sedeLegaleCap: input.sedeLegale.cap,
          sedeLegaleCitta: input.sedeLegale.citta,
          sedeLegaleProvincia: input.sedeLegale.provincia,
          email: input.email,
          telefono: input.telefono || null,
          statoAccreditamento: 'DRAFT',
          ownerUserId: input.currentUserId
        }
      });

      // Relazione owner-azienda (se gestita su tabella dedicata)
      await tx.companyOwner.upsert({
        where: {
          companyId_userId: {
            companyId: company.id,
            userId: input.currentUserId
          }
        },
        update: {
          isLegalRepresentative: true
        },
        create: {
          companyId: company.id,
          userId: input.currentUserId,
          isLegalRepresentative: true
        }
      });

      return company;
    });

    return result;
  }

  async completeAndConfirmFirstAccreditation(input: CompleteAndConfirmInput) {
    // Verifica che l'utente sia owner dell'azienda
    const company = await prisma.company.findUnique({
      where: { id: input.companyId },
      include: { owners: true }
    });

    if (!company) {
      const error: any = new Error('Azienda non trovata.');
      error.code = 'COMPANY_NOT_FOUND';
      throw error;
    }

    const isOwner = company.ownerUserId === input.currentUserId || company.owners.some((o: any) => o.userId === input.currentUserId);
    if (!isOwner) {
      logger.warn('Forbidden access on completeAndConfirmFirstAccreditation', {
        companyId: input.companyId,
        userId: input.currentUserId
      });
      const error: any = new Error('Non hai i permessi per modificare questa azienda.');
      error.code = 'COMPANY_FORBIDDEN';
      throw error;
    }

    // Verifica unicità P.IVA / CF rispetto ad altre aziende
    const conflict = await prisma.company.findFirst({
      where: {
        id: { not: input.companyId },
        OR: [
          { partitaIva: input.partitaIva },
          input.codiceFiscale ? { codiceFiscale: input.codiceFiscale } : undefined
        ].filter(Boolean) as any[],
        NOT: { statoAccreditamento: 'DRAFT' as StatoAccreditamento }
      }
    });

    if (conflict) {
      logger.warn('VAT/CF conflict on completeAndConfirmFirstAccreditation', {
        companyId: input.companyId,
        conflictCompanyId: conflict.id,
        partitaIva: input.partitaIva,
        codiceFiscale: input.codiceFiscale
      });
      const error: any = new Error('Esiste già un\'azienda accreditata con la stessa partita IVA / codice fiscale.');
      error.code = 'COMPANY_VAT_CONFLICT';
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.company.update({
        where: { id: input.companyId },
        data: {
          ragioneSociale: input.ragioneSociale,
          partitaIva: input.partitaIva,
          codiceFiscale: input.codiceFiscale || null,
          sedeLegaleIndirizzo: input.sedeLegale.indirizzo,
          sedeLegaleCap: input.sedeLegale.cap,
          sedeLegaleCitta: input.sedeLegale.citta,
          sedeLegaleProvincia: input.sedeLegale.provincia,
          email: input.email,
          telefono: input.telefono || null,
          statoAccreditamento: 'ACTIVE' // per ora attivo diretto; futura revisione possibile
        }
      });

      await tx.companyOwner.upsert({
        where: {
          companyId_userId: {
            companyId: updated.id,
            userId: input.currentUserId
          }
        },
        update: {
          isLegalRepresentative: true
        },
        create: {
          companyId: updated.id,
          userId: input.currentUserId,
          isLegalRepresentative: true
        }
      });

      return updated;
    });

    return result;
  }

  async getCompanyForOwner(companyId: number, userId: number) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { owners: true }
    });

    if (!company) {
      return null;
    }

    const isOwner = company.ownerUserId === userId || company.owners.some((o: any) => o.userId === userId);
    if (!isOwner) {
      const error: any = new Error('Non hai i permessi per visualizzare questa azienda.');
      error.code = 'COMPANY_FORBIDDEN';
      throw error;
    }

    return {
      id: company.id,
      ragioneSociale: company.ragioneSociale,
      partitaIva: company.partitaIva,
      codiceFiscale: company.codiceFiscale,
      sedeLegale: {
        indirizzo: company.sedeLegaleIndirizzo,
        cap: company.sedeLegaleCap,
        citta: company.sedeLegaleCitta,
        provincia: company.sedeLegaleProvincia
      },
      email: company.email,
      telefono: company.telefono,
      statoAccreditamento: company.statoAccreditamento
    };
  }
}
