const Trip = require('../models/Trip');
const Request = require('../models/Request');

// @desc   Naya trip post karo
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
        message: 'Store, address, location aur time window zaroori hain',
      });
    }

    if (coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates [longitude, latitude] format mein dein',
      });
    }

    if (new Date(departureTime) >= new Date(returnTime)) {
      return res.status(400).json({
        success: false,
        message: 'Return time departure se baad honi chahiye',
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

    // User stats update
    await require('../models/User').findByIdAndUpdate(req.user._id, {
      $inc: { totalTripsPosted: 1 },
    });

    res.status(201).json({
      success: true,
      message: 'Trip post ho gaya ✅',
      trip,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Nearby trips dekho (geospatial search)
// @route  GET /api/trips/nearby?lng=67.0011&lat=24.8607&radius=5
// @access Private
const getNearbyTrips = async (req, res, next) => {
  try {
    const { lng, lat, radius } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: 'Longitude aur latitude zaroori hain',
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

// @desc   Apne trips dekho
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

// @desc   Ek trip ki details
// @route  GET /api/trips/:id
// @access Private
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate(
      'shopperId',
      'name rating reviewCount verificationBadge profileImage phone'
    );

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip nahi mila' });
    }

    const requests = await Request.find({ tripId: trip._id })
      .populate('requesterId', 'name rating reviewCount profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, trip, requests });
  } catch (error) {
    next(error);
  }
};

// @desc   Trip cancel karo
// @route  DELETE /api/trips/:id
// @access Private
const cancelTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip nahi mila' });
    }

    if (trip.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Sirf apni trip cancel kar sakte ho',
      });
    }

    if (trip.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed trip cancel nahi ho sakti',
      });
    }

    trip.status = 'cancelled';
    await trip.save();

    // Saari pending requests bhi cancel karo
    await Request.updateMany(
      { tripId: trip._id, status: { $in: ['requested', 'accepted'] } },
      { status: 'cancelled', cancellationReason: 'Shopper ne trip cancel kar di' }
    );

    res.status(200).json({ success: true, message: 'Trip cancel ho gayi', trip });
  } catch (error) {
    next(error);
  }
};

// @desc   Trip update karo (status change)
// @route  PUT /api/trips/:id
// @access Private
const updateTripStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip nahi mila' });
    }

    if (trip.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi' });
    }

    const allowed = ['open', 'full', 'in-progress', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    trip.status = status;
    await trip.save();

    res.status(200).json({ success: true, message: 'Trip status update', trip });
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