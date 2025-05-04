import express from "express";
import authRoutes from "./auth.route";
import paymentRoutes from "./payment.route";
import billRouter from "./bill.routes";
// import userRoutes from "./user.route";
import relationshipRoutes from './relationship.routes';

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/payment", paymentRoutes);
router.use("/bills", billRouter);
// router.use("/user", userRoutes);
router.use('/relationship', relationshipRoutes);

export default router;
