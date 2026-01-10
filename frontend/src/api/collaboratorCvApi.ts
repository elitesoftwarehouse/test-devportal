export interface CollaboratorCv {
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
  createdAt: string;
  updatedByUserId?: string | null;
  updatedAt?: string | null;
  deletedByUserId?: string | null;
  deletedAt?: string | null;
}

const BASE_URL = '/api';

export async function fetchCollaboratorCvs(
  collaboratorId: string,
  options?: { includeDeleted?: boolean; onlyCorrente?: boolean }
): Promise<CollaboratorCv[]> {
  const params = new URLSearchParams();
  if (options?.includeDeleted) params.append('includeDeleted', 'true');
  if (options?.onlyCorrente) params.append('onlyCorrente', 'true');

  const res = await fetch(
    `${BASE_URL}/collaborators/${encodeURIComponent(collaboratorId)}/cvs?${params.toString()}`,
    {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    }
  );

  if (!res.ok) {
    throw new Error('Errore nel recupero dei CV del collaboratore');
  }

  return res.json();
}

export interface UploadCvPayload {
  file: File;
  versionLabel?: string;
  note?: string;
  flagIsCorrente?: boolean;
}

export async function uploadCollaboratorCv(
  collaboratorId: string,
  payload: UploadCvPayload
): Promise<CollaboratorCv> {
  const formData = new FormData();
  formData.append('file', payload.file);
  if (payload.versionLabel) formData.append('versionLabel', payload.versionLabel);
  if (payload.note) formData.append('note', payload.note);
  if (payload.flagIsCorrente) formData.append('flagIsCorrente', 'true');

  const res = await fetch(`${BASE_URL}/collaborators/${encodeURIComponent(collaboratorId)}/cvs`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Errore durante il caricamento del CV');
  }

  return res.json();
}

export async function setCollaboratorCvAsCorrente(
  collaboratorId: string,
  cvId: string
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/collaborators/${encodeURIComponent(collaboratorId)}/cvs/${encodeURIComponent(cvId)}/set-corrente`,
    {
      method: 'POST',
    }
  );

  if (!res.ok) {
    throw new Error('Errore durante la marcatura del CV come corrente');
  }
}

export async function softDeleteCollaboratorCv(collaboratorId: string, cvId: string): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/collaborators/${encodeURIComponent(collaboratorId)}/cvs/${encodeURIComponent(cvId)}`,
    {
      method: 'DELETE',
    }
  );

  if (!res.ok) {
    throw new Error('Errore durante l\'eliminazione del CV');
  }
}
