import fs from 'fs';
import path from 'path';
import { ReadStream } from 'fs';

export class FileStorageService {
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath || process.env.FILE_STORAGE_BASE_PATH || path.join(process.cwd(), 'storage');
  }

  async getFileStream(relativePath: string): Promise<ReadStream> {
    const fullPath = path.join(this.basePath, relativePath);

    return fs.createReadStream(fullPath);
  }
}
