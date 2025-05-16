import { Request, Response } from "express";
import relationshipService from "../services/relationship.service";
import { IUser } from "../interfaces/user.interface";
import { asyncHandler } from "../utils/errorHandler";

// Extended Request interface with user
interface AuthenticatedRequest extends Request {
  user?: IUser;
  userId?: string;
}

export class RelationshipController {
  createRelationship = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      relatedUser,
      relationshipType,
      name,
      customTypeName,
      photo,
      description,
    } = req.body;

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    if (!relatedUser || !relationshipType || !name) {
      return res.status(400).json({ message: "Missing required fields: relatedUser, relationshipType, or name" });
    }

    const relationship = await relationshipService.createRelationship(
      userId,
      relatedUser,
      relationshipType,
      name,
      customTypeName,
      photo,
      description
    );

    return res.status(201).json({
      message: "Relationship created successfully",
      relationship,
    });
  });

  getRelationships = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const relationships = await relationshipService.getRelationships(userId);

    return res.status(200).json({
      message: "Relationships retrieved successfully",
      relationships,
    });
  });

  getRelationshipById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const relationship = await relationshipService.getRelationshipById(id);

    if (
      relationship.creator.toString() !== userId &&
      relationship.relatedUser.toString() !== userId
    ) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this relationship" });
    }

    return res.status(200).json({
      message: "Relationship retrieved successfully",
      relationship,
    });
  });

  updateRelationship = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const updatedRelationship = await relationshipService.updateRelationship(id, userId, updateData);

    return res.status(200).json({
      message: "Relationship updated successfully",
      relationship: updatedRelationship,
    });
  });

  deleteRelationship = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    await relationshipService.deleteRelationship(id, userId);

    return res.status(200).json({
      message: "Relationship deleted successfully",
    });
  });

  setSpendingControls = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { relationshipId } = req.params;
    const controlData = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const spendingControl = await relationshipService.createOrUpdateSpendingControl(
      relationshipId,
      userId,
      controlData
    );

    return res.status(200).json({
      message: "Spending controls set successfully",
      spendingControl,
    });
  });

  getSpendingControls = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { relationshipId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const relationship = await relationshipService.getRelationshipById(relationshipId);

    if (
      relationship.creator.toString() !== userId &&
      relationship.relatedUser.toString() !== userId
    ) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this relationship" });
    }

    const spendingControl = await relationshipService.getSpendingControl(relationshipId);

    return res.status(200).json({
      message: "Spending controls retrieved successfully",
      spendingControl,
    });
  });

  checkSpendingLimits = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { relationshipId } = req.params;
    const { amount } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const relationship = await relationshipService.getRelationshipById(relationshipId);

    if (
      relationship.creator.toString() !== userId &&
      relationship.relatedUser.toString() !== userId
    ) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this relationship" });
    }

    const result = await relationshipService.checkSpendingLimits(relationshipId, amount);

    return res.status(200).json({
      message: "Spending limits checked",
      result,
    });
  });

  recordContribution = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { relationshipId, amount, billRequestId, category, message } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const relationship = await relationshipService.getRelationshipById(relationshipId);

    if (
      relationship.creator.toString() !== userId &&
      relationship.relatedUser.toString() !== userId
    ) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this relationship" });
    }

    const contribution = await relationshipService.recordContribution(
      relationshipId,
      amount,
      billRequestId,
      category,
      message
    );

    return res.status(201).json({
      message: "Contribution recorded successfully",
      contribution,
    });
  });

  getContributions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { relationshipId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const relationship = await relationshipService.getRelationshipById(relationshipId);

    if (
      relationship.creator.toString() !== userId &&
      relationship.relatedUser.toString() !== userId
    ) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this relationship" });
    }

    const contributions = await relationshipService.getContributionsByRelationship(relationshipId);

    return res.status(200).json({
      message: "Contributions retrieved successfully",
      contributions,
    });
  });

  getContributionStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { relationshipId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const relationship = await relationshipService.getRelationshipById(relationshipId);

    if (
      relationship.creator.toString() !== userId &&
      relationship.relatedUser.toString() !== userId
    ) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this relationship" });
    }

    const stats = await relationshipService.getContributionStats(relationshipId);

    return res.status(200).json({
      message: "Contribution stats retrieved successfully",
      stats,
    });
  });

  sendThankYou = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { contributionId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const contribution = await relationshipService.sendThankYou(contributionId);

    return res.status(200).json({
      message: "Thank you recorded successfully",
      contribution,
    });
  });
}

export default new RelationshipController();
