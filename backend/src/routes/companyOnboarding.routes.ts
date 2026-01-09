import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/requireRole";
import { CompanyOnboardingService } from "../services/CompanyOnboardingService";

const router = Router();
const service = new CompanyOnboardingService();

// Helper per gestione errori di validazione
const handleValidation = (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Dati non validi",
      details: errors.array(),
    });
  }
};

// Recupera stato onboarding per l'utente corrente
router.get(
  "/me/onboarding/company",
  authMiddleware,
  requireRole(["EXTERNAL_OWNER"]),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const status = await service.getOnboardingStatusForUser(userId);
      return res.json(status);
    } catch (err: any) {
      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Errore nel recupero dello stato di onboarding",
      });
    }
  }
);

// Crea bozza azienda + associa owner (step 1)
router.post(
  "/onboarding/company/draft",
  authMiddleware,
  requireRole(["EXTERNAL_OWNER"]),
  [
    body("ragioneSociale").isString().trim().notEmpty().isLength({ max: 255 }),
    body("partitaIva")
      .isString()
      .trim()
      .notEmpty()
      .isLength({ min: 11, max: 16 }),
    body("codiceFiscale")
      .optional({ nullable: true })
      .isString()
      .trim()
      .isLength({ max: 16 }),
    body("emailAziendale").isString().trim().notEmpty().isEmail().isLength({ max: 255 }),
    body("telefono")
      .isString()
      .trim()
      .notEmpty()
      .isLength({ max: 30 }),
  ],
  async (req: Request, res: Response) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    try {
      const userId = (req as any).user.id;
      const {
        ragioneSociale,
        partitaIva,
        codiceFiscale,
        emailAziendale,
        telefono,
      } = req.body;

      const draft = await service.createDraftCompanyWithOwner(userId, {
        ragioneSociale,
        partitaIva,
        codiceFiscale: codiceFiscale || null,
        emailAziendale,
        telefono,
      });

      return res.status(201).json(draft);
    } catch (err: any) {
      if (err.code === "COMPANY_VAT_CONFLICT") {
        return res.status(409).json({
          error: "COMPANY_VAT_CONFLICT",
          message: "Esiste già un'azienda con la stessa partita IVA",
        });
      }
      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Errore nella creazione della bozza azienda",
      });
    }
  }
);

// Aggiorna dati sede legale (step 2) e altri dati opzionali
router.put(
  "/onboarding/company/:companyId",
  authMiddleware,
  requireRole(["EXTERNAL_OWNER"]),
  [
    body("sedeLegale.indirizzo").isString().trim().notEmpty().isLength({ max: 255 }),
    body("sedeLegale.cap").isString().trim().notEmpty().isLength({ max: 10 }),
    body("sedeLegale.citta").isString().trim().notEmpty().isLength({ max: 100 }),
    body("sedeLegale.provincia").isString().trim().notEmpty().isLength({ max: 100 }),
    body("sedeLegale.stato").isString().trim().notEmpty().isLength({ max: 100 }),
  ],
  async (req: Request, res: Response) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    try {
      const userId = (req as any).user.id;
      const companyId = req.params.companyId;
      const { sedeLegale } = req.body;

      const updated = await service.updateCompanyDraft(userId, companyId, {
        sedeLegale,
      });

      return res.json(updated);
    } catch (err: any) {
      if (err.code === "COMPANY_NOT_FOUND") {
        return res.status(404).json({
          error: "COMPANY_NOT_FOUND",
          message: "Azienda non trovata o non accessibile",
        });
      }
      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Errore nell'aggiornamento dei dati aziendali",
      });
    }
  }
);

// Conferma accreditamento (step 3)
router.post(
  "/onboarding/company/:companyId/confirm",
  authMiddleware,
  requireRole(["EXTERNAL_OWNER"]),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const companyId = req.params.companyId;

      const result = await service.confirmCompanyOnboarding(userId, companyId);

      return res.json(result);
    } catch (err: any) {
      if (err.code === "COMPANY_NOT_FOUND") {
        return res.status(404).json({
          error: "COMPANY_NOT_FOUND",
          message: "Azienda non trovata o non accessibile",
        });
      }
      if (err.code === "ONBOARDING_ALREADY_COMPLETED") {
        return res.status(409).json({
          error: "ONBOARDING_ALREADY_COMPLETED",
          message: "L'accreditamento risulta già completato",
        });
      }
      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Errore nella conferma dell'accreditamento",
      });
    }
  }
);

export default router;
