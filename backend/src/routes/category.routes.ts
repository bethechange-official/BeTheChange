import { Router } from "express";
import { validate } from "../middleware/validation.middleware";
import { categoryCreateSchema, categoryUpdateSchema } from "../validators/admin.validators";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller";
import { authMiddleware, adminOnlyMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, adminOnlyMiddleware, getCategories);
router.post("/", authMiddleware, adminOnlyMiddleware, validate(categoryCreateSchema), createCategory);
router.put("/:id", authMiddleware, adminOnlyMiddleware, validate(categoryUpdateSchema), updateCategory);
router.delete("/:id", authMiddleware, adminOnlyMiddleware, deleteCategory);

export default router;