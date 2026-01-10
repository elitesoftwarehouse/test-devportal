export interface ProfessionalProfileDto {
  id?: string;
  userId?: string;
  nome: string;
  cognome: string;
  codiceFiscale?: string | null;
  partitaIva?: string | null;
  email?: string | null;
  pec?: string | null;
  telefono?: string | null;
  cellulare?: string | null;
  indirizzo?: string | null;
  cap?: string | null;
  citta?: string | null;
  provincia?: string | null;
}
