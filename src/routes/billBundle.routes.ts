import { Router } from "express";
import {
  createBundle,
  getBundleWithLink,
  shareBundle,
} from "../controllers/billBundle.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { verifyBundleLink } from "../middlewares/verifyBundleLink";
import { body } from "express-validator";
import { RequestHandler } from "express";

const router = Router();

router.post(
  "/create",
  authMiddleware as RequestHandler,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("bills")
      .isArray({ min: 1 })
      .withMessage("You must have least one bill"),
    body("bills.*").isMongoId().withMessage("Invalid bill ID"),
    body("sponsorEmail").isEmail().normalizeEmail(),
    body("description").optional().isString(),
  ],
  createBundle
);

router.get(
  "/:uniqueLink",
  verifyBundleLink,
  (req, res) => {
    res.json({
      success: true,
      bundle: req.bundle,
    });
  },
  getBundleWithLink
);

router.post(
  "/:id/share",
  authMiddleware,
  [body("sponsorEmail").isEmail().normalizeEmail()],
  verifyBundleLink, // watch here for error ⚠️
  shareBundle
);

export default router;
