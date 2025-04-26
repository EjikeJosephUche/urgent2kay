import { Request, Response } from "express";
import Relationship from "../models/relationship.model";
import User from "../models/user.model";
import Notification from "../models/notification.model";
import { createNotification } from "../services/notification.service";

/**
 * Create a new relationship request
 */
export const createRelationship = async (req: Request, res: Response) => {
  try {
    const { acceptorId, type, customType, spendingLimit, limitPeriod, rules, notes } = req.body;
    const requestorId = req.user?._id;

    // Validate users exist
    const acceptor = await User.findById(acceptorId);
    if (!acceptor) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if relationship already exists
    const existingRelationship = await Relationship.findOne({
      requestor: requestorId,
      acceptor: acceptorId,
      type,
    });

    if (existingRelationship) {
      return res.status(409).json({ message: "Relationship already exists" });
    }

    // Create relationship
    const relationship = await Relationship.create({
      requestor: requestorId,
      acceptor: acceptorId,
      type,
      customType: type === "custom" ? customType : undefined,
      spendingLimit,
      limitPeriod,
      rules,
      notes,
      status: "pending",
    });

    // Create notification for acceptor
    await createNotification({
      recipient: acceptorId,
      type: "relationship",
      title: "New Relationship Request",
      message: `You have received a new ${type} relationship request.`,
      relatedId: relationship._id,
    });

    res.status(201).json({
      message: "Relationship request created successfully",
      relationship,
    });
  } catch (error) {
    console.error("Error creating relationship:", error);
    res.status(500).json({ message: "Failed to create relationship" });
  }
};

/**
 * Get all relationships for the authenticated user
 */
export const getRelationships = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { status, type } = req.query;

    const query: any = {
      $or: [{ requestor: userId }, { acceptor: userId }],
    };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    const relationships = await Relationship.find(query)
      .populate("requestor", "firstName lastName email")
      .populate("acceptor", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ relationships });
  } catch (error) {
    console.error("Error fetching relationships:", error);
    res.status(500).json({ message: "Failed to fetch relationships" });
  }
};

/**
 * Get a specific relationship by ID
 */
export const getRelationshipById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const relationship = await Relationship.findOne({
      _id: id,
      $or: [{ requestor: userId }, { acceptor: userId }],
    })
      .populate("requestor", "firstName lastName email")
      .populate("acceptor", "firstName lastName email");

    if (!relationship) {
      return res.status(404).json({ message: "Relationship not found" });
    }

    res.status(200).json({ relationship });
  } catch (error) {
    console.error("Error fetching relationship:", error);
    res.status(500).json({ message: "Failed to fetch relationship" });
  }
};

/**
 * Update relationship status (accept, reject, block)
 */
export const updateRelationshipStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?._id;

    // Verify user is the acceptor
    const relationship = await Relationship.findOne({
      _id: id,
      acceptor: userId,
    });

    if (!relationship) {
      return res.status(404).json({ message: "Relationship not found" });
    }

    // Update status
    relationship.status = status;
    await relationship.save();

    // Create notification for requestor
    let notificationMessage = "";
    switch (status) {
      case "active":
        notificationMessage = "Your relationship request has been accepted.";
        break;
      case "rejected":
        notificationMessage = "Your relationship request has been rejected.";
        break;
      case "blocked":
        notificationMessage = "This relationship has been blocked.";
        break;
    }

    await createNotification({
      recipient: relationship.requestor,
      type: "relationship",
      title: "Relationship Status Update",
      message: notificationMessage,
      relatedId: relationship._id,
    });

    res.status(200).json({
      message: "Relationship status updated successfully",
      relationship,
    });
  } catch (error) {
    console.error("Error updating relationship status:", error);
    res.status(500).json({ message: "Failed to update relationship status" });
  }
};

/**
 * Update relationship details (spending limit, rules, etc.)
 */
export const updateRelationship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { spendingLimit, limitPeriod, rules, notes } = req.body;
    const userId = req.user?._id;

    // Verify user is part of the relationship
    const relationship = await Relationship.findOne({
      _id: id,
      $or: [{ requestor: userId }, { acceptor: userId }],
      status: "active", // Only active relationships can be updated
    });

    if (!relationship) {
      return res.status(404).json({ message: "Active relationship not found" });
    }

    // Update fields
    if (spendingLimit !== undefined) relationship.spendingLimit = spendingLimit;
    if (limitPeriod) relationship.limitPeriod = limitPeriod;
    if (rules) relationship.rules = { ...relationship.rules, ...rules };
    if (notes) relationship.notes = notes;

    await relationship.save();

    // Create notification for the other party
    const otherPartyId =
      relationship.requestor.toString() === userId.toString()
        ? relationship.acceptor
        : relationship.requestor;

    await createNotification({
      recipient: otherPartyId,
      type: "relationship",
      title: "Relationship Updated",
      message: "Your relationship details have been updated.",
      relatedId: relationship._id,
    });

    res.status(200).json({
      message: "Relationship updated successfully",
      relationship,
    });
  } catch (error) {
    console.error("Error updating relationship:", error);
    res.status(500).json({ message: "Failed to update relationship" });
  }
};

/**
 * Delete/terminate a relationship
 */
export const deleteRelationship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    // Verify user is part of the relationship
    const relationship = await Relationship.findOne({
      _id: id,
      $or: [{ requestor: userId }, { acceptor: userId }],
    });

    if (!relationship) {
      return res.status(404).json({ message: "Relationship not found" });
    }

    // Get the other party's ID
    const otherPartyId =
      relationship.requestor.toString() === userId.toString()
        ? relationship.acceptor
        : relationship.requestor;

    // Delete the relationship
    await Relationship.deleteOne({ _id: id });

    // Create notification for the other party
    await createNotification({
      recipient: otherPartyId,
      type: "relationship",
      title: "Relationship Terminated",
      message: "A relationship you were part of has been terminated.",
      relatedId: undefined,
    });

    res.status(200).json({
      message: "Relationship deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting relationship:", error);
    res.status(500).json({ message: "Failed to delete relationship" });
  }
};