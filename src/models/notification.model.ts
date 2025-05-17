import { Schema, model, Types } from "mongoose";

interface Notification {
  title: string;
  type: "invitation" | "alert" | "info" | "reminder";
  message: string;
  link: string;
  user: {
    /* ... */
  };
  data?: {
    bundleId?: string;
  };
}

const notificationSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    enum: ["invitation", "alert", "info", "reminder"],
    default: "info",
  },
  read: {
    type: Boolean,
    default: false,
  },
  actions: {
    type: [String],
    enum: ["accept", "decline", "save"],
    default: undefined,
  },
  data: { type: Schema.Types.Mixed, default: {} },
  status: {
    type: String,
    enum: ["unread", "read", "archived"],
    default: "unread",
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Notification = model("Notification", notificationSchema);
