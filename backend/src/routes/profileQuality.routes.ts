import { Router, Request, Response } from 'express';

// Questo router fornisce API di supporto ai test/FE per la vista profili
// Segue gli stessi pattern degli altri router dell'applicazione.

const router = Router();

export type ProfileType = 'PROFESSIONISTA' | 'AZIENDA' | 'COLLABORATORE';

export interface ProfileQualityItem {
  id: string;
  nome: string;
  tipo: ProfileType;
  completezza: number; // 0-100
  statoQualita: 'OK' | 'WARNING' | 'KO';
  campiMancanti: string[];
}

// Mock di dati per test e sviluppo FE
const MOCK_PROFILES: ProfileQualityItem[] = [
  {
    id: 'p1',
    nome: 'Mario Rossi',
    tipo: 'PROFESSIONISTA',
    completezza: 100,
    statoQualita: 'OK',
    campiMancanti: []
  },
  {
    id: 'p2',
    nome: 'Acme S.p.A.',
    tipo: 'AZIENDA',
    completezza: 72,
    statoQualita: 'WARNING',
    campiMancanti: ['Indirizzo sede legale', 'PEC']
  },
  {
    id: 'p3',
    nome: 'Luca Bianchi',
    tipo: 'COLLABORATORE',
    completezza: 38,
    statoQualita: 'KO',
    campiMancanti: ['Codice fiscale', 'Telefono', 'Indirizzo']
  }
];

// GET /api/profile-quality
// Query supportate (semplici, per mock e test):
// - tipo: PROFESSIONISTA|AZIENDA|COLLABORATORE (opzionale, stringa o lista separata da virgola)
// - minCompletezza: number (opzionale)
// - orderBy: 'nome'|'completezza' (opzionale)
// - order: 'asc'|'desc' (opzionale)
router.get('/', (req: Request, res: Response) => {
  const { tipo, minCompletezza, orderBy, order } = req.query;

  let results = [...MOCK_PROFILES];

  if (tipo) {
    const tipiRichiesti = String(tipo)
      .split(',')
      .map((t) => t.trim().toUpperCase()) as ProfileType[];
    results = results.filter((p) => tipiRichiesti.includes(p.tipo));
  }

  if (minCompletezza) {
    const min = Number(minCompletezza);
    if (!Number.isNaN(min)) {
      results = results.filter((p) => p.completezza >= min);
    }
  }

  if (orderBy === 'nome') {
    results.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  if (orderBy === 'completezza') {
    results.sort((a, b) => a.completezza - b.completezza);
  }

  if (order === 'desc') {
    results.reverse();
  }

  res.json({
    items: results,
    total: results.length
  });
});

export default router;
