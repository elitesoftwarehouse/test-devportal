import { Request, Response, Router } from "express";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { AuthActivationService } from "../services/AuthActivationService";
import { UserStatus, isActiveStatus } from "../models/UserStatus";

export class AuthController {
  public router: Router;
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.router = Router();
    this.dataSource = dataSource;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/login", this.login);
    this.router.get("/activate/:token", this.activateAccount);
  }

  private login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const userRepo = this.dataSource.getRepository(User);

    try {
      const user = await userRepo.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          success: false,
          code: "INVALID_CREDENTIALS",
          message: "Credenziali non valide."
        });
      }

      if (user.status === UserStatus.PENDING_ACTIVATION) {
        return res.status(403).json({
          success: false,
          code: "ACCOUNT_NOT_ACTIVE",
          message: "Il tuo account non è ancora attivo. Verifica l'email di attivazione."
        });
      }

      if (!isActiveStatus(user.status)) {
        return res.status(403).json({
          success: false,
          code: "ACCOUNT_NOT_ACTIVE",
          message: "Il tuo account non è abilitato all'accesso. Contatta l'amministratore."
        });
      }

      const passwordValid = await compare(password, user.passwordHash);
      if (!passwordValid) {
        return res.status(401).json({
          success: false,
          code: "INVALID_CREDENTIALS",
          message: "Credenziali non valide."
        });
      }

      const token = sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "dev-secret",
        { expiresIn: "8h" }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          status: user.status
        }
      });
    } catch (error) {
      console.error("[AuthController] Errore login", error);
      return res.status(500).json({
        success: false,
        code: "LOGIN_ERROR",
        message: "Si è verificato un errore durante il login."
      });
    }
  };

  private activateAccount = async (req: Request, res: Response) => {
    const { token } = req.params;
    const activationService = new AuthActivationService(this.dataSource);

    try {
      const result = await activationService.activateByToken(token);

      if (!result.success && result.code === "TOKEN_INVALID") {
        console.warn("[AuthController] Attivazione fallita: token non valido");
        return res.status(400).json(result);
      }

      if (!result.success && result.code === "TOKEN_EXPIRED") {
        console.warn("[AuthController] Attivazione fallita: token scaduto");
        return res.status(410).json(result);
      }

      if (!result.success && result.code === "TOKEN_USED") {
        console.warn("[AuthController] Attivazione fallita: token già utilizzato");
        return res.status(409).json(result);
      }

      if (!result.success && result.code === "USER_NOT_FOUND") {
        console.error("[AuthController] Attivazione fallita: utente non trovato per token valido");
        return res.status(404).json(result);
      }

      if (result.success && result.code === "ACTIVATION_SUCCESS") {
        console.info("[AuthController] Account attivato con successo");
        return res.json(result);
      }

      if (result.success && result.code === "ACCOUNT_ALREADY_ACTIVE") {
        console.info("[AuthController] Account già attivo");
        return res.json(result);
      }

      console.error("[AuthController] Stato inatteso per attivazione", result);
      return res.status(500).json({
        success: false,
        code: "ACTIVATION_ERROR",
        message: "Si è verificato un errore durante l'attivazione dell'account."
      });
    } catch (error) {
      console.error("[AuthController] Errore attivazione account", error);
      return res.status(500).json({
        success: false,
        code: "ACTIVATION_ERROR",
        message: "Si è verificato un errore durante l'attivazione dell'account."
      });
    }
  };
}
