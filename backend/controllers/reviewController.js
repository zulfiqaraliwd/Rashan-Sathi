const Review = require('../models/Review');
const Request = require('../models/Request');

// @desc   Review do
// @route  POST /api/reviews
// @access Private
const createReview = async (req, res, next) => {
  try {
    const { requestId, rating, comment } = req.body;

    if (!requestId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Request ID aur rating zaroori hain',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating 1 se 5 ke darmiyan ho',
      });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request nahi mili' });
    }

    if (request.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Review sirf paid order pe di ja sakti hai',
      });
    }

    const userId = req.user._id.toString();
    const isRequester = request.requesterId.toString() === userId;
    const isShopper = request.shopperId.toString() === userId;

    if (!isRequester && !isShopper) {
      return res.status(403).json({ success: false, message: 'Permission nahi' });
    }

    const toUserId = isRequester ? request.shopperId : request.requesterId;
    const reviewerRole = isRequester ? 'requester' : 'shopper';

    const existing = await Review.findOne({ requestId, fromUserId: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Aap pehle hi review de chuke hain',
      });
    }

    const review = await Review.create({
      requestId,
      fromUserId: req.user._id,
      toUserId,
      rating,
      comment: comment || '',
      reviewerRole,
    });

    // Request pe flag set karo
    if (isRequester) {
      request.isRatedByRequester = true;
    } else {
      request.isRatedByShopper = true;
    }
    await request.save();

    res.status(201).json({
      success: true,
      message: 'Review submit ho gayi ✅',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Kisi user ki saari reviews dekho
// @route  GET /api/reviews/user/:userId
// @access Public
const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ toUserId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('fromUserId', 'name profileImage rating')
      .populate('requestId', 'itemList');

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getUserReviews };