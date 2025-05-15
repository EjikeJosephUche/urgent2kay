//lots of console logs to aid debugging

import { Request, Response, NextFunction } from "express";

export const validateMerchantRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors: string[] = [];

  try {
    console.log("Validating:", req.body);
    const { business, personal, bank } = req.body;

    if (!business?.businessName) errors.push("Business name is required");
    if (!business?.businessRegNumber)
      errors.push("Registration number is required");

    if (!personal?.firstname) errors.push("First name is required");
    if (!personal?.lastname) errors.push("Last name is required");
    if (
      !personal?.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email)
    ) {
      errors.push("Valid email is required");
    }

    if (!bank?.accountName) errors.push("Account name is required");
    if (!bank?.accountNumber || !/^\d{9,18}$/.test(bank.accountNumber)) {
      console.log(
        "Validation failed: missing or invalid account number length"
      );
      errors.push("Valid account number (9-18 digits) is required");
    }

    if (!req.file) errors.push("Business proof document is required");

    if (errors.length > 0) {
      res.status(400).json({ errors });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Validation error" });
    return;
  }
};
