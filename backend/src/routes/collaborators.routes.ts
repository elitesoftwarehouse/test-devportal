import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/collaborators/options
router.get('/options', async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      'SELECT id, name, email FROM collaborators ORDER BY name ASC'
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching collaborators options', error);
    return res.status(500).json({ message: 'Errore nel recupero dei collaboratori.' });
  }
});

export default router;
