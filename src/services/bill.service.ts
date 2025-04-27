import { IBillRequest, IBill } from "./../interfaces/bill.interface";
import Bill from "../models/bill.model";
import mongoose from "mongoose";

//@6lackboy042 @EjikeJosephUche let me know if i need to impplement the other methods or @6lackboy042 will integrate them here

export const createBill = async (billData: IBill): Promise<IBill> => {
  return await Bill.create(billData);
};

export const getBillsByOwner = async (ownerId: string): Promise<IBill[]> => {
  return await Bill.find({ owner: ownerId });
};
