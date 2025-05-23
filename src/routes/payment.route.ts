import express from "express";
import { handlePaystackWebhook } from "../controllers/webhook.controller";
import {
  initializePayment,
  verifyPayment,
  chargeAuthorization,
} from "../controllers/payment.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { createBulkTransfer } from "../controllers/transfer.controller";

const router = express.Router();
// Important: use express.raw for webhook signature validation
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handlePaystackWebhook
);

router.post("/initialize", express.json(), authMiddleware, initializePayment);
router.get("/verify", express.json(), verifyPayment);
router.post("/charge", express.json(), authMiddleware, chargeAuthorization);
router.post("/bulk-transfer", express.json(), createBulkTransfer);

export default router;
