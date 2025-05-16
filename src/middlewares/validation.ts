//lots of console logs to aid debugging

import { Request, Response, NextFunction } from "express";
import { getValidationFields } from "../utils";

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

type Fields = {
  body: string[]
  query: string[]
  params: string[]
}

export const validateRequest = (schema: {[key: string]: any}, fields: Partial<Fields>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (fields.body) {
      req.body = await getValidationFields(schema, fields.body).validateAsync(req.body);
    }

    if (fields.query) {
      req.query = await getValidationFields(schema, fields.query).validateAsync(req.query);
    }

    if (fields.params) {
      req.params = await getValidationFields(schema, fields.params).validateAsync(req.params);
    }

    next();
  }