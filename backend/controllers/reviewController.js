const Review = require('../models/Review');
const Request = require('../models/Request');

// @desc   Create a review
// @route  POST /api/reviews
// @access Private
const createReview = async (req, res, next) => {
  try {
    const { requestId, rating, comment } = req.body;

    if (!requestId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Request ID and rating are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Review can only be given on a paid order',
      });
    }

    const userId = req.user._id.toString();
    const isRequester = request.requesterId.toString() === userId;
    const isShopper = request.shopperId.toString() === userId;

    if (!isRequester && !isShopper) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    const toUserId = isRequester ? request.shopperId : request.requesterId;
    const reviewerRole = isRequester ? 'requester' : 'shopper';

    const existing = await Review.findOne({ requestId, fromUserId: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review',
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

    // Set flag on request
    if (isRequester) {
      request.isRatedByRequester = true;
    } else {
      request.isRatedByShopper = true;
    }
    await request.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted ✅',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all reviews for a user
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