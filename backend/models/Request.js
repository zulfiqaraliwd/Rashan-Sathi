const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    shopperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Items — text list or image
    itemList: {
      type: String, // "2 kg flour, 1 dozen eggs, 1 litre milk"
      required: function () {
        return !this.imageUrl;
      },
      maxlength: 1000,
    },
    imageUrl: {
      type: String, // if a photo of the list was sent
      default: '',
    },

    // Budget
    budget: {
      type: Number, // PKR
      required: [true, 'Budget is required'],
      min: [1, 'Budget must be greater than 0'],
    },
    actualAmount: {
      type: Number, // how much the shopper actually spent on items
      default: 0,
    },
    serviceFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number, // actualAmount + serviceFee
      default: 0,
    },

    // Delivery details
    deliveryAddress: {
      type: String,
      required: [true, 'Delivery address is required'],
    },
    deliveryLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    contactPhone: { type: String, required: true },

    // Status flow: requested → accepted → shopping → delivered → paid
    status: {
      type: String,
      enum: [
        'requested',
        'accepted',
        'rejected',
        'shopping',
        'delivered',
        'paid',
        'cancelled',
        'disputed',
      ],
      default: 'requested',
      index: true,
    },

    // Timestamps for each stage
    acceptedAt: Date,
    shoppingStartedAt: Date,
    deliveredAt: Date,
    paidAt: Date,
    cancelledAt: Date,

    // Cancellation reason
    cancellationReason: { type: String, default: '' },

    // Notes
    specialInstructions: { type: String, maxlength: 300, default: '' },

    // Rating flag
    isRatedByRequester: { type: Boolean, default: false },
    isRatedByShopper: { type: Boolean, default: false },
  },
  { timestamps: true }
);

requestSchema.index({ deliveryLocation: '2dsphere' });
requestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);