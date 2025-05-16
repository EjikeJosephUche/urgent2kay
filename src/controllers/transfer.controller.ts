// controllers/transfer.controller.ts
import { Request, Response } from "express";
import { initiateBulkTransfer } from "../services/transfer.service";

export const createBulkTransfer = async (req: Request, res: Response) => {
  try {
    const bulkTransfer = req.body;
    const result = await initiateBulkTransfer(bulkTransfer);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error initiating bulk transfer", error });
  }
};
