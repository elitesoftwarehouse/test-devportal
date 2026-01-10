export interface SupplierDto {
  id?: number;
  ragioneSociale: string;
  partitaIva?: string | null;
  codiceFiscale?: string | null;
  codiceSdi?: string | null;
  pec?: string | null;
  indirizzoVia?: string | null;
  indirizzoCap?: string | null;
  indirizzoCitta?: string | null;
  indirizzoProvincia?: string | null;
  indirizzoNazione?: string | null;
  telefono?: string | null;
  email?: string | null;
  sitoWeb?: string | null;
  isActive?: boolean;
}

const BASE_URL = '/api/suppliers';

export async function fetchSuppliers(): Promise<SupplierDto[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) {
    throw new Error('Errore nel caricamento dei fornitori');
  }
  return res.json();
}

export async function createSupplier(payload: SupplierDto): Promise<SupplierDto> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Errore nella creazione del fornitore');
  }
  return res.json();
}

export async function updateSupplier(id: number, payload: SupplierDto): Promise<SupplierDto> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Errore nell\'aggiornamento del fornitore');
  }
  return res.json();
}

export async function deleteSupplier(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Errore nell\'eliminazione del fornitore');
  }
}
