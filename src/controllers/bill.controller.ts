import { Request, Response } from "express";
import {
  createBill,
  getBillsByOwner,
  updateBillStatus,
} from "../services/bill.service";
import { sendSuccessResponse, sendErrorResponse } from "../utils/apiResponse";
import { Merchant } from "../models/merchant.model";

export const create = async (req: Request, res: Response) => {
  try {
    const {
      owner,
      merchant,
      amount,
      dueDate,
      referenceNumber,
      category,
      description,
    } = req.body;

    //validate category fileds
    if (!category) {
      sendErrorResponse(res, "Category is required", null, 400);
      return;
    }

    // Verify service provider exists
    const provider = await Merchant.findById(merchant);
    if (!provider) {
      sendErrorResponse(res, "Service provider not found", null, 404);
      return;
    }

    const bill = await createBill(
      owner,
      merchant,
      amount,
      dueDate,
      referenceNumber,
      category,
      description
    );
    sendSuccessResponse(res, "Bill created successfully 🎉", bill, 201);
  } catch (error: any) {
    sendErrorResponse(res, "Failed to create bill 😞", error.message, 400);
  }
};

export const getMyBills = async (req: Request, res: Response) => {
  try {
    const bills = await getBillsByOwner(req.user.id);
    sendSuccessResponse(res, "Bills retrieved successfully 🎉", bills);
  } catch (error: any) {
    sendErrorResponse(res, "Failed to retrieve bills 😞", error.message, 400);
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { billId } = req.params;
    const { status } = req.body;
    const bill = await updateBillStatus(billId, status);
    sendSuccessResponse(res, "Bill status updated successfully 🎉", bill);
  } catch (error: any) {
    sendErrorResponse(
      res,
      "Failed to update bill status 😞",
      error.message,
      400
    );
  }
};
