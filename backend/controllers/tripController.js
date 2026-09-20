const Trip = require('../models/Trip');
const Request = require('../models/Request');

// @desc   Post a new trip
// @route  POST /api/trips
// @access Private (verified only)
const createTrip = async (req, res, next) => {
  try {
    const {
      storeName,
      address,
      coordinates, // [lng, lat]
      departureTime,
      returnTime,
      serviceRadiusKm,
      maxRequests,
      note,
      serviceFee,
    } = req.body;

    if (!storeName || !address || !coordinates || !departureTime || !returnTime) {
      return res.status(400).json({
        success: false,
        message: 'Store, address, location and time window are required',
      });
    }

    if (coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Provide coordinates in [longitude, latitude] format',
      });
    }

    if (new Date(departureTime) >= new Date(returnTime)) {
      return res.status(400).json({
        success: false,
        message: 'Return time must be after departure time',
      });
    }

    const trip = await Trip.create({
      shopperId: req.user._id,
      storeName,
      address,
      location: { type: 'Point', coordinates },
      departureTime,
      returnTime,
      serviceRadiusKm: serviceRadiusKm || 3,
      maxRequests: maxRequests || 5,
      note: note || '',
      serviceFee: serviceFee || 100,
      status: 'open',
    });

    // Update user stats
    await require('../models/User').findByIdAndUpdate(req.user._id, {
      $inc: { totalTripsPosted: 1 },
    });

    res.status(201).json({
      success: true,
      message: 'Trip posted ✅',
      trip,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get nearby trips (geospatial search)
// @route  GET /api/trips/nearby?lng=67.0011&lat=24.8607&radius=5
// @access Private
const getNearbyTrips = async (req, res, next) => {
  try {
    const { lng, lat, radius } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required',
      });
    }

    const radiusKm = parseFloat(radius) || parseFloat(process.env.DEFAULT_SEARCH_RADIUS_KM) || 5;
    const radiusInMeters = radiusKm * 1000;

    const trips = await Trip.find({
      status: 'open',
      departureTime: { $gte: new Date() },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radiusInMeters,
        },
      },
    })
      .populate('shopperId', 'name rating reviewCount verificationBadge profileImage')
      .limit(50);

    res.status(200).json({
      success: true,
      count: trips.length,
      trips,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get your trips
// @route  GET /api/trips/my
// @access Private
const getMyTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ shopperId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('shopperId', 'name rating reviewCount');

    res.status(200).json({ success: true, count: trips.length, trips });
  } catch (error) {
    next(error);
  }
};

// @desc   Get details of a single trip
// @route  GET /api/trips/:id
// @access Private
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate(
      'shopperId',
      'name rating reviewCount verificationBadge profileImage phone'
    );

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const requests = await Request.find({ tripId: trip._id })
      .populate('requesterId', 'name rating reviewCount profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, trip, requests });
  } catch (error) {
    next(error);
  }
};

// @desc   Cancel trip
// @route  DELETE /api/trips/:id
// @access Private
const cancelTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own trip',
      });
    }

    if (trip.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed trip cannot be cancelled',
      });
    }

    trip.status = 'cancelled';
    await trip.save();

    // Also cancel all pending requests
    await Request.updateMany(
      { tripId: trip._id, status: { $in: ['requested', 'accepted'] } },
      { status: 'cancelled', cancellationReason: 'Shopper cancelled the trip' }
    );

    res.status(200).json({ success: true, message: 'Trip cancelled', trip });
  } catch (error) {
    next(error);
  }
};

// @desc   Update trip (status change)
// @route  PUT /api/trips/:id
// @access Private
const updateTripStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    const allowed = ['open', 'full', 'in-progress', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    trip.status = status;
    await trip.save();

    res.status(200).json({ success: true, message: 'Trip status updated', trip });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrip,
  getNearbyTrips,
  getMyTrips,
  getTripById,
  cancelTrip,
  updateTripStatus,
};