import { Router } from "express";
import {
  create,
  getMyBills,
  updateStatus,
} from "../controllers/bill.controller";
// import authMiddleware, { authorize } from "../middlewares/auth.middleware";
// import { UserRole } from "../interfaces/user.interface";

const router = Router();

// router.use(authMiddleware);

router.post("/", create); //here ⚠️⚠️⚠️

router.get("/my-bills", getMyBills); //here ⚠️⚠️⚠️

router.patch("/:billId/status", updateStatus); //here ⚠️⚠️⚠️

export default router;

// middleware removed uncomment for prod⚠️
// authorize(UserRole.BILL_OWNER),
//   authorize(UserRole.MERCHANT),
//   authorize(UserRole.MERCHANT),
