import axios, { AxiosResponse } from 'axios';

export interface AdminRoleDto {
  id: string;
  name: string;
}

/**
 * Recupera l'elenco dei ruoli disponibili per il filtro.
 * Si assume l'esistenza di un endpoint /api/admin/roles o simile.
 * In mancanza, sostituire l'URL con quello effettivo nel progetto.
 */
export async function fetchAdminRoles(): Promise<AdminRoleDto[]> {
  const response: AxiosResponse<AdminRoleDto[]> = await axios.get('/api/admin/roles');
  return response.data;
}
