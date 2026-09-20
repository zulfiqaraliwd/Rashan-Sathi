const Transaction = require('../models/Transaction');
const Request = require('../models/Request');
const User = require('../models/User');

// @desc   Requester: payment made, upload TRX ID + screenshot
// @route  POST /api/payments/:requestId/mark-paid
// @access Private (requester)
const markPaid = async (req, res, next) => {
  try {
    const { trxId, paymentScreenshot, paymentMethod } = req.body;
    const request = await Request.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    if (request.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be made on delivered status',
      });
    }

    if (!trxId || !paymentScreenshot) {
      return res.status(400).json({
        success: false,
        message: 'TRX ID and screenshot are required',
      });
    }

    let transaction = await Transaction.findOne({ requestId: request._id });
    if (!transaction) {
      transaction = new Transaction({
        requestId: request._id,
        requesterId: request.requesterId,
        shopperId: request.shopperId,
        amount: request.actualAmount,
        serviceFee: request.serviceFee || 0,
        totalAmount: request.totalAmount || request.actualAmount,
        shopperPayout: request.actualAmount + (request.serviceFee || 0),
        paymentMethod: paymentMethod || 'jazzcash',
      });
    }

    transaction.trxId = trxId;
    transaction.paymentScreenshot = paymentScreenshot;
    transaction.paidAt = new Date();
    transaction.escrowStatus = 'claimed';
    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Payment claimed. Shopper will confirm.',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Shopper: confirm payment (money received)
// @route  POST /api/payments/:requestId/confirm
// @access Private (shopper)
const confirmPayment = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    const transaction = await Transaction.findOne({ requestId: request._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    transaction.escrowStatus = 'confirmed';
    transaction.shopperConfirmed = true;
    transaction.shopperConfirmedAt = new Date();
    transaction.releasedAt = new Date();
    await transaction.save();

    request.status = 'paid';
    request.paidAt = new Date();
    await request.save();

    // Update shopper earnings
    await User.findByIdAndUpdate(request.shopperId, {
      $inc: {
        totalEarnings: transaction.shopperPayout,
        totalDelivered: 1,
      },
    });

    await User.findByIdAndUpdate(request.requesterId, {
      $inc: { totalSpent: transaction.totalAmount },
    });

    res.status(200).json({
      success: true,
      message: 'Payment confirmed ✅ Order complete!',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Shopper: reject payment (money not received)
// @route  POST /api/payments/:requestId/dispute
// @access Private (shopper)
const disputePayment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const request = await Request.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    const transaction = await Transaction.findOne({ requestId: request._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    transaction.escrowStatus = 'disputed';
    transaction.isDisputed = true;
    transaction.disputeReason = reason || 'Money not received';
    await transaction.save();

    request.status = 'disputed';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Dispute filed. Admin will review.',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get your transactions
// @route  GET /api/payments/my
// @access Private
const getMyTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ requesterId: req.user._id }, { shopperId: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('requestId', 'itemList actualAmount totalAmount status')
      .populate('requesterId', 'name phone')
      .populate('shopperId', 'name phone');

    res.status(200).json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markPaid,
  confirmPayment,
  disputePayment,
  getMyTransactions,
};