import 'reflect-metadata';
import { ResourcesController } from '../../src/api/resources/resources.controller';
import { ResourcesService } from '../../src/services/resources.service';
import { FileStorageService } from '../../src/services/fileStorage.service';
import httpStatus from 'http-status';
import { Readable } from 'stream';

jest.mock('../../src/services/resources.service');
jest.mock('../../src/services/fileStorage.service');

const MockedResourcesService = ResourcesService as jest.MockedClass<typeof ResourcesService>;
const MockedFileStorageService = FileStorageService as jest.MockedClass<typeof FileStorageService>;

const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  res.end = jest.fn();
  return res;
};

describe('ResourcesController', () => {
  let controller: ResourcesController;
  let serviceInstance: jest.Mocked<ResourcesService>;
  let storageInstance: jest.Mocked<FileStorageService>;

  beforeEach(() => {
    jest.clearAllMocks();
    serviceInstance = new MockedResourcesService() as any;
    storageInstance = new MockedFileStorageService() as any;
    // @ts-ignore sovrascriviamo le istanze interne del controller
    controller = new ResourcesController();
    // patch mano per collegare i mock, dato che il controller crea le istanze nel modulo
    (controller as any).resourcesService = serviceInstance;
    (controller as any).fileStorageService = storageInstance;
  });

  describe('getResourceDetail', () => {
    it('restituisce 403 se utente non autorizzato', async () => {
      const req: any = { params: { id: 'res-1' }, user: { permissions: [] } };
      const res = createMockResponse();

      await controller.getResourceDetail(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(httpStatus.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ message: 'Utente non autorizzato' });
    });

    it('restituisce 404 se la risorsa non esiste', async () => {
      const req: any = { params: { id: 'res-404' }, user: { permissions: ['RESOURCE_VIEW'] } };
      const res = createMockResponse();

      serviceInstance.getResourceDetailWithCvs.mockResolvedValue(null as any);

      await controller.getResourceDetail(req as any, res as any);

      expect(serviceInstance.getResourceDetailWithCvs).toHaveBeenCalledWith('res-404');
      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: 'Risorsa non trovata' });
    });

    it('restituisce 200 e il DTO della risorsa quando esiste', async () => {
      const req: any = { params: { id: 'res-1' }, user: { permissions: ['RESOURCE_VIEW'] } };
      const res = createMockResponse();

      const dto = {
        id: 'res-1',
        firstName: 'Mario',
        lastName: 'Rossi',
        role: 'Developer',
        email: 'mario.rossi@example.com',
        cvs: [],
      };
      serviceInstance.getResourceDetailWithCvs.mockResolvedValue(dto as any);

      await controller.getResourceDetail(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(dto);
    });
  });

  describe('downloadResourceCv', () => {
    it('restituisce 403 se utente non autorizzato', async () => {
      const req: any = { params: { resourceId: 'res-1', cvId: 'cv-1' }, user: { permissions: [] } };
      const res = createMockResponse();

      await controller.downloadResourceCv(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(httpStatus.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ message: 'Utente non autorizzato' });
    });

    it('restituisce 404 se il CV non è associato alla risorsa', async () => {
      const req: any = { params: { resourceId: 'res-1', cvId: 'cv-404' }, user: { permissions: ['RESOURCE_VIEW'] } };
      const res = createMockResponse();

      serviceInstance.getResourceCvAssociation.mockResolvedValue(null as any);

      await controller.downloadResourceCv(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: 'CV non trovato per la risorsa specificata' });
    });

    it('effettua il download con header corretti per combinazioni valide di resourceId e cvId', async () => {
      const req: any = { params: { resourceId: 'res-1', cvId: 'cv-1' }, user: { permissions: ['RESOURCE_VIEW'] } };
      const res: any = createMockResponse();

      const mockAssociation = {
        id: 'cv-1',
        fileName: 'cv1.pdf',
        mimeType: 'application/pdf',
        storagePath: 'cvs/res-1/cv1.pdf',
      };
      serviceInstance.getResourceCvAssociation.mockResolvedValue(mockAssociation as any);

      const stream = new Readable();
      stream._read = () => {};
      (stream as any).pipe = jest.fn();
      storageInstance.getFileStream.mockResolvedValue(stream as any);

      await controller.downloadResourceCv(req as any, res as any);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="cv1.pdf"');
      expect((stream as any).pipe).toHaveBeenCalledWith(res);
    });

    it('restituisce 404 quando il file non esiste nello storage (ENOENT)', async () => {
      const req: any = { params: { resourceId: 'res-1', cvId: 'cv-1' }, user: { permissions: ['RESOURCE_VIEW'] } };
      const res = createMockResponse();

      const mockAssociation = {
        id: 'cv-1',
        fileName: 'cv1.pdf',
        mimeType: 'application/pdf',
        storagePath: 'cvs/res-1/cv1.pdf',
      };
      serviceInstance.getResourceCvAssociation.mockResolvedValue(mockAssociation as any);

      const error: any = new Error('File not found');
      error.code = 'ENOENT';
      storageInstance.getFileStream.mockRejectedValue(error);

      await controller.downloadResourceCv(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: 'File CV non trovato' });
    });
  });
});
