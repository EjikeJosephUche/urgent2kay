import mongoose, { Schema } from "mongoose";
import { IRelationship, ISpendingControl, IContribution } from "../interfaces/relationship.interface";

// Relationship Profile Schema
const relationshipSchema = new Schema<IRelationship>(
  {
    creator: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    relatedUser: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    relationshipType: {
      type: String,
      enum: ["parent-child", "partners", "friends", "other"],
      required: true,
    },
    customTypeName: {
      type: String,
      required: function() {
        return this.relationshipType === "other";
      }
    },
    name: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

// Create a compound index to prevent duplicate relationships
relationshipSchema.index({ creator: 1, relatedUser: 1 }, { unique: true });

// Spending Control Schema
const spendingControlSchema = new Schema<ISpendingControl>(
  {
    relationship: {
      type: Schema.Types.ObjectId,
      ref: "Relationship",
      required: true,
      unique: true,
    },
    dailyLimit: {
      type: Number,
    },
    weeklyLimit: {
      type: Number,
    },
    monthlyLimit: {
      type: Number,
    },
    perRequestLimit: {
      type: Number,
    },
    autoApproveLimit: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notifyOnApproach: {
      type: Boolean,
      default: true,
    },
    approachPercentage: {
      type: Number,
      default: 80,
      min: 1,
      max: 99,
    }
  },
  { timestamps: true }
);

// Contribution Tracking Schema
const contributionSchema = new Schema<IContribution>(
  {
    relationship: {
      type: Schema.Types.ObjectId,
      ref: "Relationship",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    billRequest: {
      type: Schema.Types.ObjectId,
      ref: "BillRequest",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    thanked: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

export const Relationship = mongoose.model<IRelationship>("Relationship", relationshipSchema);
export const SpendingControl = mongoose.model<ISpendingControl>("SpendingControl", spendingControlSchema);
export const Contribution = mongoose.model<IContribution>("Contribution", contributionSchema);