const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    shopperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
    },

    // Trip's pickup location (where shopping will be done)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: { type: String, required: true },

    // Time window
    departureTime: {
      type: Date,
      required: [true, 'Departure time is required'],
    },
    returnTime: {
      type: Date,
      required: [true, 'Return time is required'],
    },

    // Radius in km — requesters within this radius will see it
    serviceRadiusKm: {
      type: Number,
      default: 3,
      min: 1,
      max: 20,
    },

    // Capacity
    maxRequests: {
      type: Number,
      default: 5,
      min: 1,
      max: 20,
    },
    acceptedRequestsCount: {
      type: Number,
      default: 0,
    },

    // Extra note
    note: { type: String, maxlength: 300, default: '' },

    // Status
    status: {
      type: String,
      enum: ['open', 'full', 'in-progress', 'completed', 'cancelled'],
      default: 'open',
      index: true,
    },

    // Estimated service fee (PKR) — shopper will decide
    serviceFee: {
      type: Number,
      default: 100, // Rs. 100 per order (adjustable)
      min: 0,
    },

    // Stats
    totalDelivered: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Geospatial index — for finding nearby trips
tripSchema.index({ location: '2dsphere' });

// Compound index for query performance
tripSchema.index({ status: 1, departureTime: 1 });

module.exports = mongoose.model('Trip', tripSchema);