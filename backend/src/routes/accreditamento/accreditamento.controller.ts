import { Router, Request, Response } from 'express';
import { CompanyAccreditationService } from '../../domain/accreditamento/companyAccreditation.service';
import { CompanyRepositoryImpl } from '../../infrastructure/accreditamento/company.repository.impl';
import { UserCompanyOwnershipRepositoryImpl } from '../../infrastructure/accreditamento/userCompanyOwnership.repository.impl';

export const accreditamentoRouter = Router();

function buildServiceFromRequest(req: Request): CompanyAccreditationService {
  const dataSource = (req as any).dataSource;
  const companyRepo = new CompanyRepositoryImpl(dataSource);
  const ownershipRepo = new UserCompanyOwnershipRepositoryImpl(dataSource);
  return new CompanyAccreditationService(companyRepo, ownershipRepo);
}

function getUserFromHeaders(req: Request) {
  const id = (req.headers['x-test-user-id'] as string) || 'anonymous';
  const rolesHeader = (req.headers['x-test-user-roles'] as string) || '';
  const roles = rolesHeader.split(',').filter(Boolean);
  return { id, roles };
}

accreditamentoRouter.post('/companies', async (req: Request, res: Response) => {
  try {
    const user = getUserFromHeaders(req);
    if (!user.roles.includes('EXTERNAL_OWNER')) {
      return res.status(403).json({ errorCode: 'NOT_AUTHORIZED' });
    }

    const service = buildServiceFromRequest(req);
    const company = await service.createDraftCompany(req.body, user.id);
    return res.status(201).json(company);
  } catch (err: any) {
    if (err.message === 'VAT_ALREADY_EXISTS') {
      return res.status(409).json({ errorCode: 'VAT_ALREADY_EXISTS' });
    }
    if (err.message === 'VALIDATION_ERROR') {
      return res.status(400).json({ errorCode: 'VALIDATION_ERROR' });
    }
    return res.status(500).json({ errorCode: 'GENERIC_ERROR' });
  }
});

accreditamentoRouter.post('/companies/:id/confirm', async (req: Request, res: Response) => {
  try {
    const user = getUserFromHeaders(req);
    const service = buildServiceFromRequest(req);
    const company = await service.confirmAccreditation(req.params.id, user.id, req.body);
    return res.json(company);
  } catch (err: any) {
    if (err.message === 'NOT_AUTHORIZED') {
      return res.status(403).json({ errorCode: 'NOT_AUTHORIZED' });
    }
    return res.status(500).json({ errorCode: 'GENERIC_ERROR' });
  }
});

accreditamentoRouter.put('/companies/:id', async (req: Request, res: Response) => {
  try {
    const user = getUserFromHeaders(req);
    const service = buildServiceFromRequest(req);
    const updated = await service.updateCompanyIfOwner(req.params.id, user.id, req.body);
    return res.json(updated);
  } catch (err: any) {
    if (err.message === 'NOT_AUTHORIZED') {
      return res.status(403).json({ errorCode: 'NOT_AUTHORIZED' });
    }
    return res.status(500).json({ errorCode: 'GENERIC_ERROR' });
  }
});
