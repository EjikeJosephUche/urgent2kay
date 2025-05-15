import { Relationship, SpendingControl, Contribution } from "../models/relationship.model";
import { IRelationship, ISpendingControl, IContribution } from "../interfaces/relationship.interface";
import mongoose, { Types } from "mongoose";
import User from "../models/user.model";

class RelationshipService {
  // Relationship Profile Methods
  async createRelationship(
    creator: string,
    relatedUser: string,
    relationshipType: "parent-child" | "partners" | "friends" | "other",
    name: string,
    customTypeName?: string,
    photo?: string,
    description?: string
  ): Promise<IRelationship> {
    try {
      // Check if users exist
      const creatorExists = await User.findById(creator);
      const relatedUserExists = await User.findById(relatedUser);

      if (!creatorExists || !relatedUserExists) {
        throw new Error("One or both users do not exist");
      }

      // Check if relationship already exists
      const existingRelationship = await Relationship.findOne({
        creator,
        relatedUser,
      });

      if (existingRelationship) {
        throw new Error("Relationship already exists between these users");
      }

      const relationship = new Relationship({
        creator,
        relatedUser,
        relationshipType,
        name,
        customTypeName,
        photo,
        description,
      });

      return await relationship.save();
    } catch (error: any) {
      throw new Error(`Error creating relationship: ${error.message}`);
    }
  }

  async getRelationships(userId: string): Promise<IRelationship[]> {
    try {
      return await Relationship.find({ 
        $or: [{ creator: userId }, { relatedUser: userId }]
      })
        .populate("creator", "firstName lastName email")
        .populate("relatedUser", "firstName lastName email");
    } catch (error: any) {
      throw new Error(`Error getting relationships: ${error.message}`);
    }
  }

  async getRelationshipById(relationshipId: string): Promise<IRelationship> {
    try {
      const relationship = await Relationship.findById(relationshipId)
        .populate("creator", "firstName lastName email")
        .populate("relatedUser", "firstName lastName email");
      
      if (!relationship) {
        throw new Error("Relationship not found");
      }
      
      return relationship;
    } catch (error: any) {
      throw new Error(`Error getting relationship: ${error.message}`);
    }
  }

  async updateRelationship(
    relationshipId: string,
    userId: string,
    updateData: Partial<IRelationship>
  ): Promise<IRelationship> {
    try {
      const relationship = await Relationship.findById(relationshipId);
      
      if (!relationship) {
        throw new Error("Relationship not found");
      }
      
      // Check if user is the creator of the relationship
      if (relationship.creator.toString() !== userId) {
        throw new Error("Unauthorized: Only the creator can update this relationship");
      }
      
      // Remove fields that shouldn't be updated
      delete updateData.creator;
      delete updateData.relatedUser;
      
      const updatedRelationship = await Relationship.findByIdAndUpdate(
        relationshipId,
        updateData,
        { new: true }
      );
      
      if (!updatedRelationship) {
        throw new Error("Failed to update relationship");
      }
      
      return updatedRelationship;
    } catch (error: any) {
      throw new Error(`Error updating relationship: ${error.message}`);
    }
  }

  async deleteRelationship(relationshipId: string, userId: string): Promise<void> {
    try {
      const relationship = await Relationship.findById(relationshipId);
      
      if (!relationship) {
        throw new Error("Relationship not found");
      }
      
      // Check if user is the creator of the relationship
      if (relationship.creator.toString() !== userId) {
        throw new Error("Unauthorized: Only the creator can delete this relationship");
      }
      
      // Remove associated spending controls
      await SpendingControl.deleteMany({ relationship: relationshipId });
      
      // Delete the relationship
      await Relationship.findByIdAndDelete(relationshipId);
    } catch (error: any) {
      throw new Error(`Error deleting relationship: ${error.message}`);
    }
  }

  // Spending Control Methods
  async createOrUpdateSpendingControl(
    relationshipId: string,
    userId: string,
    controlData: Partial<ISpendingControl>
  ): Promise<ISpendingControl> {
    try {
      const relationship = await Relationship.findById(relationshipId);
      
      if (!relationship) {
        throw new Error("Relationship not found");
      }
      
      // Check if user is the creator of the relationship
      if (relationship.creator.toString() !== userId) {
        throw new Error("Unauthorized: Only the relationship creator can set spending controls");
      }
      
      // Find existing control or create new one
      let control = await SpendingControl.findOne({ relationship: relationshipId });
      
      if (control) {
        // Update existing control
        Object.assign(control, controlData);
        return await control.save();
      } else {
        // Create new control
        control = new SpendingControl({
          relationship: relationshipId,
          ...controlData
        });
        return await control.save();
      }
    } catch (error: any) {
      throw new Error(`Error managing spending control: ${error.message}`);
    }
  }

