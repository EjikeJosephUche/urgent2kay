import express from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { createBillHandler, getMyBills } from "../controllers/bill.controller";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createBillHandler);
router.get("/my-bills", getMyBills);

export default router;
