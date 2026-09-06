import { Router } from "express";
import { getStorefrontProduct, listFeaturedProducts, listStorefrontProducts } from "../controllers/storefront.product.controller";

const router = Router();
router.get("/", listStorefrontProducts);
router.get("/featured", listFeaturedProducts);
router.get("/:slug", getStorefrontProduct);
export default router;
