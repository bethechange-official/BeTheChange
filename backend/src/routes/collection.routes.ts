import { Router } from "express";
import { validate } from "../middleware/validation.middleware";
import { collectionCreateSchema, collectionProductsSchema, collectionUpdateSchema } from "../validators/admin.validators";
import { getCollections, createCollection, updateCollection, deleteCollection, setCollectionProducts } from "../controllers/collection.controller";
import { authMiddleware, adminOnlyMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, adminOnlyMiddleware, getCollections);
router.post("/", authMiddleware, adminOnlyMiddleware, validate(collectionCreateSchema), createCollection);
router.put("/:id", authMiddleware, adminOnlyMiddleware, validate(collectionUpdateSchema), updateCollection);
router.put("/:id/products", authMiddleware, adminOnlyMiddleware, validate(collectionProductsSchema), setCollectionProducts);
router.delete("/:id", authMiddleware, adminOnlyMiddleware, deleteCollection);

export default router;