import Notification from "../models/notification.model";
import User from "../models/user.model";
import nodemailer from "nodemailer";
import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } from "../utils/env";
import dotenv from "dotenv";
dotenv.config();

/**
 * Interface for creating a notification
 */
interface CreateNotificationParams {
  recipient: string | object;
  type: "request" | "payment" | "relationship" | "reminder" | "acknowledgement";
  title: string;
  message: string;
  relatedId?: string | object;
}

/**
 * Create an in-app notification
 */
export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const { recipient, type, title, message, relatedId } = params;

    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedId,
      isRead: false,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
};

/**
 * Send email notification
 */
export const sendEmailNotification = async (
  email: string,
  subject: string,
  html: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT),
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email notification:", error);
    return false;
  }
};

/**
 * Create and send both in-app and email notifications
 */
export const notifyUser = async (
  userId: string,
  type: CreateNotificationParams["type"],
  title: string,
  message: string,
  relatedId?: string,
  emailTemplate?: string
) => {
  try {
    // Create in-app notification
    await createNotification({
      recipient: userId,
      type,
      title,
      message,
      relatedId,
    });

    // Get user email
    const user = await User.findById(userId);
    if (!user || !user.email) {
      console.warn(`Could not find email for user ${userId}`);
      return;
    }

    // Send email notification if template provided
    if (emailTemplate) {
      await sendEmailNotification(user.email, title, emailTemplate);
    }

    return true;
  } catch (error) {
    console.error("Error in notifyUser:", error);
    return false;
  }
};

/**
 * Generate HTML email template for different notification types
 */
export const generateEmailTemplate = (
  type: string,
  title: string,
  message: string,
  buttonText?: string,
  buttonUrl?: string
) => {
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4f46e5;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 0 0 5px 5px;
        }
        .button {
          display: inline-block;
          background-color: #4f46e5;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>URGENT 2KAY</h1>
        </div>
        <div class="content">
          <h2>${title}</h2>
          <p>${message}</p>
          ${
            buttonText && buttonUrl
              ? `<a href="${buttonUrl}" class="button">${buttonText}</a>`
              : ""
          }
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} URGENT 2KAY. All rights reserved.</p>
          <p>This email was sent to you as part of your URGENT 2KAY account.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return baseTemplate;
};