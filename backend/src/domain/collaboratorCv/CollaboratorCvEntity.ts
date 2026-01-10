export interface CollaboratorCvEntity {
  id: string;
  collaboratorId: string;
  fileName: string;
  filePath: string;
  contentType: string;
  fileSize: number;
  flagIsCorrente: boolean;
  flagIsDeleted: boolean;
  versionLabel?: string | null;
  note?: string | null;
  createdByUserId: string;
  createdAt: Date;
  updatedByUserId?: string | null;
  updatedAt?: Date | null;
  deletedByUserId?: string | null;
  deletedAt?: Date | null;
}

export interface CreateCollaboratorCvDTO {
  collaboratorId: string;
  fileName: string;
  filePath: string;
  contentType: string;
  fileSize: number;
  versionLabel?: string;
  note?: string;
  createdByUserId: string;
  flagIsCorrente?: boolean;
}

export interface MarkCvCorrenteDTO {
  collaboratorId: string;
  cvId: string;
  updatedByUserId: string;
}

export interface SoftDeleteCvDTO {
  cvId: string;
  deletedByUserId: string;
}

export interface CollaboratorCvFilter {
  collaboratorId: string;
  includeDeleted?: boolean;
  onlyCorrente?: boolean;
}
