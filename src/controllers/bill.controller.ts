import { Request, Response, NextFunction } from "express";
import { createBill, getBillsByOwner } from "../services/bill.service";

export const createBillHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bill = await createBill({ ...req.body, owner: req.userId?._id });

    res.status(201).json({
      status: "Success",
      data: {
        bill,
      },
    });
  } catch (error: any) {
    next(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Failed to create Bill Bundle 😞" });
  }
};

export const getMyBills = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId?._id) {
      throw new Error("User ID is required");
    }
    const bills = await getBillsByOwner(req.userId._id);

    res.status(200).json({
      status: "Success",
      data: { bills },
    });
  } catch (error: any) {
    next(error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to get all user bills",
    });
  }
};
