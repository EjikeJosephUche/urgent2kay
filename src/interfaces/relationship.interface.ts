import { Document } from "mongoose";
import { Types } from "mongoose";

export interface IRelationship extends Document {
  creator: Types.ObjectId;
  relatedUser: Types.ObjectId;
  relationshipType: "parent-child" | "partners" | "friends" | "other";
  customTypeName?: string;
  name: string;
  photo?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISpendingControl extends Document {
  relationship: Types.ObjectId;
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  perRequestLimit?: number;
  autoApproveLimit?: number;
  isActive: boolean;
  notifyOnApproach: boolean;
  approachPercentage: number; // e.g. 80% of limit
  createdAt: Date;
  updatedAt: Date;
}

export interface IContribution extends Document {
  relationship: Types.ObjectId;
  amount: number;
  billRequest: Types.ObjectId;
  category: string;
  message?: string;
  thanked: boolean;
  createdAt: Date;
}