const { Sequelize, DataTypes } = require('sequelize');
const defineCompanyCollaborator = require('../src/models/companyCollaborator');

describe('CompanyCollaborator model', () => {
  let sequelize;
  let CompanyCollaborator;

  beforeAll(async () => {
    sequelize = new Sequelize('sqlite::memory:', { logging: false });
    CompanyCollaborator = defineCompanyCollaborator(sequelize, DataTypes);
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('crea una associazione valida', async () => {
    const created = await CompanyCollaborator.create({
      companyId: 1,
      userId: 2,
      role: 'ADMIN',
      status: 'ATTIVO',
    });

    expect(created).toBeDefined();
    expect(created.companyId).toBe(1);
    expect(created.userId).toBe(2);
    expect(created.role).toBe('ADMIN');
    expect(created.status).toBe('ATTIVO');
  });

  it('applica il vincolo di unicità su companyId, userId e role', async () => {
    await CompanyCollaborator.create({
      companyId: 10,
      userId: 20,
      role: 'REFERENTE',
      status: 'ATTIVO',
    });

    await expect(
      CompanyCollaborator.create({
        companyId: 10,
        userId: 20,
        role: 'REFERENTE',
        status: 'ATTIVO',
      })
    ).rejects.toThrow();
  });
});
