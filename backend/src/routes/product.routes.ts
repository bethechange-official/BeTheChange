import { Router } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { productCreateSchema, productUpdateSchema, paginationSchema, productFilterSchema } from "../validators/admin.validators";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/product.controller";
import { authMiddleware, adminOnlyMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, adminOnlyMiddleware, validate(productFilterSchema), getProducts);
router.get("/:id", authMiddleware, adminOnlyMiddleware, getProductById);
router.post("/", authMiddleware, adminOnlyMiddleware, validate(productCreateSchema), createProduct);
router.put("/:id", authMiddleware, adminOnlyMiddleware, validate(productUpdateSchema), updateProduct);
router.delete("/:id", authMiddleware, adminOnlyMiddleware, deleteProduct);

export default router;