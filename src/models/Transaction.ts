import { Schema, model, Types } from 'mongoose';

/**
 * Schema for an individual disbursement to a service provider.
 * Each disbursement holds provider info, amount, and its status.
 */
const DisbursementSchema = new Schema({
  provider: { type: String, required: true }, // E.g. 'MTN', 'EEDC'
  serviceType: { type: String }, // E.g. 'data', 'utility', 'school'
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  meta: { type: Schema.Types.Mixed }, // Optional metadata for integration
  receiptUrl: { type: String }, // Where to access the digital receipt
});

/**
 * Main transaction schema. Represents one payment session.
 * May contain multiple disbursements to different providers.
 */
const TransactionSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true },
    request: { type: Types.ObjectId, ref: 'Request' },
    reference: { type: String, unique: true }, // Unique payment reference
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'cancelled'],
      default: 'pending',
    },
    disbursements: [DisbursementSchema], // Embedded sub-payments
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

export default model('Transaction', TransactionSchema);