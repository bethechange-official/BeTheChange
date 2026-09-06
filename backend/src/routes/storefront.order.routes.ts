import { Router } from "express";
import { createStorefrontOrder, getMyOrderByNumber, getMyOrders } from "../controllers/storefront.order.controller";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { createOrderSchema } from "../validators/storefront.validators";

const router = Router();
router.post("/", optionalAuthMiddleware, validate(createOrderSchema), createStorefrontOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/:orderNumber", authMiddleware, getMyOrderByNumber);
export default router;
