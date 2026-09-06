import { Router } from "express";
import { submitContact, validateCoupon } from "../controllers/storefront.misc.controller";
import { validate } from "../middleware/validation.middleware";
import { contactSchema, couponValidationSchema } from "../validators/storefront.validators";

const router = Router();
router.post("/coupons/validate", validate(couponValidationSchema), validateCoupon);
router.post("/contact", validate(contactSchema), submitContact);
export default router;
