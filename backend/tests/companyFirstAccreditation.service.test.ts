import { CompanyFirstAccreditationService } from '../src/services/companyFirstAccreditation.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('CompanyFirstAccreditationService', () => {
  const service = new CompanyFirstAccreditationService();
  let userId = 1;

  beforeAll(async () => {
    await prisma.companyOwner.deleteMany();
    await prisma.company.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create company draft with owner', async () => {
    const company = await service.createDraftWithOwner({
      ragioneSociale: 'Test Spa',
      partitaIva: 'IT12345678901',
      codiceFiscale: 'CF12345678901',
      sedeLegale: {
        indirizzo: 'Via Roma 1',
        cap: '00100',
        citta: 'Roma',
        provincia: 'RM'
      },
      email: 'info@testspa.it',
      telefono: '0612345678',
      currentUserId: userId
    });

    expect(company).toBeDefined();
    expect(company.statoAccreditamento).toBe('DRAFT');
    expect(company.ownerUserId).toBe(userId);
  });

  it('should not create another company with same VAT in non-draft state', async () => {
    // Create ACTIVE company to generate conflict
    const active = await prisma.company.create({
      data: {
        ragioneSociale: 'Active Spa',
        partitaIva: 'IT99999999999',
        codiceFiscale: 'CF99999999999',
        sedeLegaleIndirizzo: 'Via Milano 1',
        sedeLegaleCap: '20100',
        sedeLegaleCitta: 'Milano',
        sedeLegaleProvincia: 'MI',
        email: 'info@active.it',
        telefono: '0212345678',
        statoAccreditamento: 'ACTIVE',
        ownerUserId: userId
      }
    });

    expect(active).toBeDefined();

    await expect(
      service.createDraftWithOwner({
        ragioneSociale: 'Another Spa',
        partitaIva: 'IT99999999999',
        codiceFiscale: 'CF99999999999',
        sedeLegale: {
          indirizzo: 'Via Torino 2',
          cap: '10100',
          citta: 'Torino',
          provincia: 'TO'
        },
        email: 'info@another.it',
        telefono: '0112345678',
        currentUserId: userId
      })
    ).rejects.toHaveProperty('code', 'COMPANY_VAT_CONFLICT');
  });
});
