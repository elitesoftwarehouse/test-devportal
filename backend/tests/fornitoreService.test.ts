import { FornitoreService } from '../src/services/FornitoreService';
import { FornitoreRepository } from '../src/repositories/FornitoreRepository';
import { Fornitore } from '../src/models/Fornitore';

class InMemoryFornitoreRepository implements Partial<FornitoreRepository> {
  private data: Fornitore[] = [];

  async createAndSave(fornitore: Partial<Fornitore>): Promise<Fornitore> {
    const entity = new Fornitore();
    Object.assign(entity, {
      id: String(this.data.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...fornitore
    });
    this.data.push(entity);
    return entity;
  }

  async findById(id: string): Promise<Fornitore | null> {
    return this.data.find(f => f.id === id) || null;
  }

  async findByPartitaIva(partitaIva: string): Promise<Fornitore | null> {
    return this.data.find(f => f.partitaIva === partitaIva) || null;
  }

  async updateAndSave(entity: Fornitore): Promise<Fornitore> {
    const index = this.data.findIndex(f => f.id === entity.id);
    if (index >= 0) {
      this.data[index] = entity;
    } else {
      this.data.push(entity);
    }
    return entity;
  }

  async findAll(options: {
    search?: string;
    attivo?: boolean | null;
    skip?: number;
    take?: number;
  }): Promise<{ data: Fornitore[]; total: number }> {
    let list = [...this.data];
    if (options.search) {
      const s = options.search.toLowerCase();
      list = list.filter(
        f =>
          f.ragioneSociale.toLowerCase().includes(s) ||
          (f.partitaIva && f.partitaIva.includes(s))
      );
    }
    if (options.attivo !== undefined && options.attivo !== null) {
      list = list.filter(f => f.attivo === options.attivo);
    }
    const total = list.length;
    const start = options.skip || 0;
    const end = start + (options.take || total);
    const data = list.slice(start, end);
    return { data, total };
  }
}

function createService() {
  const repo = new InMemoryFornitoreRepository() as any as FornitoreRepository;
  return new FornitoreService(repo);
}

describe('FornitoreService', () => {
  it('crea un fornitore valido', async () => {
    const service = createService();
    const result: any = await service.createFornitore(
      {
        ragioneSociale: 'ACME srl',
        partitaIva: '12345678901',
        email: 'info@acme.it'
      } as any,
      'test-user'
    );

    expect((result as any).id).toBeDefined();
    expect((result as any).ragioneSociale).toBe('ACME srl');
    expect((result as any).partitaIva).toBe('12345678901');
    expect((result as any).createdBy).toBe('test-user');
  });

  it('non consente duplicati di partita IVA', async () => {
    const service = createService();
    await service.createFornitore(
      {
        ragioneSociale: 'ACME srl',
        partitaIva: '12345678901',
        email: 'info@acme.it'
      } as any,
      'test-user'
    );

    const result: any = await service.createFornitore(
      {
        ragioneSociale: 'Altro fornitore',
        partitaIva: '12345678901',
        email: 'altro@acme.it'
      } as any,
      'test-user'
    );

    expect(result.status).toBe(409);
    expect(result.code).toBe('DUPLICATE_PARTITA_IVA');
  });

  it('valida i campi obbligatori', async () => {
    const service = createService();
    const result: any = await service.createFornitore({} as any, 'test-user');
    expect(result.status).toBe(400);
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(result.details)).toBe(true);
  });

  it('aggiorna lo stato attivo/inattivo', async () => {
    const service = createService();
    const created: any = await service.createFornitore(
      {
        ragioneSociale: 'ACME srl',
        partitaIva: '12345678901',
        email: 'info@acme.it'
      } as any,
      'test-user'
    );

    const updated: any = await service.updateStatoFornitore(
      created.id,
      { attivo: false } as any,
      'other-user'
    );

    expect(updated.attivo).toBe(false);
    expect(updated.updatedBy).toBe('other-user');
  });
});
