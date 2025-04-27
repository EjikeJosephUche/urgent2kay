import mongoose, { Schema } from "mongoose";
import { IRelationship } from "../interfaces/relationship.interface";

const relationshipSchema = new Schema<IRelationship>(
  {
    requestor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    acceptor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["parent-child", "partners", "friends", "roommates", "custom"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "blocked"],
      default: "pending",
    },
    customType: String,
    spendingLimit: Number,
    limitPeriod: {
      type: String,
      enum: ["daily", "weekly", "monthly", "per-request"],
    },
    rules: {
      allowedCategories: [
        {
          type: String,
          enum: ["education", "utility", "rent", "health", "other"],
        },
      ],
      restrictedCategories: [
        {
          type: String,
          enum: ["education", "utility", "rent", "health", "other"],
        },
      ],
      requireApproval: Boolean,
      cooldownPeriod: Number,
    },
    notes: String,
  },
  { timestamps: true }
);

// Create a compound index to ensure unique relationships
relationshipSchema.index(
  { requestor: 1, acceptor: 1, type: 1 },
  { unique: true }
);

const Relationship = mongoose.model<IRelationship>(
  "Relationship",
  relationshipSchema
);
export default Relationship;