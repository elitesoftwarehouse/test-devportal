import fs from 'fs';
import path from 'path';
import { ReadStream } from 'fs';

// Implementazione semplice basata su file system locale.
// storageReference è un path relativo alla directory base configurata.

const BASE_STORAGE_DIR = process.env.CV_STORAGE_PATH || path.join(process.cwd(), 'storage', 'cvs');

class StorageService {
  public getFileStream(storageReference: string): Promise<ReadStream> {
    return new Promise((resolve, reject) => {
      const fullPath = path.isAbsolute(storageReference)
        ? storageReference
        : path.join(BASE_STORAGE_DIR, storageReference);

      fs.access(fullPath, fs.constants.R_OK, (accessErr) => {
        if (accessErr) {
          // Manteniamo code ENOENT per gestione specifica nel router
          (accessErr as any).code = accessErr.code || 'ENOENT';
          return reject(accessErr);
        }

        try {
          const stream = fs.createReadStream(fullPath);
          return resolve(stream);
        } catch (err) {
          return reject(err);
        }
      });
    });
  }
}

export const storageService = new StorageService();
