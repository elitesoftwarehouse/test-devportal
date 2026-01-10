import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ResourcesService } from '../../services/resources.service';
import { FileStorageService } from '../../services/fileStorage.service';

const resourcesService = new ResourcesService();
const fileStorageService = new FileStorageService();

export class ResourcesController {
  async getResourceDetail(req: Request, res: Response): Promise<void> {
    const resourceId = req.params.id;
    const user = req.user; // popolato dal middleware di autenticazione

    if (!user || !user.permissions?.includes('RESOURCE_VIEW')) {
      res.status(httpStatus.FORBIDDEN).json({ message: 'Utente non autorizzato' });
      return;
    }

    const resource = await resourcesService.getResourceDetailWithCvs(resourceId);
    if (!resource) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Risorsa non trovata' });
      return;
    }

    res.status(httpStatus.OK).json(resource);
  }

  async downloadResourceCv(req: Request, res: Response): Promise<void> {
    const { resourceId, cvId } = req.params;
    const user = req.user;

    if (!user || !user.permissions?.includes('RESOURCE_VIEW')) {
      res.status(httpStatus.FORBIDDEN).json({ message: 'Utente non autorizzato' });
      return;
    }

    const association = await resourcesService.getResourceCvAssociation(resourceId, cvId);
    if (!association) {
      // nel progetto consideriamo 404 se il CV non è associato alla risorsa
      res.status(httpStatus.NOT_FOUND).json({ message: 'CV non trovato per la risorsa specificata' });
      return;
    }

    try {
      const fileStream = await fileStorageService.getFileStream(association.storagePath);

      res.setHeader('Content-Type', association.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${association.fileName}"`);

      fileStream.on('error', (err) => {
        // gestione di sicurezza: se il file non esiste nello storage
        if ((err as any).code === 'ENOENT') {
          res.status(httpStatus.NOT_FOUND).json({ message: 'File CV non trovato' });
        } else {
          res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Errore nel download del file' });
        }
      });

      fileStream.pipe(res);
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        res.status(httpStatus.NOT_FOUND).json({ message: 'File CV non trovato' });
      } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Errore nel download del file' });
      }
    }
  }
}

export const resourcesController = new ResourcesController();
