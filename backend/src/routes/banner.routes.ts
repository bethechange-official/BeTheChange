import { Router } from "express";
import { validate } from "../middleware/validation.middleware";
import { bannerCreateSchema, bannerReorderSchema, bannerUpdateSchema } from "../validators/admin.validators";
import { getBanners, createBanner, updateBanner, reorderBanners, deleteBanner } from "../controllers/banner.controller";
import { authMiddleware, adminOnlyMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, adminOnlyMiddleware, getBanners);
router.post("/", authMiddleware, adminOnlyMiddleware, validate(bannerCreateSchema), createBanner);
router.put("/reorder", authMiddleware, adminOnlyMiddleware, validate(bannerReorderSchema), reorderBanners);
router.put("/:id", authMiddleware, adminOnlyMiddleware, validate(bannerUpdateSchema), updateBanner);
router.delete("/:id", authMiddleware, adminOnlyMiddleware, deleteBanner);

export default router;
