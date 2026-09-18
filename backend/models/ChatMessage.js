const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'system'],
      default: 'text',
    },
    imageUrl: { type: String, default: '' },

    // Read status
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

chatMessageSchema.index({ requestId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);