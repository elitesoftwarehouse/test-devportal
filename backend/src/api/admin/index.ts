import { Router } from 'express';
import { adminResourcesSearchRouter } from './resourcesSearchRoutes';

// Router principale per le funzionalità amministrative.
const adminRouter = Router();

// Monta il router di ricerca risorse admin su /resources
adminRouter.use('/', adminResourcesSearchRouter);

export default adminRouter;
