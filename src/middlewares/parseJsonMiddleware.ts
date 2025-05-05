import { Request, Response, NextFunction } from "express";
export const parseJsonMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (typeof req.body.business === "string") {
      req.body.business = JSON.parse(req.body.business);
    }
    if (typeof req.body.personal === "string") {
      req.body.personal = JSON.parse(req.body.personal);
    }
    if (typeof req.body.bank === "string") {
      req.body.bank = JSON.parse(req.body.bank);
    }
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid form data" });
    return;
  }
};
