const Request = require('../models/Request');
const Trip = require('../models/Trip');
const User = require('../models/User');

// @desc   Request banao (kisi trip ke against)
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
        message: 'Trip, budget, delivery address aur contact phone zaroori hain',
      });
    }

    if (!itemList && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Item list ya image mein se ek zaroori hai',
      });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip nahi mila' });
    }

    if (trip.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Ye trip ab open nahi hai',
      });
    }

    if (trip.shopperId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Apni hi trip pe request nahi kar sakte',
      });
    }

    if (trip.acceptedRequestsCount >= trip.maxRequests) {
      return res.status(400).json({
        success: false,
        message: 'Ye trip full ho chuki hai',
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
      message: 'Request bhej di gayi ✅ Shopper ke accept karne ka intezar karein',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Shopper: apni trip ki requests dekho
// @route  GET /api/requests/trip/:tripId
// @access Private
const getRequestsForTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip nahi mila' });
    }

    if (trip.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi' });
    }

    const requests = await Request.find({ tripId: trip._id })
      .populate('requesterId', 'name rating reviewCount verificationBadge profileImage phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

// @desc   Requester: apni requests dekho
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

// @desc   Ek request ki details
// @route  GET /api/requests/:id
// @access Private (sirf requester ya shopper)
const getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('requesterId', 'name rating reviewCount profileImage phone')
      .populate('shopperId', 'name rating reviewCount profileImage phone')
      .populate('tripId', 'storeName address departureTime returnTime status');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request nahi mili' });
    }

    const userId = req.user._id.toString();
    if (
      request.requesterId._id.toString() !== userId &&
      request.shopperId._id.toString() !== userId
    ) {
      return res.status(403).json({ success: false, message: 'Permission nahi' });
    }

    res.status(200).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

// @desc   Shopper: request accept karo
// @route  PUT /api/requests/:id/accept
// @access Private
const acceptRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request nahi mili' });
    }

    if (request.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi' });
    }

    if (request.status !== 'requested') {
      return res.status(400).json({
        success: false,
        message: 'Ye request ab accept nahi ho sakti',
      });
    }

    const trip = await Trip.findById(request.tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip nahi mila' });
    }

    if (trip.acceptedRequestsCount >= trip.maxRequests) {
      return res.status(400).json({
        success: false,
        message: 'Trip full ho chuki hai',
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
      message: 'Request accept ho gayi ✅',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Shopper: request reject karo
// @route  PUT /api/requests/:id/reject
// @access Private
const rejectRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request nahi mili' });
    }

    if (request.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi' });
    }

    if (request.status !== 'requested') {
      return res.status(400).json({ success: false, message: 'Ye request reject nahi ho sakti' });
    }

    request.status = 'rejected';
    request.cancellationReason = reason || 'Shopper ne reject kar di';
    await request.save();

    res.status(200).json({ success: true, message: 'Request reject kar di', request });
  } catch (error) {
    next(error);
  }
};

// @desc   Requester: request cancel karo
// @route  PUT /api/requests/:id/cancel
// @access Private
const cancelRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request nahi mili' });
    }

    if (request.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi' });
    }

    if (['delivered', 'paid', 'cancelled'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'Ye request ab cancel nahi ho sakti',
      });
    }

    request.status = 'cancelled';
    request.cancellationReason = reason || 'Requester ne cancel kar di';
    request.cancelledAt = new Date();
    await request.save();

    // Trip ka count kam karo agar accepted tha
    if (request.status === 'accepted' || request.status === 'shopping') {
      await Trip.findByIdAndUpdate(request.tripId, {
        $inc: { acceptedRequestsCount: -1 },
        status: 'open',
      });
    }

    res.status(200).json({ success: true, message: 'Request cancel ho gayi', request });
  } catch (error) {
    next(error);
  }
};

// @desc   Shopper: shopping shuru karo
// @route  PUT /api/requests/:id/start-shopping
// @access Private
const startShopping = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request nahi mili' });
    }

    if (request.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi' });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Status accepted nahi hai' });
    }

    request.status = 'shopping';
    request.shoppingStartedAt = new Date();
    await request.save();

    res.status(200).json({ success: true, message: 'Shopping shuru 🛒', request });
  } catch (error) {
    next(error);
  }
};

// @desc   Shopper: actual amount daal kar deliver mark karo
// @route  PUT /api/requests/:id/mark-delivered
// @access Private
const markDelivered = async (req, res, next) => {
  try {
    const { actualAmount } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request nahi mili' });
    }

    if (request.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi' });
    }

    if (!['accepted', 'shopping'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'Sirf accepted ya shopping status se deliver kar sakte ho',
      });
    }

    if (!actualAmount || actualAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Actual amount zaroori hai',
      });
    }

    request.actualAmount = actualAmount;
    request.totalAmount = actualAmount + (request.serviceFee || 0);
    request.status = 'delivered';
    request.deliveredAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Deliver mark ho gaya ✅ Ab requester payment karega',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Requester: confirm karo ke saman mil gaya
// @route  PUT /api/requests/:id/confirm-delivery
// @access Private
const confirmDelivery = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request nahi mili' });
    }

    if (request.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi' });
    }

    if (request.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Status delivered nahi hai' });
    }

    // Yahan transaction bhi create karni chahiye (payment controller)
    request.status = 'paid';
    request.paidAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Delivery confirm ho gayi ✅',
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