const Request = require('../models/Request');
const Trip = require('../models/Trip');
const User = require('../models/User');

// @desc   Create a request (against a trip)
// @route  POST /api/requests
// @access Private (verified only)
const createRequest = async (req, res, next) => {
  try {
    const {
      tripId,
      itemList,
      imageUrl,
      budget,
      deliveryAddress,
      deliveryCoordinates,
      contactPhone,
      specialInstructions,
    } = req.body;

    if (!tripId || !budget || !deliveryAddress || !deliveryCoordinates || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Trip, budget, delivery address and contact phone are required',
      });
    }

    if (!itemList && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Either item list or image is required',
      });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This trip is no longer open',
      });
    }

    if (trip.shopperId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request on your own trip',
      });
    }

    if (trip.acceptedRequestsCount >= trip.maxRequests) {
      return res.status(400).json({
        success: false,
        message: 'This trip is full',
      });
    }

    const request = await Request.create({
      requesterId: req.user._id,
      tripId: trip._id,
      shopperId: trip.shopperId,
      itemList: itemList || '',
      imageUrl: imageUrl || '',
      budget,
      deliveryAddress,
      deliveryLocation: { type: 'Point', coordinates: deliveryCoordinates },
      contactPhone,
      specialInstructions: specialInstructions || '',
      serviceFee: trip.serviceFee,
      status: 'requested',
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalRequestsMade: 1 },
    });

    res.status(201).json({
      success: true,
      message: 'Request sent ✅ Wait for the shopper to accept',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Shopper: get requests for your trip
// @route  GET /api/requests/trip/:tripId
// @access Private
const getRequestsForTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    const requests = await Request.find({ tripId: trip._id })
      .populate('requesterId', 'name rating reviewCount verificationBadge profileImage phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

// @desc   Requester: get your requests
// @route  GET /api/requests/my
// @access Private
const getMyRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ requesterId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('shopperId', 'name rating reviewCount profileImage phone')
      .populate('tripId', 'storeName address departureTime returnTime status');

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

// @desc   Get details of a single request
// @route  GET /api/requests/:id
// @access Private (only requester or shopper)
const getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('requesterId', 'name rating reviewCount profileImage phone')
      .populate('shopperId', 'name rating reviewCount profileImage phone')
      .populate('tripId', 'storeName address departureTime returnTime status');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const userId = req.user._id.toString();
    if (
      request.requesterId._id.toString() !== userId &&
      request.shopperId._id.toString() !== userId
    ) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    res.status(200).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

// @desc   Shopper: accept request
// @route  PUT /api/requests/:id/accept
// @access Private
const acceptRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    if (request.status !== 'requested') {
      return res.status(400).json({
        success: false,
        message: 'This request can no longer be accepted',
      });
    }

    const trip = await Trip.findById(request.tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.acceptedRequestsCount >= trip.maxRequests) {
      return res.status(400).json({
        success: false,
        message: 'Trip is full',
      });
    }

    request.status = 'accepted';
    request.acceptedAt = new Date();
    await request.save();

    trip.acceptedRequestsCount += 1;
    if (trip.acceptedRequestsCount >= trip.maxRequests) {
      trip.status = 'full';
    }
    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Request accepted ✅',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Shopper: reject request
// @route  PUT /api/requests/:id/reject
// @access Private
const rejectRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    if (request.status !== 'requested') {
      return res.status(400).json({ success: false, message: 'This request cannot be rejected' });
    }

    request.status = 'rejected';
    request.cancellationReason = reason || 'Rejected by shopper';
    await request.save();

    res.status(200).json({ success: true, message: 'Request rejected', request });
  } catch (error) {
    next(error);
  }
};

// @desc   Requester: cancel request
// @route  PUT /api/requests/:id/cancel
// @access Private
const cancelRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    if (['delivered', 'paid', 'cancelled'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'This request can no longer be cancelled',
      });
    }

    request.status = 'cancelled';
    request.cancellationReason = reason || 'Cancelled by requester';
    request.cancelledAt = new Date();
    await request.save();

    // Decrement trip count if it was accepted
    if (request.status === 'accepted' || request.status === 'shopping') {
      await Trip.findByIdAndUpdate(request.tripId, {
        $inc: { acceptedRequestsCount: -1 },
        status: 'open',
      });
    }

    res.status(200).json({ success: true, message: 'Request cancelled', request });
  } catch (error) {
    next(error);
  }
};

// @desc   Shopper: start shopping
// @route  PUT /api/requests/:id/start-shopping
// @access Private
const startShopping = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Status is not accepted' });
    }

    request.status = 'shopping';
    request.shoppingStartedAt = new Date();
    await request.save();

    res.status(200).json({ success: true, message: 'Shopping started 🛒', request });
  } catch (error) {
    next(error);
  }
};

// @desc   Shopper: enter actual amount and mark delivered
// @route  PUT /api/requests/:id/mark-delivered
// @access Private
const markDelivered = async (req, res, next) => {
  try {
    const { actualAmount } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    if (!['accepted', 'shopping'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'Can only deliver from accepted or shopping status',
      });
    }

    if (!actualAmount || actualAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Actual amount is required',
      });
    }

    request.actualAmount = actualAmount;
    request.totalAmount = actualAmount + (request.serviceFee || 0);
    request.status = 'delivered';
    request.deliveredAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Marked as delivered ✅ Now the requester will pay',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Requester: confirm that items were received
// @route  PUT /api/requests/:id/confirm-delivery
// @access Private
const confirmDelivery = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    if (request.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Status is not delivered' });
    }

    // A transaction should also be created here (payment controller)
    request.status = 'paid';
    request.paidAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Delivery confirmed ✅',
      request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequestsForTrip,
  getMyRequests,
  getRequestById,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  startShopping,
  markDelivered,
  confirmDelivery,
};