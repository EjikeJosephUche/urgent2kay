import mongoose, { Schema } from "mongoose";
import { IAnalyticsStat, IContributionStat } from "../interfaces/relationship.interface";

// Stats model for user-specific analytics
const analyticsStatSchema = new Schema<IAnalyticsStat>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    metric: {
      type: String,
      enum: ["requests_sent", "requests_accepted", "amount_funded", "bills_paid"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      default: 0,
    },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly", "all_time"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Create compound index for efficient querying
analyticsStatSchema.index({ user: 1, metric: 1, period: 1, date: 1 }, { unique: true });

// Relationship-specific stats for contributions
const contributionStatSchema = new Schema<IContributionStat>(
  {
    relationship: {
      type: Schema.Types.ObjectId,
      ref: "Relationship",
      required: true,
    },
    sponsor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    contributionCount: {
      type: Number,
      required: true,
      default: 0,
    },
    lastContribution: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Create index for efficient querying
contributionStatSchema.index({ relationship: 1 }, { unique: true });
contributionStatSchema.index({ sponsor: 1 });
contributionStatSchema.index({ recipient: 1 });

const AnalyticsStat = mongoose.model<IAnalyticsStat>(
  "AnalyticsStat",
  analyticsStatSchema
);

const ContributionStat = mongoose.model<IContributionStat>(
  "ContributionStat",
  contributionStatSchema
);

export { AnalyticsStat, ContributionStat };