const express = require('express');
const router = express.Router();
const {
  createRequest, getRequestsForTrip, getMyRequests, getRequestById,
  acceptRequest, rejectRequest, cancelRequest, startShopping,
  markDelivered, confirmDelivery,
} = require('../controllers/requestController');
const { protect, verifiedOnly } = require('../middleware/authMiddleware');

router.post('/', protect, verifiedOnly, createRequest);
router.get('/my', protect, getMyRequests);
router.get('/trip/:tripId', protect, getRequestsForTrip);
router.get('/:id', protect, getRequestById);
router.put('/:id/accept', protect, acceptRequest);
router.put('/:id/reject', protect, rejectRequest);
router.put('/:id/cancel', protect, cancelRequest);
router.put('/:id/start-shopping', protect, startShopping);
router.put('/:id/mark-delivered', protect, markDelivered);
router.put('/:id/confirm-delivery', protect, confirmDelivery);

module.exports = router;