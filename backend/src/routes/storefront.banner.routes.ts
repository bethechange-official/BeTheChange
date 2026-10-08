import { Router } from "express";
import { getActiveBanners } from "../controllers/banner.controller";

const router = Router();
router.get("/", getActiveBanners);
export default router;
