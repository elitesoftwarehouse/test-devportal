import { Router } from 'express';
import { searchResources, validateResourceSearch } from './resourcesSearch.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Altre route risorse esistenti qui...

router.get(
  '/search',
  authenticate,
  validateResourceSearch,
  searchResources
);

export default router;
