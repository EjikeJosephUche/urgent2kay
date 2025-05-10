import { Router } from "express";
import {
  create,
  getMyBills,
  updateStatus,
} from "../controllers/bill.controller";
import authMiddleware, { authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router();

router.use(authMiddleware);

router.post("/", authorize(UserRole.BILL_OWNER), create); //here ⚠️⚠️⚠️

router.get("/my-bills", authorize(UserRole.MERCHANT), getMyBills); //here ⚠️⚠️⚠️

router.patch("/:billId/status", authorize(UserRole.MERCHANT), updateStatus); //here ⚠️⚠️⚠️

export default router;