  async getSpendingControl(relationshipId: string): Promise<ISpendingControl | null> {
    try {
      return await SpendingControl.findOne({ relationship: relationshipId });
    } catch (error: any) {
      throw new Error(`Error getting spending control: ${error.message}`);
    }
  }

  async checkSpendingLimits(
    relationshipId: string,
    amount: number
  ): Promise<{ allowed: boolean; reason?: string; autoApproved?: boolean }> {
    try {
      const control = await SpendingControl.findOne({
        relationship: relationshipId,
        isActive: true
      });
      
      if (!control) {
        return { allowed: true }; // No controls set, so it's allowed
      }
      
      // Check if amount exceeds any limits
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Check per request limit
      if (control.perRequestLimit && amount > control.perRequestLimit) {
        return { 
          allowed: false, 
          reason: `Amount exceeds per request limit of ${control.perRequestLimit}` 
        };
      }
      
      // Get current period spending
      const contributions = await Contribution.find({
        relationship: relationshipId,
        createdAt: { $gte: monthStart }
      });
      
      // Calculate spending for different periods
      const dailySpending = contributions
        .filter(c => c.createdAt >= today)
        .reduce((sum, c) => sum + c.amount, 0);
        
      const weeklySpending = contributions
        .filter(c => c.createdAt >= weekStart)
        .reduce((sum, c) => sum + c.amount, 0);
        
      const monthlySpending = contributions
        .reduce((sum, c) => sum + c.amount, 0);
      
      // Check daily limit
      if (control.dailyLimit && dailySpending + amount > control.dailyLimit) {
        return { 
          allowed: false, 
          reason: `Amount would exceed daily limit of ${control.dailyLimit}` 
        };
      }
      
      // Check weekly limit
      if (control.weeklyLimit && weeklySpending + amount > control.weeklyLimit) {
        return { 
          allowed: false, 
          reason: `Amount would exceed weekly limit of ${control.weeklyLimit}` 
        };
      }
      
      // Check monthly limit
      if (control.monthlyLimit && monthlySpending + amount > control.monthlyLimit) {
        return { 
          allowed: false, 
          reason: `Amount would exceed monthly limit of ${control.monthlyLimit}` 
        };
      }
      
      // Check if auto-approval is applicable
      const autoApproved = control.autoApproveLimit ? amount <= control.autoApproveLimit : false;
      
      return { allowed: true, autoApproved };
    } catch (error: any) {
      throw new Error(`Error checking spending limits: ${error.message}`);
    }
  }

  // Contribution Tracking Methods
  async recordContribution(
    relationshipId: string,
    amount: number,
    billRequestId: string,
    category: string,
    message?: string
  ): Promise<IContribution> {
    try {
      const relationship = await Relationship.findById(relationshipId);
      if (!relationship) {
        throw new Error("Relationship not found");
      }
      
      const contribution = new Contribution({
        relationship: relationshipId,
        amount,
        billRequest: billRequestId,
        category,
        message
      });
      
      return await contribution.save();
    } catch (error: any) {
      throw new Error(`Error recording contribution: ${error.message}`);
    }
  }

  async getContributionsByRelationship(relationshipId: string): Promise<IContribution[]> {
    try {
      return await Contribution.find({ relationship: relationshipId })
        .populate("billRequest")
        .sort({ createdAt: -1 });
    } catch (error: any) {
      throw new Error(`Error getting contributions: ${error.message}`);
    }
  }

  async getContributionStats(relationshipId: string): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byMonth: Record<string, number>;
  }> {
    try {
      const contributions = await Contribution.find({ relationship: relationshipId });
      
      // Calculate total
      const total = contributions.reduce((sum, c) => sum + c.amount, 0);
      
      // Calculate by category
      const byCategory: Record<string, number> = {};
      contributions.forEach(c => {
        byCategory[c.category] = (byCategory[c.category] || 0) + c.amount;
      });
      
      // Calculate by month
      const byMonth: Record<string, number> = {};
      contributions.forEach(c => {
        const dateKey = `${c.createdAt.getFullYear()}-${c.createdAt.getMonth() + 1}`;
        byMonth[dateKey] = (byMonth[dateKey] || 0) + c.amount;
      });
      
      return { total, byCategory, byMonth };
    } catch (error: any) {
      throw new Error(`Error getting contribution stats: ${error.message}`);
    }
  }

  async sendThankYou(contributionId: string): Promise<IContribution> {
    try {
      const contribution = await Contribution.findById(contributionId);
      if (!contribution) {
        throw new Error("Contribution not found");
      }
      
      contribution.thanked = true;
      return await contribution.save();
    } catch (error: any) {
      throw new Error(`Error sending thank you: ${error.message}`);
    }
  }
}

export default new RelationshipService();