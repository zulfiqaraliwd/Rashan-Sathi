const Transaction = require('../models/Transaction');
const Request = require('../models/Request');
const User = require('../models/User');

// @desc   Requester: payment kiya, TRX ID + screenshot upload
// @route  POST /api/payments/:requestId/mark-paid
// @access Private (requester)
const markPaid = async (req, res, next) => {
  try {
    const { trxId, paymentScreenshot, paymentMethod } = req.body;
    const request = await Request.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request nahi mili' });
    }

    if (request.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi' });
    }

    if (request.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Payment sirf delivered status pe ho sakti hai',
      });
    }

    if (!trxId || !paymentScreenshot) {
      return res.status(400).json({
        success: false,
        message: 'TRX ID aur screenshot zaroori hain',
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
      message: 'Payment claim ho gayi. Shopper confirm karega.',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Shopper: payment confirm karo (paisa aa gaya)
// @route  POST /api/payments/:requestId/confirm
// @access Private (shopper)
const confirmPayment = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request nahi mili' });
    }

    if (request.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi' });
    }

    const transaction = await Transaction.findOne({ requestId: request._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction nahi mili' });
    }

    transaction.escrowStatus = 'confirmed';
    transaction.shopperConfirmed = true;
    transaction.shopperConfirmedAt = new Date();
    transaction.releasedAt = new Date();
    await transaction.save();

    request.status = 'paid';
    request.paidAt = new Date();
    await request.save();

    // Shopper ke earnings update karo
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
      message: 'Payment confirm ho gayi ✅ Order complete!',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Shopper: payment reject karo (paisa nahi aaya)
// @route  POST /api/payments/:requestId/dispute
// @access Private (shopper)
const disputePayment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const request = await Request.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request nahi mili' });
    }

    if (request.shopperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi' });
    }

    const transaction = await Transaction.findOne({ requestId: request._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction nahi mili' });
    }

    transaction.escrowStatus = 'disputed';
    transaction.isDisputed = true;
    transaction.disputeReason = reason || 'Paisa nahi aaya';
    await transaction.save();

    request.status = 'disputed';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Dispute file ho gaya. Admin review karega.',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Apni transactions dekho
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