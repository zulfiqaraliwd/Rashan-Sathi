const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      index: true,
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Rating and comment
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      maxlength: 500,
      default: '',
    },

    // Who is giving the review
    reviewerRole: {
      type: String,
      enum: ['requester', 'shopper'],
      required: true,
    },
  },
  { timestamps: true }
);

// A user can only review a request once
reviewSchema.index({ requestId: 1, fromUserId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);