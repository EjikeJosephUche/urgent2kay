import cron from "node-cron";
import { Notification } from "../models/notification.model";
import { sendReminderEmail } from "../utils/emailService";

cron.schedule("0 9 * * *", async () => {
  try {
    const upcomingExpirations = await Notification.find({
      expiresAt: { $lte: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      read: false,
    });

    for (const notification of upcomingExpirations) {
      await sendReminderEmail(notification.user.toString(), notification);
    }

    console.log("Reminder notifications sent successfully.");
  } catch (error) {
    console.error("Error sending reminder notifications:", error);
  }
});
