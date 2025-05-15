import express from "express";
import { Request, Response, NextFunction } from "express";
import {
  registerMerchant,
  getMerchantStatus,
} from "../controllers/partner.controller";
import { validateMerchantRegistration } from "../middlewares/validation";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, JPEG, or PNG are allowed."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/register",
  upload.single("ownershipProof"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (typeof req.body.business === "string")
        req.body.business = JSON.parse(req.body.business);
      if (typeof req.body.personal === "string")
        req.body.personal = JSON.parse(req.body.personal);
      if (typeof req.body.bank === "string")
        req.body.bank = JSON.parse(req.body.bank);

      next();
    } catch (err) {
      console.log("2. JSON parsing failed");
      // Clean up file if JSON parsing fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(400).json({ error: "Invalid form data" });
      return;
    }
  },

  (req: Request, res: Response, next: NextFunction) => {
    next();
  },
  validateMerchantRegistration,
  (req: Request, res: Response, next: NextFunction) => {
    next();
  },
  registerMerchant,
  (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log("5. Error handler reached");
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({ error: "Internal server error" });
  }
);

router.get("/:id/status", getMerchantStatus);

export default router;
