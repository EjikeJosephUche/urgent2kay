import express from "express";
import relationshipController from "../controllers/relationshipController";
import authMiddleware from "../middlewares/auth.middleware";

const router = express.Router();


router.use(authMiddleware);

// Relationship Profile Routes
router.post("/", relationshipController.createRelationship);
router.get("/", relationshipController.getRelationships);
router.get("/:id", relationshipController.getRelationshipById);
router.put("/:id", relationshipController.updateRelationship);
router.delete("/:id", relationshipController.deleteRelationship);

// Spending Control Routes
router.post("/:relationshipId/spending-controls", relationshipController.setSpendingControls);
router.get("/:relationshipId/spending-controls", relationshipController.getSpendingControls);
router.post("/:relationshipId/check-limits", relationshipController.checkSpendingLimits);

// Contribution Tracking Routes
router.post("/contributions", relationshipController.recordContribution);
router.get("/:relationshipId/contributions", relationshipController.getContributions);
router.get("/:relationshipId/contribution-stats", relationshipController.getContributionStats);
router.post("/contributions/:contributionId/thank-you", relationshipController.sendThankYou);

export default router;