import { Router, Request, Response } from 'express';

/**
 * Router amministrativo per la ricerca risorse.
 *
 * NOTA IMPORTANTE:
 * Questo router non implementa una nuova logica di dominio ma si limita
 * a fare da thin wrapper verso l'endpoint di ricerca risorse già esistente
 * (es. /api/resources/search).
 *
 * Scopo principale:
 * - Mantenere il namespace /api/admin coerente con le altre funzionalità admin
 * - Documentare in modo chiaro come vengono passati i parametri dalla UI
 *
 * Parametri accettati (query string):
 * - q: string | undefined  -> testo libero per nome/cognome
 * - roles: string | string[] | undefined -> uno o più roleId (ripetibile)
 * - skills: string | string[] | undefined -> uno o più skillId (ripetibile)
 * - page: string (numero pagina 1-based)
 * - pageSize: string (dimensione pagina)
 */

export const adminResourcesSearchRouter = Router();

// Questo handler dimostra chiaramente come i filtri della UI vengono
// trasformati in parametri query per l'API di ricerca principale.
adminResourcesSearchRouter.get('/resources/search', async (req: Request, res: Response) => {
  try {
    const {
      q,
      roles,
      skills,
      page = '1',
      pageSize = '20',
    } = req.query as {
      q?: string;
      roles?: string | string[];
      skills?: string | string[];
      page?: string;
      pageSize?: string;
    };

    // Normalizzazione dei parametri multipli (ruoli e skills) in array di stringhe.
    const normalizedRoles =
      typeof roles === 'string' ? [roles] : Array.isArray(roles) ? roles : undefined;

    const normalizedSkills =
      typeof skills === 'string' ? [skills] : Array.isArray(skills) ? skills : undefined;

    // Costruzione dell'oggetto query da inoltrare al service di ricerca.
    // In un progetto reale, qui chiameremmo un service esistente, es. resourceSearchService.search(...)
    // Per mantenere il codice autonomo, simuliamo la chiamata demandando a un adapter
    // che può essere facilmente rimpiazzato con l'implementazione reale.

    const searchResult = await mockSearchResources({
      q,
      roles: normalizedRoles,
      skills: normalizedSkills,
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 20,
    });

    res.json(searchResult);
  } catch (error) {
    // Logging minimale; in produzione usare un logger centralizzato
    // eslint-disable-next-line no-console
    console.error('Errore ricerca risorse admin', error);
    res.status(500).json({
      message: 'Errore durante la ricerca delle risorse. Riprova più tardi.',
    });
  }
});

// Tipi usati per il mock e per documentare la forma attesa dell'API di ricerca.
export interface AdminResourceSearchFilter {
  q?: string;
  roles?: string[];
  skills?: string[];
  page: number;
  pageSize: number;
}

export interface AdminResourceSummaryDto {
  id: string;
  fullName: string;
  roleName: string;
  keySkills: string[];
}

export interface AdminResourceSearchResponse {
  items: AdminResourceSummaryDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * mockSearchResources
 *
 * Questa funzione è solo un placeholder per mantenere il file self-contained.
 * Nel progetto reale, sostituire con la chiamata al service/DAO già
 * implementato per la ricerca risorse (es. resourceSearchService.searchResources).
 */
async function mockSearchResources(
  filter: AdminResourceSearchFilter,
): Promise<AdminResourceSearchResponse> {
  // Integrazione reale da fare collegandosi al motore di ricerca esistente.
  // Qui ritorniamo una risposta statica solo per consentire lo sviluppo UI end-to-end.

  const all: AdminResourceSummaryDto[] = [
    {
      id: '1',
      fullName: 'Mario Rossi',
      roleName: 'Software Engineer',
      keySkills: ['Java', 'Spring', 'SQL', 'Docker'],
    },
    {
      id: '2',
      fullName: 'Luigi Bianchi',
      roleName: 'Project Manager',
      keySkills: ['PMI', 'Agile', 'Scrum'],
    },
  ];

  const filtered = all.filter((r) => {
    let ok = true;
    if (filter.q) {
      const qLower = filter.q.toLowerCase();
      ok = ok && r.fullName.toLowerCase().includes(qLower);
    }
    if (filter.roles && filter.roles.length > 0) {
      ok = ok && filter.roles.some((role) =>
        r.roleName.toLowerCase().includes(role.toLowerCase()),
      );
    }
    if (filter.skills && filter.skills.length > 0) {
      ok = ok && filter.skills.every((s) =>
        r.keySkills.map((k) => k.toLowerCase()).includes(s.toLowerCase()),
      );
    }
    return ok;
  });

  const start = (filter.page - 1) * filter.pageSize;
  const end = start + filter.pageSize;
  const pageItems = filtered.slice(start, end);
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / filter.pageSize));

  return {
    items: pageItems,
    page: filter.page,
    pageSize: filter.pageSize,
    totalItems,
    totalPages,
  };
}
