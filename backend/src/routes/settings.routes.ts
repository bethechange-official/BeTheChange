import { Router } from "express";
import { validate } from "../middleware/validation.middleware";
import { settingsUpdateSchema } from "../validators/admin.validators";
import { getSettings, updateSettings } from "../controllers/settings.controller";
import { authMiddleware, adminOnlyMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, adminOnlyMiddleware, getSettings);
router.put("/", authMiddleware, adminOnlyMiddleware, validate(settingsUpdateSchema), updateSettings);

export default router;