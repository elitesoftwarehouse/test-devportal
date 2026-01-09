import { Router } from 'express';
import { professionalProfileController } from '../controllers/professionalProfileController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/professional-profile', (req, res, next) => professionalProfileController.getCurrent(req, res, next));
router.post('/professional-profile', (req, res, next) => professionalProfileController.create(req, res, next));
router.put('/professional-profile', (req, res, next) => professionalProfileController.update(req, res, next));
router.patch('/professional-profile', (req, res, next) => professionalProfileController.update(req, res, next));

export default router;
