import { Router } from "express";
import { getStorefrontCategory, listStorefrontCategories } from "../controllers/storefront.category.controller";

const router = Router();
router.get("/", listStorefrontCategories);
router.get("/:slug", getStorefrontCategory);
export default router;
