import { Router } from 'express';
import { accreditamentoTestingRouter } from './accreditamentoTesting.controller';

export const testingRouter = Router();

testingRouter.use('/accreditamento', accreditamentoTestingRouter);
