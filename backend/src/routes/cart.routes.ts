import { Router } from "express";
import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from "../controllers/cart.controller";
import { optionalAuthMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { cartAddSchema, cartItemParamSchema, cartUpdateSchema } from "../validators/storefront.validators";

const router = Router();
router.use(optionalAuthMiddleware);
router.get("/", getCart);
router.post("/items", validate(cartAddSchema), addCartItem);
router.put("/items/:productId", validate(cartUpdateSchema), updateCartItem);
router.delete("/items/:productId", validate(cartItemParamSchema), removeCartItem);
router.delete("/clear", clearCart);
export default router;
