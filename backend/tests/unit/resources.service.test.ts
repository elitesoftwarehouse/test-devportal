import 'reflect-metadata';
import { getRepository } from 'typeorm';
import { ResourcesService } from '../../src/services/resources.service';
import { Resource } from '../../src/entities/Resource';
import { ResourceCv } from '../../src/entities/ResourceCv';

jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    getRepository: jest.fn(),
  };
});

const mockedGetRepository = getRepository as jest.Mock;

describe('ResourcesService', () => {
  let service: ResourcesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ResourcesService();
  });

  describe('getResourceDetailWithCvs', () => {
    it('restituisce i dati corretti quando la risorsa esiste ed è associata a CV', async () => {
      const mockResourceRepo = {
        findOne: jest.fn(),
      };
      const mockCv1: Partial<ResourceCv> = {
        id: 'cv-1',
        fileName: 'cv1.pdf',
        createdAt: new Date('2023-01-01T10:00:00Z'),
        updatedAt: new Date('2023-01-02T10:00:00Z'),
      };
      const mockCv2: Partial<ResourceCv> = {
        id: 'cv-2',
        fileName: 'cv2.pdf',
        createdAt: new Date('2023-02-01T10:00:00Z'),
        updatedAt: new Date('2023-02-02T10:00:00Z'),
      };
      const mockResource: Partial<Resource> = {
        id: 'res-1',
        firstName: 'Mario',
        lastName: 'Rossi',
        role: 'Developer',
        email: 'mario.rossi@example.com',
        cvs: [mockCv1 as ResourceCv, mockCv2 as ResourceCv],
      };

      mockedGetRepository
        .mockReturnValueOnce(mockResourceRepo) // Resource repo
        .mockReturnValueOnce({}); // ResourceCv repo (non usato in questo metodo)

      mockResourceRepo.findOne.mockResolvedValue(mockResource);

      const result = await service.getResourceDetailWithCvs('res-1');

      expect(mockResourceRepo.findOne).toHaveBeenCalledWith('res-1', {
        relations: ['cvs'],
      });
      expect(result).not.toBeNull();
      expect(result).toEqual({
        id: 'res-1',
        firstName: 'Mario',
        lastName: 'Rossi',
        role: 'Developer',
        email: 'mario.rossi@example.com',
        cvs: [
          {
            id: 'cv-1',
            fileName: 'cv1.pdf',
            createdAt: mockCv1.createdAt!.toISOString(),
            updatedAt: mockCv1.updatedAt!.toISOString(),
          },
          {
            id: 'cv-2',
            fileName: 'cv2.pdf',
            createdAt: mockCv2.createdAt!.toISOString(),
            updatedAt: mockCv2.updatedAt!.toISOString(),
          },
        ],
      });
    });

    it('restituisce struttura valida con lista CV vuota quando non ci sono CV', async () => {
      const mockResourceRepo = {
        findOne: jest.fn(),
      };
      const mockResource: Partial<Resource> = {
        id: 'res-2',
        firstName: 'Luca',
        lastName: 'Bianchi',
        role: null,
        email: 'luca.bianchi@example.com',
        cvs: [],
      };

      mockedGetRepository
        .mockReturnValueOnce(mockResourceRepo)
        .mockReturnValueOnce({});

      mockResourceRepo.findOne.mockResolvedValue(mockResource);

      const result = await service.getResourceDetailWithCvs('res-2');

      expect(result).toEqual({
        id: 'res-2',
        firstName: 'Luca',
        lastName: 'Bianchi',
        role: null,
        email: 'luca.bianchi@example.com',
        cvs: [],
      });
    });

    it('restituisce null quando la risorsa non esiste', async () => {
      const mockResourceRepo = {
        findOne: jest.fn(),
      };

      mockedGetRepository
        .mockReturnValueOnce(mockResourceRepo)
        .mockReturnValueOnce({});

      mockResourceRepo.findOne.mockResolvedValue(undefined);

      const result = await service.getResourceDetailWithCvs('res-404');

      expect(result).toBeNull();
    });
  });

  describe('getResourceCvAssociation', () => {
    it('restituisce l associazione corretta quando CV è associato alla risorsa', async () => {
      const mockResourceRepo = {};
      const mockCvRepo = {
        findOne: jest.fn(),
      };
      const mockCv: Partial<ResourceCv> = {
        id: 'cv-1',
        fileName: 'cv1.pdf',
        mimeType: 'application/pdf',
        storagePath: 'cvs/res-1/cv1.pdf',
      };

      mockedGetRepository
        .mockReturnValueOnce(mockResourceRepo)
        .mockReturnValueOnce(mockCvRepo);

      mockCvRepo.findOne.mockResolvedValue(mockCv);

      const result = await service.getResourceCvAssociation('res-1', 'cv-1');

      expect(mockCvRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'cv-1', resource: { id: 'res-1' } },
        relations: ['resource'],
      });
      expect(result).toEqual({
        id: 'cv-1',
        fileName: 'cv1.pdf',
        mimeType: 'application/pdf',
        storagePath: 'cvs/res-1/cv1.pdf',
      });
    });

    it('restituisce null quando il CV non è associato alla risorsa', async () => {
      const mockResourceRepo = {};
      const mockCvRepo = {
        findOne: jest.fn(),
      };

      mockedGetRepository
        .mockReturnValueOnce(mockResourceRepo)
        .mockReturnValueOnce(mockCvRepo);

      mockCvRepo.findOne.mockResolvedValue(undefined);

      const result = await service.getResourceCvAssociation('res-1', 'cv-404');

      expect(result).toBeNull();
    });
  });
});
