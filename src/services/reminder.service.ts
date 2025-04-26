import cron from "node-cron";
import BillRequest from "../models/bill-request.model";
import { notifyUser, generateEmailTemplate } from "./notification.service";
import Relationship from "../models/relationship.model";

/**
 * Start the reminder scheduler
 * This runs every day at midnight
 */
export const startReminderScheduler = () => {
  // Schedule daily checks at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily bill request reminders check...");
    await scheduleBillRequestReminders();
  });

  // Schedule weekly checks on Monday at 9:00 AM
  cron.schedule("0 9 * * 1", async () => {
    console.log("Running weekly relationship reminders check...");
    await scheduleRelationshipReminders();
  });

  console.log("Reminder scheduler started");
};

/**
 * Schedule reminders for pending bill requests
 */
async function scheduleBillRequestReminders() {
  try {
    // Find bill requests that are still pending and due within the next 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const pendingRequests = await BillRequest.find({
      status: { $in: ["pending", "partially-funded"] },
    }).populate({
      path: "bills",
      match: { dueDate: { $lte: threeDaysFromNow } },
    });

    // Only process requests that have bills due soon
    const requestsWithDueBills = pendingRequests.filter(
      (req) => req.bills && req.bills.length > 0
    );

    // Send reminders to sponsors for each request
    for (const request of requestsWithDueBills) {
      for (const sponsorId of request.sponsors) {
        const title = "Bill Request Reminder";
        const message = `There are bills in a request you're sponsoring that are due within the next 3 days. Total amount: ${request.totalAmount}`;
        
        const emailTemplate = generateEmailTemplate(
          "reminder",
          title,
          message,
          "View Request",
          `${process.env.CLIENT_URL}/requests/${request._id}`
        );

        await notifyUser(
          sponsorId.toString(),
          "reminder",
          title,
          message,
          request._id.toString(),
          emailTemplate
        );
      }
    }

    console.log(`Sent reminders for ${requestsWithDueBills.length} bill requests`);
  } catch (error) {
    console.error("Error scheduling bill request reminders:", error);
  }
}

/**
 * Schedule relationship activity reminders for inactive relationships
 */
async function scheduleRelationshipReminders() {
  try {
    // Find active relationships with no recent activity (no bill requests in the past 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const relationships = await Relationship.find({
      status: "active",
    });

    for (const relationship of relationships) {
      // Check if there has been any recent bill requests between these users
      const recentRequest = await BillRequest.findOne({
        $or: [
          { request: relationship.requestor, sponsors: relationship.acceptor },
          { request: relationship.acceptor, sponsors: relationship.requestor },
        ],
        createdAt: { $gte: thirtyDaysAgo },
      });

      // If no recent activity, send a reminder to both parties
      if (!recentRequest) {
        const title = "Relationship Activity Reminder";
        const message = `You haven't had any bill payment activity with your ${relationship.type} relationship in the past 30 days.`;
        
        const emailTemplate = generateEmailTemplate(
          "reminder",
          title,
          message,
          "View Relationship",
          `${process.env.CLIENT_URL}/relationships/${relationship._id}`
        );

        // Notify both parties
        await notifyUser(
          relationship.requestor.toString(),
          "reminder",
          title,
          message,
          relationship._id.toString(),
          emailTemplate
        );

        await notifyUser(
          relationship.acceptor.toString(),
          "reminder",
          title,
          message,
          relationship._id.toString(),
          emailTemplate
        );
      }
    }

    console.log(`Sent relationship reminders check completed`);
  } catch (error) {
    console.error("Error scheduling relationship reminders:", error);
  }
}