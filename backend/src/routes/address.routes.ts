import { Router } from "express";
import { createAddress, deleteAddress, getAddresses, updateAddress } from "../controllers/address.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { addressCreateSchema, addressUpdateSchema, idParamSchema } from "../validators/storefront.validators";

const router = Router();
router.use(authMiddleware);
router.get("/", getAddresses);
router.post("/", validate(addressCreateSchema), createAddress);
router.put("/:id", validate(addressUpdateSchema), updateAddress);
router.delete("/:id", validate(idParamSchema), deleteAddress);
export default router;
