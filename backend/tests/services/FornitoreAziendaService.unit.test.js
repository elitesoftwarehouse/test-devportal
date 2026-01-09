const {
  FornitoreAziendaService,
  NotFoundError,
  UniqueConstraintError,
  BusinessValidationError
} = require('../../src/services/FornitoreAziendaService');

class FakeRepository {
  constructor() {
    this.items = [];
    this.idSeq = 1;
  }

  async create(data) {
    const entity = { id: this.idSeq++, ...data };
    this.items.push(entity);
    return entity;
  }

  async findById(id) {
    return this.items.find((x) => x.id === Number(id)) || null;
  }

  async findByPartitaIva(partitaIva) {
    return this.items.find((x) => x.partitaIva === partitaIva) || null;
  }

  async update(id, data) {
    const idx = this.items.findIndex((x) => x.id === Number(id));
    if (idx === -1) return null;
    this.items[idx] = { ...this.items[idx], ...data };
    return this.items[idx];
  }

  async delete(id) {
    const idx = this.items.findIndex((x) => x.id === Number(id));
    if (idx === -1) return 0;
    this.items.splice(idx, 1);
    return 1;
  }

  async list(filter = {}) {
    let res = [...this.items];
    if (typeof filter.attivo === 'boolean') {
      res = res.filter((x) => x.attivo === filter.attivo);
    }
    return res;
  }
}

describe('FornitoreAziendaService - unit', () => {
  let repo;
  let service;

  beforeEach(() => {
    repo = new FakeRepository();
    service = new FornitoreAziendaService(repo);
  });

  test('crea azienda fornitrice con dati validi', async () => {
    const entity = await service.create({
      ragioneSociale: 'Fornitore Uno',
      partitaIva: '12345678901',
      email: 'info@example.com'
    });

    expect(entity.id).toBeDefined();
    expect(entity.ragioneSociale).toBe('Fornitore Uno');
    expect(entity.partitaIva).toBe('12345678901');
    expect(entity.attivo).toBe(true);
  });

  test('lancia BusinessValidationError per campi mancanti', async () => {
    await expect(
      service.create({
        ragioneSociale: '',
        partitaIva: ''
      })
    ).rejects.toBeInstanceOf(BusinessValidationError);
  });

  test('lancia BusinessValidationError per email non valida', async () => {
    await expect(
      service.create({
        ragioneSociale: 'Test',
        partitaIva: '12345678901',
        email: 'non-valida'
      })
    ).rejects.toBeInstanceOf(BusinessValidationError);
  });

  test('lancia UniqueConstraintError se partita IVA esiste già', async () => {
    await service.create({
      ragioneSociale: 'Fornitore Uno',
      partitaIva: '12345678901'
    });

    await expect(
      service.create({
        ragioneSociale: 'Altro',
        partitaIva: '12345678901'
      })
    ).rejects.toBeInstanceOf(UniqueConstraintError);
  });

  test('aggiorna profilo esistente', async () => {
    const created = await service.create({
      ragioneSociale: 'Old',
      partitaIva: '12345678901'
    });

    const updated = await service.update(created.id, { ragioneSociale: 'New' });

    expect(updated.ragioneSociale).toBe('New');
  });

  test('update lancia NotFoundError se elemento non esiste', async () => {
    await expect(service.update(999, { ragioneSociale: 'x' })).rejects.toBeInstanceOf(NotFoundError);
  });

  test('update con cambio PIVA verso una già esistente lancia UniqueConstraintError', async () => {
    const a = await service.create({ ragioneSociale: 'A', partitaIva: '11111111111' });
    await service.create({ ragioneSociale: 'B', partitaIva: '22222222222' });

    await expect(service.update(a.id, { partitaIva: '22222222222' })).rejects.toBeInstanceOf(
      UniqueConstraintError
    );
  });

  test('setStato aggiorna campo attivo', async () => {
    const created = await service.create({ ragioneSociale: 'A', partitaIva: '11111111111' });

    const updated = await service.setStato(created.id, false);

    expect(updated.attivo).toBe(false);
  });

  test('setStato su id inesistente lancia NotFoundError', async () => {
    await expect(service.setStato(999, false)).rejects.toBeInstanceOf(NotFoundError);
  });

  test('list con soloAttivi=true filtra correttamente', async () => {
    await service.create({ ragioneSociale: 'A', partitaIva: '11111111111', attivo: true });
    await service.create({ ragioneSociale: 'B', partitaIva: '22222222222', attivo: false });

    const attivi = await service.list({ soloAttivi: true });
    const tutti = await service.list();

    expect(attivi).toHaveLength(1);
    expect(attivi[0].ragioneSociale).toBe('A');
    expect(tutti).toHaveLength(2);
  });
});
