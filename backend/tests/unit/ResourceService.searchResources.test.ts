import 'reflect-metadata';
import { EntityManager } from 'typeorm';
import { ResourceService } from '../../src/services/ResourceService';
import { ResourceRepository, ResourceSearchFilters, ResourceSearchOptions } from '../../src/repositories/ResourceRepository';

jest.mock('../../src/repositories/ResourceRepository');

const MockedRepository = ResourceRepository as jest.MockedClass<typeof ResourceRepository>;

describe('ResourceService.searchResources', () => {
  beforeEach(() => {
    MockedRepository.mockClear();
  });

  it('normalizza filtri null e applica default skillsMatchMode ANY', async () => {
    const manager = {} as EntityManager;
    const service = new ResourceService(manager);

    const repoInstance = (ResourceRepository as jest.MockedClass<typeof ResourceRepository>).mock.instances[0];
    (repoInstance.searchResources as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20
    });

    const filters: Partial<ResourceSearchFilters> = { name: undefined, role: undefined, skills: undefined };
    const options: Partial<ResourceSearchOptions> = {};

    await service.searchResources(filters as any, options as any);

    expect(repoInstance.searchResources).toHaveBeenCalledWith(
      {
        name: null,
        role: null,
        skills: null,
        skillsMatchMode: 'ANY'
      },
      { page: 1, pageSize: 20 }
    );
  });

  it('propaga i parametri quando presenti', async () => {
    const manager = {} as EntityManager;
    const service = new ResourceService(manager);

    const repoInstance = (ResourceRepository as jest.MockedClass<typeof ResourceRepository>).mock.instances[0];
    (repoInstance.searchResources as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
      page: 2,
      pageSize: 5
    });

    const filters: ResourceSearchFilters = {
      name: 'Mario',
      role: 'Dev',
      skills: ['Java'],
      skillsMatchMode: 'ALL'
    };

    const options: ResourceSearchOptions = { page: 2, pageSize: 5 };

    const result = await service.searchResources(filters, options);

    expect(repoInstance.searchResources).toHaveBeenCalledWith(filters, options);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(5);
  });
});
