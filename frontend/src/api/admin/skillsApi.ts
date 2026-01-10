import axios, { AxiosResponse } from 'axios';

export interface AdminSkillDto {
  id: string;
  name: string;
}

/**
 * Recupera l'elenco delle skills chiave strutturate da usare nel filtro.
 * Si assume l'esistenza di un endpoint /api/admin/skills-key o simile.
 * In mancanza, sostituire l'URL con quello effettivo nel progetto.
 */
export async function fetchAdminSkills(): Promise<AdminSkillDto[]> {
  const response: AxiosResponse<AdminSkillDto[]> = await axios.get('/api/admin/skills');
  return response.data;
}
