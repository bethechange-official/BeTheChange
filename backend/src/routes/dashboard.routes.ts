import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { authMiddleware, adminOnlyMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, adminOnlyMiddleware, getDashboardStats);

export default router;