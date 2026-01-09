import { DataSource, Repository } from 'typeorm';
import { Fornitore } from '../models/Fornitore';

export class FornitoreRepository {
  private repository: Repository<Fornitore>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Fornitore);
  }

  async createAndSave(fornitore: Partial<Fornitore>): Promise<Fornitore> {
    const entity = this.repository.create(fornitore);
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<Fornitore | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByPartitaIva(partitaIva: string): Promise<Fornitore | null> {
    return this.repository.findOne({ where: { partitaIva } });
  }

  async updateAndSave(entity: Fornitore): Promise<Fornitore> {
    return this.repository.save(entity);
  }

  async findAll(options: {
    search?: string;
    attivo?: boolean | null;
    skip?: number;
    take?: number;
  }): Promise<{ data: Fornitore[]; total: number }> {
    const qb = this.repository.createQueryBuilder('f');

    if (options.search) {
      qb.andWhere('LOWER(f.ragioneSociale) LIKE :search OR f.partitaIva LIKE :search', {
        search: `%${options.search.toLowerCase()}%`
      });
    }

    if (options.attivo !== null && options.attivo !== undefined) {
      qb.andWhere('f.attivo = :attivo', { attivo: options.attivo });
    }

    const skip = options.skip ?? 0;
    const take = Math.min(options.take ?? 20, 100);

    qb.skip(skip).take(take).orderBy('f.ragioneSociale', 'ASC');

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }
}
