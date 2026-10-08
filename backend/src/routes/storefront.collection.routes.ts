import { Router } from "express";
import { getStorefrontCollection, listStorefrontCollections } from "../controllers/storefront.collection.controller";

const router = Router();
router.get("/", listStorefrontCollections);
router.get("/:slug", getStorefrontCollection);
export default router;
