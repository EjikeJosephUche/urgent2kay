import nodemailer from "nodemailer";
import User from "../models/user.model"; 
import { Notification } from "../models/notification.model";

export const sendReminderEmail = async (
  userId: string,
  notification: typeof Notification.prototype
) => {
  try {
    const user = await User.findById(userId);

    if (!user || !user.email) {
      console.warn(`User not found or email missing for userId: ${userId}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail", 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Reminder: ${notification.title}`,
      html: `
        <h3>Hello ${user.firstName || "there"},</h3>
        <p>This is a reminder about your pending action:</p>
        <p><strong>${notification.message}</strong></p>
        <p>Please act before <strong>${new Date(
          notification.expiresAt
        ).toLocaleDateString()}</strong>.</p>
        <p>Best regards,<br/>Urgent 2kay Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending reminder email:", error);
  }
};
