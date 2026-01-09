import { Router } from "express";
import { AppDataSource } from "../datasource";
import { AuthController } from "../controllers/AuthController";

const router = Router();

const controller = new AuthController(AppDataSource);

router.post("/login", controller.router);
router.use("/", controller.router);

export default router;
