import { Router } from "express";
import { validate } from "../middleware/validation.middleware";
import { couponCreateSchema, couponUpdateSchema, paginationSchema } from "../validators/admin.validators";
import { getCoupons, getCouponById, createCoupon, updateCoupon, toggleCouponStatus, deleteCoupon } from "../controllers/coupon.controller";
import { authMiddleware, adminOnlyMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, adminOnlyMiddleware, validate(paginationSchema), getCoupons);
router.get("/:id", authMiddleware, adminOnlyMiddleware, getCouponById);
router.post("/", authMiddleware, adminOnlyMiddleware, validate(couponCreateSchema), createCoupon);
router.put("/:id", authMiddleware, adminOnlyMiddleware, validate(couponUpdateSchema), updateCoupon);
router.patch("/:id/status", authMiddleware, adminOnlyMiddleware, toggleCouponStatus);
router.delete("/:id", authMiddleware, adminOnlyMiddleware, deleteCoupon);

export default router;