import { Router } from "express";
import {
  getCustomerProfile,
  loginCustomer,
  logoutCustomer,
  refreshCustomerToken,
  registerCustomer,
  updateCustomerProfile,
} from "../controllers/customer.auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { customerLoginSchema, customerRegisterSchema, customerUpdateProfileSchema } from "../validators/customer.auth.validators";

const router = Router();

router.post("/register", validate(customerRegisterSchema), registerCustomer);
router.post("/login", validate(customerLoginSchema), loginCustomer);
router.post("/refresh", refreshCustomerToken);
router.post("/logout", logoutCustomer);
router.get("/me", authMiddleware, getCustomerProfile);
router.put("/profile", authMiddleware, validate(customerUpdateProfileSchema), updateCustomerProfile);

export default router;
