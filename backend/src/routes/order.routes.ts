import { Router } from "express";
import { validate } from "../middleware/validation.middleware";
import { orderFilterSchema, orderStatusUpdateSchema } from "../validators/admin.validators";
import { getOrders, getOrderById, updateOrderStatus } from "../controllers/order.controller";
import { authMiddleware, adminOnlyMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, adminOnlyMiddleware, validate(orderFilterSchema), getOrders);
router.get("/:id", authMiddleware, adminOnlyMiddleware, getOrderById);
router.patch("/:id/status", authMiddleware, adminOnlyMiddleware, validate(orderStatusUpdateSchema), updateOrderStatus);

export default router;