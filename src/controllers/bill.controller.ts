console.log('starting to check bill contoller')

import { Request, Response } from "express";
import {
  createBill,
  getBillsByOwner,
  updateBillStatus,
} from "../services/bill.service";
import { sendSuccessResponse, sendErrorResponse } from "../utils/apiResponse";
import Merchant from "../models/merchant.model";
import IUser from "../interfaces/user.interface";


console.log('entering bill controller')
export const create = async (req: Request, res: Response) => {
  console.log('so what is happening?')
  console.log("📥 Incoming create bill request:", req.body); 

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

    if (!amount || amount <= 0) {
      sendErrorResponse(res, "Amount must be greater than 0", null, 400);
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

    console.log("Bill:", bill);
    sendSuccessResponse(res, "Bill created successfully 🎉", bill, 201);
  } catch (error: any) {
    console.error("Create Bill Error:", error);
    sendErrorResponse(res, "Failed to create bill 😞", error.message, 400);
  }
};

export const getMyBills = async (req: Request, res: Response) => {
  try {
    console.log("Current user:", req.authUser); // Add this log
    if (!req.authUser) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const bills = await getBillsByOwner(req.authUser._id);
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
