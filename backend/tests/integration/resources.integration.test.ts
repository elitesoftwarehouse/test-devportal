import 'reflect-metadata';
import request from 'supertest';
import { createConnection, getConnection } from 'typeorm';
import { Application } from 'express';
import httpStatus from 'http-status';
import { Readable } from 'stream';

import { createApp } from '../../src/app';
import { Resource } from '../../src/entities/Resource';
import { ResourceCv } from '../../src/entities/ResourceCv';
import { FileStorageService } from '../../src/services/fileStorage.service';

jest.mock('../../src/services/fileStorage.service');

describe('Resources API integration', () => {
  let app: Application;

  beforeAll(async () => {
    await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Resource, ResourceCv],
      synchronize: true,
      logging: false,
      name: 'default',
    });

    app = createApp();
  });

  afterAll(async () => {
    const conn = getConnection();
    await conn.close();
  });

  beforeEach(async () => {
    const conn = getConnection();
    const entities = conn.entityMetadatas;
    for (const entity of entities) {
      const repository = conn.getRepository(entity.name);
      await repository.query(`DELETE FROM ${entity.tableName}`);
    }
  });

  const authHeader = { Authorization: 'Bearer test-token-with-RESOURCE_VIEW' };

  describe('GET /api/resources/:id', () => {
    it('restituisce 200 e dettaglio con CV quando la risorsa esiste', async () => {
      const conn = getConnection();
      const resRepo = conn.getRepository(Resource);
      const cvRepo = conn.getRepository(ResourceCv);

      const resource = await resRepo.save(
        resRepo.create({
          firstName: 'Mario',
          lastName: 'Rossi',
          role: 'Developer',
          email: 'mario.rossi@example.com',
        })
      );

      await cvRepo.save(
        cvRepo.create({
          resource,
          fileName: 'cv1.pdf',
          storagePath: 'cvs/res-1/cv1.pdf',
          mimeType: 'application/pdf',
        })
      );

      const response = await request(app)
        .get(`/api/resources/${resource.id}`)
        .set(authHeader)
        .expect(httpStatus.OK);

      expect(response.body.id).toBe(resource.id);
      expect(response.body.cvs).toHaveLength(1);
      expect(response.body.cvs[0].fileName).toBe('cv1.pdf');
    });

    it('restituisce 404 quando la risorsa non esiste', async () => {
      const response = await request(app)
        .get('/api/resources/non-existent')
        .set(authHeader)
        .expect(httpStatus.NOT_FOUND);

      expect(response.body.message).toBe('Risorsa non trovata');
    });
  });

  describe('GET /api/resources/:resourceId/cv/:cvId/download', () => {
    it('effettua il download del CV con header corretti per combinazioni valide', async () => {
      const conn = getConnection();
      const resRepo = conn.getRepository(Resource);
      const cvRepo = conn.getRepository(ResourceCv);
      const resource = await resRepo.save(
        resRepo.create({
          firstName: 'Luca',
          lastName: 'Bianchi',
          role: 'PM',
          email: 'luca.bianchi@example.com',
        })
      );
      const cv = await cvRepo.save(
        cvRepo.create({
          resource,
          fileName: 'cv-luca.pdf',
          storagePath: 'cvs/luca/cv-luca.pdf',
          mimeType: 'application/pdf',
        })
      );

      const mockStream = new Readable();
      mockStream._read = () => {};
      (mockStream as any).pipe = jest.fn(function () {
        // simula che la pipe chiuda la response
        (this as any).emit('end');
      });

      const fileStorageMock = FileStorageService as jest.MockedClass<typeof FileStorageService>;
      (fileStorageMock.prototype.getFileStream as jest.Mock).mockResolvedValue(mockStream as any);

      const response = await request(app)
        .get(`/api/resources/${resource.id}/cv/${cv.id}/download`)
        .set(authHeader)
        .buffer()
        .parse((res, cb) => {
          res.setEncoding('binary');
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            cb(null, Buffer.from(data, 'binary'));
          });
        })
        .expect(httpStatus.OK);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment; filename="cv-luca.pdf"');
    });

    it('restituisce 404 se si tenta di scaricare un CV non associato alla risorsa', async () => {
      const conn = getConnection();
      const resRepo = conn.getRepository(Resource);
      const cvRepo = conn.getRepository(ResourceCv);

      const resource1 = await resRepo.save(
        resRepo.create({ firstName: 'A', lastName: 'A', email: 'a@example.com' })
      );
      const resource2 = await resRepo.save(
        resRepo.create({ firstName: 'B', lastName: 'B', email: 'b@example.com' })
      );

      const cv = await cvRepo.save(
        cvRepo.create({
          resource: resource2,
          fileName: 'cv-b.pdf',
          storagePath: 'cvs/b/cv-b.pdf',
        })
      );

      const response = await request(app)
        .get(`/api/resources/${resource1.id}/cv/${cv.id}/download`)
        .set(authHeader)
        .expect(httpStatus.NOT_FOUND);

      expect(response.body.message).toBe('CV non trovato per la risorsa specificata');
    });

    it('restituisce 404 quando il file non è presente nello storage', async () => {
      const conn = getConnection();
      const resRepo = conn.getRepository(Resource);
      const cvRepo = conn.getRepository(ResourceCv);
      const resource = await resRepo.save(
        resRepo.create({ firstName: 'C', lastName: 'C', email: 'c@example.com' })
      );
      const cv = await cvRepo.save(
        cvRepo.create({
          resource,
          fileName: 'cv-c.pdf',
          storagePath: 'cvs/c/cv-c.pdf',
          mimeType: 'application/pdf',
        })
      );

      const fileStorageMock = FileStorageService as jest.MockedClass<typeof FileStorageService>;
      const error: any = new Error('File not found');
      error.code = 'ENOENT';
      (fileStorageMock.prototype.getFileStream as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .get(`/api/resources/${resource.id}/cv/${cv.id}/download`)
        .set(authHeader)
        .expect(httpStatus.NOT_FOUND);

      expect(response.body.message).toBe('File CV non trovato');
    });
  });
});
