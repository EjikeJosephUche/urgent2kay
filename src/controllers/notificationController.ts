import { Request, Response } from "express";
import Notification from "../models/notification.model";

/**
 * Get all notifications for the authenticated user
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { isRead, type, limit = 10, page = 1 } = req.query;

    const query: any = {
      recipient: userId,
    };

    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    if (type) {
      query.type = type;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      notifications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const notification = await Notification.findOne({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res
      .status(500)
      .json({ message: "Failed to mark all notifications as read" });
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const notification = await Notification.findOne({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await Notification.deleteOne({ _id: id });

    res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};