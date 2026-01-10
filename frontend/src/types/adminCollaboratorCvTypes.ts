export type AdminCollaboratorCvStatus = 'CURRENT' | 'HISTORIC' | 'DELETED';

export interface AdminCollaboratorCv {
  id: string;
  fileName: string;
  status: AdminCollaboratorCvStatus;
  uploadedAt: string;
  uploadedBy: {
    id: string;
    displayName: string;
  } | null;
  fileSizeBytes: string;
  mimeType: string;
}

export interface AdminCollaboratorCvUploadResponse extends AdminCollaboratorCv {}
