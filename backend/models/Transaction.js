const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      unique: true,
      index: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Amount breakdown (PKR)
    amount: { type: Number, required: true }, // saman ki qeemat
    serviceFee: { type: Number, default: 0 }, // platform/shopper fee
    platformCommission: { type: Number, default: 0 }, // platform ka cut
    totalAmount: { type: Number, required: true }, // jo requester ne pay kiya
    shopperPayout: { type: Number, required: true }, // jo shopper ko milega

    // Payment method
    paymentMethod: {
      type: String,
      enum: ['jazzcash', 'easypaisa', 'cod', 'manual'],
      required: true,
    },
    paymentGatewayRef: { type: String, default: '' }, // gateway transaction ID

    // Escrow status
    escrowStatus: {
      type: String,
      enum: ['pending', 'held', 'released', 'refunded', 'failed'],
      default: 'pending',
      index: true,
    },

    // Timestamps
    heldAt: Date,
    releasedAt: Date,
    refundedAt: Date,

    // Failure info
    failureReason: { type: String, default: '' },

    // Dispute
    isDisputed: { type: Boolean, default: false },
    disputeReason: { type: String, default: '' },
    disputeResolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    disputeResolution: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);