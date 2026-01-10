import express, { Request, Response, NextFunction } from 'express';
import { FornitoreService } from '../services/FornitoreService';
import { FornitoreRepository } from '../repositories/FornitoreRepository';
import { AppDataSource } from '../config/dataSource';

const router = express.Router();

function getCurrentUserId(req: Request): string | null {
  const anyReq: any = req as any;
  if (anyReq.user && anyReq.user.id) {
    return String(anyReq.user.id);
  }
  return null;
}

const fornitoreRepository = new FornitoreRepository(AppDataSource);
const fornitoreService = new FornitoreService(fornitoreRepository);

router.post('/fornitori', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = getCurrentUserId(req);
    const result = await fornitoreService.createFornitore(req.body, currentUserId);

    if ('status' in result && 'code' in result) {
      return res.status(result.status).json({
        success: false,
        error: {
          code: result.code,
          message: result.message,
          details: result.details ?? null
        }
      });
    }

    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
});

router.get('/fornitori', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = (req.query.search as string) || undefined;
    const attivoParam = req.query.attivo as string | undefined;
    const pageParam = req.query.page as string | undefined;
    const pageSizeParam = req.query.pageSize as string | undefined;

    let attivo: boolean | null | undefined = undefined;
    if (attivoParam === 'true') attivo = true;
    else if (attivoParam === 'false') attivo = false;

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 20;

    const result = await fornitoreService.listFornitori({ search, attivo, page, pageSize });

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize
      }
    });
  } catch (err) {
    return next(err);
  }
});

router.get('/fornitori/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const result = await fornitoreService.getFornitore(id);

    if ('status' in result && 'code' in result) {
      return res.status(result.status).json({
        success: false,
        error: {
          code: result.code,
          message: result.message,
          details: result.details ?? null
        }
      });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
});

router.patch('/fornitori/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const currentUserId = getCurrentUserId(req);
    const result = await fornitoreService.updateFornitore(id, req.body, currentUserId);

    if ('status' in result && 'code' in result) {
      return res.status(result.status).json({
        success: false,
        error: {
          code: result.code,
          message: result.message,
          details: result.details ?? null
        }
      });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
});

router.put('/fornitori/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const currentUserId = getCurrentUserId(req);
    const result = await fornitoreService.updateFornitore(id, req.body, currentUserId);

    if ('status' in result && 'code' in result) {
      return res.status(result.status).json({
        success: false,
        error: {
          code: result.code,
          message: result.message,
          details: result.details ?? null
        }
      });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
});

router.patch('/fornitori/:id/stato', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const currentUserId = getCurrentUserId(req);
    const result = await fornitoreService.updateStatoFornitore(id, req.body, currentUserId);

    if ('status' in result && 'code' in result) {
      return res.status(result.status).json({
        success: false,
        error: {
          code: result.code,
          message: result.message,
          details: result.details ?? null
        }
      });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
});

export default router;
