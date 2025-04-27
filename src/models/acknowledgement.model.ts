import mongoose, { Schema } from "mongoose";
import { IAcknowledgement } from "../interfaces/relationship.interface";

const acknowledgementSchema = new Schema<IAcknowledgement>(
  {
    relationship: {
      type: Schema.Types.ObjectId,
      ref: "Relationship",
      required: true,
    },
    billRequest: {
      type: Schema.Types.ObjectId,
      ref: "BillRequest",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Acknowledgement = mongoose.model<IAcknowledgement>(
  "Acknowledgement",
  acknowledgementSchema
);
export default Acknowledgement;