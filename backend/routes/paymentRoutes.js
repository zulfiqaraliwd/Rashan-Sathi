const express = require('express');
const router = express.Router();
const {
  markPaid, confirmPayment, disputePayment, getMyTransactions,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my', protect, getMyTransactions);
router.post('/:requestId/mark-paid', protect, markPaid);
router.post('/:requestId/confirm', protect, confirmPayment);
router.post('/:requestId/dispute', protect, disputePayment);

module.exports = router;