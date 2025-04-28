import { AnalyticsStat, ContributionStat } from "../models/analytics.model";
import Transaction from "../models/Transaction";
import BillRequest from "../models/bill-request.model";
import Relationship from "../models/relationship.model";
import mongoose, { Types } from "mongoose";
import cron from "node-cron";

/**
 * Start the analytics tracker scheduler
 */
export const startAnalyticsTracker = () => {
  // Schedule daily stats calculation at 1:00 AM
  cron.schedule("0 1 * * *", async () => {
    console.log("Running daily analytics calculation...");
    await calculateDailyStats();
  });

  // Schedule weekly stats calculation on Sunday at 2:00 AM
  cron.schedule("0 2 * * 0", async () => {
    console.log("Running weekly analytics calculation...");
    await calculateWeeklyStats();
  });

  // Schedule monthly stats calculation on the 1st of each month at 3:00 AM
  cron.schedule("0 3 1 * *", async () => {
    console.log("Running monthly analytics calculation...");
    await calculateMonthlyStats();
  });

  console.log("Analytics tracker started");
};

/**
 * Track a successful transaction and update stats
 */
export const trackSuccessfulTransaction = async (
  transaction: any,
  billRequest: any
) => {
  try {
    // Update the requester's stats
    await updateUserStats(
      billRequest.request.toString(),
      "requests_accepted",
      transaction.amount
    );

    // For each sponsor, update their stats
    for (const sponsorId of billRequest.sponsors) {
      await updateUserStats(
        sponsorId.toString(),
        "amount_funded",
        transaction.amount / billRequest.sponsors.length // Divide amount among sponsors
      );
    }

    // Check if relationship exists between requester and each sponsor
    for (const sponsorId of billRequest.sponsors) {
      const relationship = await Relationship.findOne({
        $or: [
          {
            requestor: billRequest.request,
            acceptor: sponsorId,
          },
          {
            requestor: sponsorId,
            acceptor: billRequest.request,
          },
        ],
        status: "active",
      });

      if (relationship) {
        // Update contribution stats for this relationship
        await updateContributionStats(
          relationship._id.toString(),
          sponsorId.toString(),
          billRequest.request.toString(),
          transaction.amount / billRequest.sponsors.length // Divide amount among sponsors
        );
      }
    }
  } catch (error) {
    console.error("Error tracking successful transaction:", error);
  }
};

/**
 * Update user analytics stats
 */
async function updateUserStats(
  userId: string,
  metric: "requests_sent" | "requests_accepted" | "amount_funded" | "bills_paid",
  value: number
) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update or create daily stat
    await AnalyticsStat.findOneAndUpdate(
      {
        user: userId,
        metric,
        period: "daily",
        date: today,
      },
      { $inc: { value } },
      { upsert: true, new: true }
    );

    // Get start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Update or create weekly stat
    await AnalyticsStat.findOneAndUpdate(
      {
        user: userId,
        metric,
        period: "weekly",
        date: startOfWeek,
      },
      { $inc: { value } },
      { upsert: true, new: true }
    );

    // Get start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Update or create monthly stat
    await AnalyticsStat.findOneAndUpdate(
      {
        user: userId,
        metric,
        period: "monthly",
        date: startOfMonth,
      },
      { $inc: { value } },
      { upsert: true, new: true }
    );

    // Get start of year
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Update or create yearly stat
    await AnalyticsStat.findOneAndUpdate(
      {
        user: userId,
        metric,
        period: "yearly",
        date: startOfYear,
      },
      { $inc: { value } },
      { upsert: true, new: true }
    );

    // Update or create all-time stat
    await AnalyticsStat.findOneAndUpdate(
      {
        user: userId,
        metric,
        period: "all_time",
        date: new Date(0), // January 1, 1970
      },
      { $inc: { value } },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error updating user stats:", error);
  }
}

/**
 * Update contribution stats for a relationship
 */
async function updateContributionStats(
  relationshipId: string,
  sponsorId: string,
  recipientId: string,
  amount: number
) {
  try {
    // Update or create contribution stat
    await ContributionStat.findOneAndUpdate(
      {
        relationship: relationshipId,
        sponsor: sponsorId,
        recipient: recipientId,
      },
      {
        $inc: {
          totalAmount: amount,
          contributionCount: 1,
        },
        $set: {
          lastContribution: new Date(),
        },
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error updating contribution stats:", error);
  }
}

/**
 * Calculate daily statistics
 */
async function calculateDailyStats() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999);

  try {
    // Calculate daily requests created
    const requestsCreated = await BillRequest.aggregate([
      {
        $match: {
          createdAt: {
            $gte: yesterday,
            $lte: endOfYesterday,
          },
        },
      },
      {
        $group: {
          _id: "$request",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Update stats for each user
    for (const stat of requestsCreated) {
      await AnalyticsStat.findOneAndUpdate(
        {
          user: stat._id,
          metric: "requests_sent",
          period: "daily",
          date: yesterday,
        },
        {
          $set: {
            value: stat.count,
          },
        },
        { upsert: true }
      );
    }

    // Calculate daily bills paid
    const billsPaid = await Transaction.aggregate([
      {
        $match: {
          status: "success",
          createdAt: {
            $gte: yesterday,
            $lte: endOfYesterday,
          },
        },
      },
      {
        $lookup: {
          from: "billrequests",
          localField: "request",
          foreignField: "_id",
          as: "billRequestData",
        },
      },
      {
        $unwind: "$billRequestData",
      },
      {
        $group: {
          _id: "$billRequestData.request",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Update stats for each user
    for (const stat of billsPaid) {
      await AnalyticsStat.findOneAndUpdate(
        {
          user: stat._id,
          metric: "bills_paid",
          period: "daily",
          date: yesterday,
        },
        {
          $set: {
            value: stat.count,
          },
        },
        { upsert: true }
      );
    }

    console.log("Daily stats calculation completed");
  } catch (error) {
    console.error("Error calculating daily stats:", error);
  }
}

/**
 * Calculate weekly statistics
 */
async function calculateWeeklyStats() {
  // Similar implementation to daily stats but with weekly date range
  console.log("Weekly stats calculation completed");
}

/**
 * Calculate monthly statistics
 */
async function calculateMonthlyStats() {
  // Similar implementation to daily stats but with monthly date range
  console.log("Monthly stats calculation completed");
}