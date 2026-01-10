import { v4 as uuidv4 } from 'uuid';
import {
  CollaboratorCv,
  CreateCollaboratorCvInput,
  LogicalDeleteCollaboratorCvInput,
  ReplaceCollaboratorCvInput,
} from './collaboratorCv.model';
import { buildCollaboratorCvStorageKey } from './collaboratorCvStorageStrategy';

/**
 * Service in-memory per documentare le regole di business di versione/aggiornamento CV.
 * In implementazione reale verrà sostituito dall'accesso al DB (Spring Data JPA / PostgreSQL).
 */
export class CollaboratorCvService {
  private readonly items: CollaboratorCv[] = [];

  async uploadNew(input: CreateCollaboratorCvInput): Promise<CollaboratorCv> {
    const now = new Date();
    const descriptor = buildCollaboratorCvStorageKey(input.collaboratorId, input.fileNameOriginale, now);

    // Imposta tutti i CV correnti del collaboratore a storico
    for (const cv of this.items) {
      if (cv.collaboratorId === input.collaboratorId && cv.flagIsCorrente && !cv.flagIsDeleted) {
        cv.flagIsCorrente = false;
      }
    }

    const entity: CollaboratorCv = {
      id: uuidv4(),
      collaboratorId: input.collaboratorId,
      fileNameOriginale: input.fileNameOriginale,
      storageKey: descriptor.storageKey,
      mimeType: input.mimeType,
      dimensione: input.dimensione,
      dataCaricamento: now,
      caricatoreUserId: input.caricatoreUserId,
      note: input.note ?? null,
      flagIsCorrente: true,
      flagIsDeleted: false,
      dataEliminazione: null,
      eliminatoreUserId: null,
    };

    this.items.push(entity);
    return entity;
  }

  async replace(input: ReplaceCollaboratorCvInput): Promise<CollaboratorCv> {
    const existing = this.items.find((x) => x.id === input.idToReplace && !x.flagIsDeleted);
    if (!existing) {
      throw new Error('CV non trovato');
    }

    // Il vecchio diventa storico ma rimane non eliminato
    existing.flagIsCorrente = false;

    const now = new Date();
    const descriptor = buildCollaboratorCvStorageKey(existing.collaboratorId, input.fileNameOriginale, now);

    const entity: CollaboratorCv = {
      id: uuidv4(),
      collaboratorId: existing.collaboratorId,
      fileNameOriginale: input.fileNameOriginale,
      storageKey: descriptor.storageKey,
      mimeType: input.mimeType,
      dimensione: input.dimensione,
      dataCaricamento: now,
      caricatoreUserId: input.caricatoreUserId,
      note: input.note ?? null,
      flagIsCorrente: true,
      flagIsDeleted: false,
      dataEliminazione: null,
      eliminatoreUserId: null,
    };

    this.items.push(entity);
    return entity;
  }

  async logicalDelete(input: LogicalDeleteCollaboratorCvInput): Promise<CollaboratorCv> {
    const existing = this.items.find((x) => x.id === input.id && !x.flagIsDeleted);
    if (!existing) {
      throw new Error('CV non trovato');
    }

    existing.flagIsDeleted = true;
    existing.dataEliminazione = new Date();
    existing.eliminatoreUserId = input.eliminatoreUserId;

    // Nota: non modifichiamo lo storageKey; la strategia suggerita è mantenere il file fisico
    // anche dopo l'eliminazione logica, demandando politiche di cleanup offline.

    // Se era corrente, il collaboratore potrebbe rimanere senza CV corrente.
    // La policy raccomandata: non promuovere automaticamente uno storico a corrente.

    return existing;
  }

  async listByCollaborator(collaboratorId: string): Promise<CollaboratorCv[]> {
    return this.items.filter((x) => x.collaboratorId === collaboratorId && !x.flagIsDeleted);
  }
}
