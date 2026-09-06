import { Router } from "express";
import { getCustomerById, getCustomers, updateCustomerStatus } from "../controllers/customer.controller";
import { adminOnlyMiddleware, authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { customerFilterSchema } from "../validators/admin.validators";
import { customerStatusSchema, idParamSchema } from "../validators/storefront.validators";

const router = Router();
router.use(authMiddleware, adminOnlyMiddleware);
router.get("/", validate(customerFilterSchema), getCustomers);
router.get("/:id", validate(idParamSchema), getCustomerById);
router.patch("/:id/status", validate(customerStatusSchema), updateCustomerStatus);
export default router;
