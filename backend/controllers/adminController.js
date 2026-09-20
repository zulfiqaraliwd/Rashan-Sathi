const User = require('../models/User');
const Trip = require('../models/Trip');
const Request = require('../models/Request');
const Transaction = require('../models/Transaction');
const Review = require('../models/Review');

// @desc   Get all users
// @route  GET /api/admin/users?page=1&limit=20&search=&role=
// @access Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get details of a specific user by ID
// @route  GET /api/admin/users/:id
// @access Private/Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [trips, requests, transactions] = await Promise.all([
      Trip.find({ shopperId: user._id }).countDocuments(),
      Request.find({ requesterId: user._id }).countDocuments(),
      Transaction.find({
        $or: [{ requesterId: user._id }, { shopperId: user._id }],
      }).countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      user,
      stats: { trips, requests, transactions },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Ban/unban a user
// @route  PUT /api/admin/users/:id/toggle-active
// @access Private/Admin
const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot ban an admin',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isActive ? 'User activated' : 'User banned',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Approve/reject verification badge
// @route  PUT /api/admin/users/:id/verification
// @access Private/Admin
const updateVerification = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['none', 'pending', 'verified'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Use: none, pending, or verified',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verificationBadge: status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `Verification badge set to "${status}"`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all disputes
// @route  GET /api/admin/disputes
// @access Private/Admin
const getAllDisputes = async (req, res, next) => {
  try {
    const disputes = await Transaction.find({ isDisputed: true })
      .sort({ createdAt: -1 })
      .populate('requesterId', 'name email phone')
      .populate('shopperId', 'name email phone')
      .populate('requestId', 'itemList actualAmount status');

    res.status(200).json({
      success: true,
      count: disputes.length,
      disputes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Resolve a dispute
// @route  PUT /api/admin/disputes/:id/resolve
// @access Private/Admin
const resolveDispute = async (req, res, next) => {
  try {
    const { resolution, escrowStatus } = req.body;

    if (!resolution) {
      return res.status(400).json({
        success: false,
        message: 'Resolution note is required',
      });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    transaction.isDisputed = false;
    transaction.disputeResolution = resolution;
    transaction.disputeResolvedBy = req.user._id;

    if (escrowStatus && ['released', 'refunded'].includes(escrowStatus)) {
      transaction.escrowStatus = escrowStatus;
    }

    await transaction.save();

    // Also update request status
    await Request.findByIdAndUpdate(transaction.requestId, {
      status: 'paid',
    });

    res.status(200).json({
      success: true,
      message: 'Dispute resolved ✅',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all transactions
// @route  GET /api/admin/transactions?page=1&limit=20&status=
// @access Private/Admin
const getAllTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.escrowStatus = req.query.status;
    if (req.query.disputed === 'true') filter.isDisputed = true;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('requesterId', 'name email phone')
        .populate('shopperId', 'name email phone')
        .populate('requestId', 'itemList actualAmount status'),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get platform stats (for dashboard)
// @route  GET /api/admin/stats
// @access Private/Admin
const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      totalTrips,
      activeTrips,
      totalRequests,
      completedRequests,
      totalReviews,
      revenueData,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ isPhoneVerified: true }),
      Trip.countDocuments(),
      Trip.countDocuments({ status: 'open' }),
      Request.countDocuments(),
      Request.countDocuments({ status: 'paid' }),
      Review.countDocuments(),
      Transaction.aggregate([
        { $match: { escrowStatus: 'confirmed' } },
        {
          $group: {
            _id: null,
            totalVolume: { $sum: '$totalAmount' },
            totalCommission: { $sum: '$platformCommission' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: { total: totalUsers, verified: verifiedUsers },
        trips: { total: totalTrips, active: activeTrips },
        requests: { total: totalRequests, completed: completedRequests },
        reviews: totalReviews,
        revenue: revenueData[0] || { totalVolume: 0, totalCommission: 0, count: 0 },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  toggleUserActive,
  updateVerification,
  getAllDisputes,
  resolveDispute,
  getAllTransactions,
  getStats,
};