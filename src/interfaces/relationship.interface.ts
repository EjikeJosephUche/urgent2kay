import { Document, Types } from "mongoose";

export interface IRelationship extends Document {
  requestor: Types.ObjectId; // User who initiated the relationship
  acceptor: Types.ObjectId; // User who accepted the relationship
  type: "parent-child" | "partners" | "friends" | "roommates" | "custom";
  status: "pending" | "active" | "rejected" | "blocked";
  customType?: string; // Only used when type is 'custom'
  spendingLimit?: number; // Optional spending limit in base currency
  limitPeriod?: "daily" | "weekly" | "monthly" | "per-request";
  rules?: {
    allowedCategories?: ("education" | "utility" | "rent" | "health" | "other")[];
    restrictedCategories?: ("education" | "utility" | "rent" | "health" | "other")[];
    requireApproval?: boolean; // If true, all requests need explicit approval
    cooldownPeriod?: number; // Hours between requests
  };
  notes?: string; // Additional notes about the relationship
  createdAt: Date;
  updatedAt: Date;
}

export interface IAcknowledgement extends Document {
  relationship: Types.ObjectId;
  billRequest: Types.ObjectId;
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface INotification extends Document {
  recipient: Types.ObjectId;
  type: "request" | "payment" | "relationship" | "reminder" | "acknowledgement";
  title: string;
  message: string;
  relatedId?: Types.ObjectId; // Could be a billRequest, relationship, etc.
  isRead: boolean;
  createdAt: Date;
}

export interface IAnalyticsStat extends Document {
  user: Types.ObjectId;
  metric: "requests_sent" | "requests_accepted" | "amount_funded" | "bills_paid";
  value: number;
  period: "daily" | "weekly" | "monthly" | "yearly" | "all_time";
  date: Date; // The date this stat represents
  createdAt: Date;
  updatedAt: Date;
}

export interface IContributionStat extends Document {
  relationship: Types.ObjectId;
  sponsor: Types.ObjectId;
  recipient: Types.ObjectId;
  totalAmount: number;
  contributionCount: number;
  lastContribution: Date;
  createdAt: Date;
  updatedAt: Date;
}