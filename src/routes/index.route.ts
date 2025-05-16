import express from "express";
import authRoutes from "./auth.route";
import paymentRoutes from "./payment.route";
// import userRoutes from "./user.route";
import billRoute from "./bill.routes";
import partnerRoute from "./partner.routes";
import billBundleRoutes from "./billBundle.routes";
import relationshipRoutes from "./relationship.routes";
import servicesRoutes from "./services.route";

const router = express.Router();


router.use("/auth", authRoutes);
router.use("/payment", paymentRoutes);
router.use("/bills", billRoute);
router.use("/bill-bundle", billBundleRoutes); //newest
router.use("/partner", partnerRoute);
// router.use("/user", userRoutes);
router.use("/relationship", relationshipRoutes);
router.use("/services", servicesRoutes);


export default router;
