import { Request, Response } from "express";
import Acknowledgement from "../models/acknowledgement.model";
import Relationship from "../models/relationship.model";
import BillRequest from "../models/bill-request.model";
import { createNotification } from "../services/notification.service";

/**
 * Create a new acknowledgement (thank you note)
 */
export const createAcknowledgement = async (req: Request, res: Response) => {
  try {
    const { relationshipId, billRequestId, message } = req.body;
    const senderId = req.user?._id;

    // Validate relationship exists and user is part of it
    const relationship = await Relationship.findOne({
      _id: relationshipId,
      $or: [{ requestor: senderId }, { acceptor: senderId }],
      status: "active",
    });

    if (!relationship) {
      return res.status(404).json({ message: "Active relationship not found" });
    }

    // Validate bill request exists
    const billRequest = await BillRequest.findOne({
      _id: billRequestId,
      request: senderId,
    });

    if (!billRequest) {
      return res.status(404).json({ message: "Bill request not found" });
    }

    // Determine recipient (the other party in the relationship)
    const recipientId =
      relationship.requestor.toString() === senderId.toString()
        ? relationship.acceptor
        : relationship.requestor;

    // Create acknowledgement
    const acknowledgement = await Acknowledgement.create({
      relationship: relationshipId,
      billRequest: billRequestId,
      sender: senderId,
      recipient: recipientId,
      message,
    });

    // Create notification for recipient
    await createNotification({
      recipient: recipientId,
      type: "acknowledgement",
      title: "New Thank You Note",
      message: "You've received a thank you note!",
      relatedId: acknowledgement._id,
    });

    res.status(201).json({
      message: "Acknowledgement created successfully",
      acknowledgement,
    });
  } catch (error) {
    console.error("Error creating acknowledgement:", error);
    res.status(500).json({ message: "Failed to create acknowledgement" });
  }
};

/**
 * Get all acknowledgements for the authenticated user
 */
export const getAcknowledgements = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { isRead } = req.query;

    const query: any = {
      $or: [{ sender: userId }, { recipient: userId }],
    };

    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    const acknowledgements = await Acknowledgement.find(query)
      .populate("sender", "firstName lastName email")
      .populate("recipient", "firstName lastName email")
      .populate("relationship", "type")
      .populate("billRequest", "totalAmount")
      .sort({ createdAt: -1 });

    res.status(200).json({ acknowledgements });
  } catch (error) {
    console.error("Error fetching acknowledgements:", error);
    res.status(500).json({ message: "Failed to fetch acknowledgements" });
  }
};

/**
 * Mark acknowledgement as read
 */
export const markAcknowledgementAsRead = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const acknowledgement = await Acknowledgement.findOne({
      _id: id,
      recipient: userId,
    });

    if (!acknowledgement) {
      return res.status(404).json({ message: "Acknowledgement not found" });
    }

    acknowledgement.isRead = true;
    await acknowledgement.save();

    res.status(200).json({
      message: "Acknowledgement marked as read",
      acknowledgement,
    });
  } catch (error) {
    console.error("Error marking acknowledgement as read:", error);
    res.status(500).json({ message: "Failed to mark acknowledgement as read" });
  }
};

/**
 * Delete an acknowledgement
 */
export const deleteAcknowledgement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const acknowledgement = await Acknowledgement.findOne({
      _id: id,
      sender: userId, // Only the sender can delete an acknowledgement
    });

    if (!acknowledgement) {
      return res.status(404).json({ message: "Acknowledgement not found" });
    }

    await Acknowledgement.deleteOne({ _id: id });

    res.status(200).json({
      message: "Acknowledgement deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting acknowledgement:", error);
    res.status(500).json({ message: "Failed to delete acknowledgement" });
  }
};