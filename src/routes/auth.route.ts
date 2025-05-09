import express, { Request, Response } from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
// import { verifyToken } from "../middlewares/auth.middleware";
// import { verifyEmail } from "../controllers/auth.controller";
// import { verifyPayment } from "../controllers/paymentController";
// import { verifyUser } from "../middlewares/user.middleware";

const router = express.Router();

// Auth routes
router.post("/register", (req: Request, res: Response) => {
  authController.register(req, res);
});
router.post("/login", (req: Request, res: Response) => {
  authController.login(req, res);
});
router.post("/logout", (req: Request, res: Response) => {
  authController.logout(req, res);
});

router.post("/forgot-password", (req: Request, res: Response) => {
  authController.forgotPassword(req, res);
});
router.post("/reset-password", (req: Request, res: Response) => {
  authController.resetPassword(req, res);
});
// router.post(
//   "/update-password",
//   authMiddleware.verifyToken,
//   (req: Request, res: Response) => {
//     authController.updatePassword(req, res);
//   }
// );
router.post("/refresh-token", (req: Request, res: Response) => {
  authController.refreshToken(req, res);
});
router.get("/verify-email", (req: Request, res: Response) => {
  authController.verifyEmail(req, res);
});
router.post("/resend-verification-email", (req: Request, res: Response) => {
  authController.resendVerificationEmail(req, res);
});
export default router;
