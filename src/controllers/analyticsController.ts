import { Request, Response } from "express";
import { AnalyticsStat, ContributionStat } from "../models/analytics.model";
import Transaction from "../models/Transaction";
import Relationship from "../models/relationship.model";
import mongoose from "mongoose";

/**
 * Get analytics for the authenticated user
 */
export const getUserAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { period = "monthly" } = req.query;

    // Get user stats
    const stats = await AnalyticsStat.find({
      user: userId,
      period,
    }).sort({ date: -1 });

    res.status(200).json({ stats });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

/**
 * Get contribution history by relationship
 */
export const getContributionsByRelationship = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?._id;
    const { relationshipId } = req.params;

    // Validate relationship
    const relationship = await Relationship.findOne({
      _id: relationshipId,
      $or: [{ requestor: userId }, { acceptor: userId }],
      status: "active",
    });

    if (!relationship) {
      return res.status(404).json({ message: "Relationship not found" });
    }

    // Get contribution stats
    const contributionStats = await ContributionStat.findOne({
      relationship: relationshipId,
    });

    if (!contributionStats) {
      return res.status(200).json({
        relationshipId,
        totalAmount: 0,
        contributionCount: 0,
      });
    }

    // Get detailed transaction history
    const transactions = await Transaction.find({
      $or: [
        { user: relationship.requestor, request: { $exists: true } },
        { user: relationship.acceptor, request: { $exists: true } },
      ],
      status: "success",
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      stats: contributionStats,
      recentTransactions: transactions,
    });
  } catch (error) {
    console.error("Error fetching relationship contributions:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch relationship contributions" });
  }
};

/**
 * Get contribution history for all relationships
 */
export const getAllContributionHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    // Get all active relationships where user is either requestor or acceptor
    const relationships = await Relationship.find({
      $or: [{ requestor: userId }, { acceptor: userId }],
      status: "active",
    });

    const relationshipIds = relationships.map((r) => r._id);

    // Get contribution stats for all relationships
    const contributionStats = await ContributionStat.find({
      relationship: { $in: relationshipIds },
    }).populate("relationship", "type");

    // Aggregate total stats
    const aggregatedStats = await ContributionStat.aggregate([
      {
        $match: {
          relationship: { $in: relationshipIds },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          totalContributions: { $sum: "$contributionCount" },
        },
      },
    ]);

    res.status(200).json({
      relationshipStats: contributionStats,
      totalStats: aggregatedStats[0] || {
        totalAmount: 0,
        totalContributions: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching all contribution history:", error);
    res.status(500).json({ message: "Failed to fetch contribution history" });
  }
};

/**
 * Get summary statistics for the authenticated user
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    // Get aggregate stats for the user
    const stats = {
      asRequester: await Transaction.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId.toString()),
            status: "success",
          },
        },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),
      asSponsor: await Transaction.aggregate([
        {
          $lookup: {
            from: "billrequests",
            localField: "request",
            foreignField: "_id",
            as: "billRequestDetails",
          },
        },
        {
          $unwind: {
            path: "$billRequestDetails",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            "billRequestDetails.sponsors": new mongoose.Types.ObjectId(userId.toString()),
            status: "success",
          },
        },
        {
          $group: {
            _id: null,
            totalSponsored: { $sum: 1 },
            totalAmountSponsored: { $sum: "$amount" },
          },
        },
      ]),
    };

    // Format the response
    const formattedStats = {
      asRequester: stats.asRequester[0] || { totalRequests: 0, totalAmount: 0 },
      asSponsor: stats.asSponsor[0] || { totalSponsored: 0, totalAmountSponsored: 0 },
    };

    res.status(200).json({ stats: formattedStats });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Failed to fetch user stats" });
  }
};

/**
 * Get detailed analytics for a specific time period
 */
export const getDetailedAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { startDate, endDate, groupBy = "day" } = req.query;

    // Validate dates
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    const end = endDate ? new Date(endDate as string) : new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Define time grouping format
    let dateFormat;
    switch (groupBy) {
      case "day":
        dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case "week":
        dateFormat = { $dateToString: { format: "%Y-W%U", date: "$createdAt" } };
        break;
      case "month":
        dateFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
      default:
        dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    // Get transaction analytics grouped by time
    const transactionAnalytics = await Transaction.aggregate([
      {
        $match: {
          $or: [
            { user: new mongoose.Types.ObjectId(userId.toString()) },
            { "request.sponsors": new mongoose.Types.ObjectId(userId.toString()) },
          ],
          status: "success",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: dateFormat,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      timeframe: {
        start: start.toISOString(),
        end: end.toISOString(),
        groupBy,
      },
      analytics: transactionAnalytics,
    });
  } catch (error) {
    console.error("Error fetching detailed analytics:", error);
    res.status(500).json({ message: "Failed to fetch detailed analytics" });
  }
};