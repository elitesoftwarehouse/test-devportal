import 'reflect-metadata';
import { SelectQueryBuilder, EntityManager } from 'typeorm';
import { ResourceRepository, ResourceSearchFilters } from '../../src/repositories/ResourceRepository';
import { Resource } from '../../src/entities/Resource';

// Helper per creare un mock di SelectQueryBuilder con chaining
function createQueryBuilderMock() {
  const qb: any = {
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    subQuery: jest.fn()
  };
  qb.subQuery.mockReturnValue({
    select: () => ({
      from: () => ({
        leftJoin: () => ({
          where: () => ({
            groupBy: () => ({
              having: () => ({
                getQuery: () => '(subquery)'
              })
            })
          })
        })
      })
    })
  });
  return qb as SelectQueryBuilder<Resource> as any;
}

function createManagerMock(qb: any) {
  return {
    getRepository: jest.fn().mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnValue(qb)
    })
  } as unknown as EntityManager;
}

describe('ResourceRepository.applyFilters', () => {
  it('applica filtro solo nome', () => {
    const qb = createQueryBuilderMock();
    const manager = createManagerMock(qb);
    const repo = new ResourceRepository(manager);

    const filters: ResourceSearchFilters = {
      name: 'Mario',
      role: null,
      skills: null,
      skillsMatchMode: 'ANY'
    };

    repo.applyFilters(qb, filters);

    expect(qb.andWhere).toHaveBeenCalledWith(
      'LOWER(r.name) LIKE :name',
      expect.objectContaining({ name: '%mario%' })
    );
  });

  it('applica filtro solo ruolo', () => {
    const qb = createQueryBuilderMock();
    const manager = createManagerMock(qb);
    const repo = new ResourceRepository(manager);

    const filters: ResourceSearchFilters = {
      name: null,
      role: 'Developer',
      skills: null,
      skillsMatchMode: 'ANY'
    };

    repo.applyFilters(qb, filters);

    expect(qb.andWhere).toHaveBeenCalledWith(
      'LOWER(r.role) = :role',
      expect.objectContaining({ role: 'developer' })
    );
  });

  it('applica filtro solo skills in modalità ANY', () => {
    const qb = createQueryBuilderMock();
    const manager = createManagerMock(qb);
    const repo = new ResourceRepository(manager);

    const filters: ResourceSearchFilters = {
      name: null,
      role: null,
      skills: ['Java', 'React'],
      skillsMatchMode: 'ANY'
    };

    repo.applyFilters(qb, filters);

    expect(qb.andWhere).toHaveBeenCalledWith(
      's.name IN (:...skills)',
      expect.objectContaining({ skills: ['Java', 'React'] })
    );
  });

  it('applica filtro skills in modalità ALL utilizzando subquery', () => {
    const qb: any = createQueryBuilderMock();
    const manager = createManagerMock(qb);
    const repo = new ResourceRepository(manager);

    const filters: ResourceSearchFilters = {
      name: null,
      role: null,
      skills: ['Java', 'React'],
      skillsMatchMode: 'ALL'
    };

    repo.applyFilters(qb, filters);

    expect(qb.andWhere).toHaveBeenCalledWith(expect.any(Function));
    expect(qb.setParameter).toHaveBeenCalledWith('allSkills', ['Java', 'React']);
    expect(qb.setParameter).toHaveBeenCalledWith('skillsCount', 2);
  });

  it('applica combinazione nome + ruolo', () => {
    const qb = createQueryBuilderMock();
    const manager = createManagerMock(qb);
    const repo = new ResourceRepository(manager);

    const filters: ResourceSearchFilters = {
      name: 'Mario',
      role: 'PM',
      skills: null,
      skillsMatchMode: 'ANY'
    };

    repo.applyFilters(qb, filters);

    expect(qb.andWhere).toHaveBeenNthCalledWith(
      1,
      'LOWER(r.name) LIKE :name',
      expect.any(Object)
    );
    expect(qb.andWhere).toHaveBeenNthCalledWith(
      2,
      'LOWER(r.role) = :role',
      expect.any(Object)
    );
  });

  it('ignora skills vuote o solo spazi', () => {
    const qb = createQueryBuilderMock();
    const manager = createManagerMock(qb);
    const repo = new ResourceRepository(manager);

    const filters: ResourceSearchFilters = {
      name: null,
      role: null,
      skills: ['   ', ''],
      skillsMatchMode: 'ANY'
    };

    repo.applyFilters(qb, filters);

    // nessuna andWhere relativa alle skills dovrebbe essere chiamata
    expect(qb.andWhere).not.toHaveBeenCalled();
  });

  it('deduplica le skills duplicate', () => {
    const qb = createQueryBuilderMock();
    const manager = createManagerMock(qb);
    const repo = new ResourceRepository(manager);

    const filters: ResourceSearchFilters = {
      name: null,
      role: null,
      skills: ['Java', 'Java', 'React'],
      skillsMatchMode: 'ANY'
    };

    repo.applyFilters(qb, filters);

    expect(qb.andWhere).toHaveBeenCalledWith(
      's.name IN (:...skills)',
      expect.objectContaining({ skills: ['Java', 'React'] })
    );
  });
});

describe('ResourceRepository.searchResources', () => {
  it('gestisce paginazione con default e chiama getManyAndCount', async () => {
    const qb: any = createQueryBuilderMock();
    const resources: Partial<Resource>[] = [{ id: 1 }, { id: 2 }];
    qb.getManyAndCount.mockResolvedValue([resources, 2]);

    const manager = createManagerMock(qb);
    const repo = new ResourceRepository(manager);

    const filters: ResourceSearchFilters = { name: null, role: null, skills: null, skillsMatchMode: 'ANY' };

    const result = await repo.searchResources(filters, { page: 1, pageSize: 10 });

    expect(manager.getRepository).toHaveBeenCalled();
    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('r.skills', 's');
    expect(qb.skip).toHaveBeenCalledWith(0);
    expect(qb.take).toHaveBeenCalledWith(10);
    expect(qb.getManyAndCount).toHaveBeenCalled();

    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });
});
