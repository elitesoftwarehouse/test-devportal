export interface CollaboratorCv {
  id: string;
  collaboratorId: string;
  fileNameOriginale: string;
  storageKey: string;
  mimeType: string;
  dimensione: number;
  dataCaricamento: Date;
  caricatoreUserId: string;
  note?: string | null;
  flagIsCorrente: boolean;
  flagIsDeleted: boolean;
  dataEliminazione?: Date | null;
  eliminatoreUserId?: string | null;
}

export interface CreateCollaboratorCvInput {
  collaboratorId: string;
  fileNameOriginale: string;
  mimeType: string;
  dimensione: number;
  caricatoreUserId: string;
  note?: string | null;
}

export interface LogicalDeleteCollaboratorCvInput {
  id: string;
  eliminatoreUserId: string;
}

export interface ReplaceCollaboratorCvInput {
  idToReplace: string;
  fileNameOriginale: string;
  mimeType: string;
  dimensione: number;
  caricatoreUserId: string;
  note?: string | null;
}

export interface CollaboratorCvStorageDescriptor {
  /** Percorso relativo o chiave di storage, es. "collaborators/{collaboratorId}/{timestamp}_{nomeSanificato}.pdf" */
  storageKey: string;
  /** Percorso assoluto su filesystem, se applicabile */
  absolutePath: string;
}
