import { Router } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { adminLoginSchema } from "../validators/admin.validators";
import { adminLogin, adminLogout, refreshAccessToken, getAdminProfile } from "../controllers/auth.controller";
import { authMiddleware, adminOnlyMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", validate(adminLoginSchema), adminLogin);
router.post("/logout", authMiddleware, adminOnlyMiddleware, adminLogout);
router.post("/refresh", refreshAccessToken);
router.get("/me", authMiddleware, adminOnlyMiddleware, getAdminProfile);

export default router;