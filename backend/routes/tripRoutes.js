const express = require('express');
const router = express.Router();
const {
  createTrip, getNearbyTrips, getMyTrips, getTripById, cancelTrip, updateTripStatus,
} = require('../controllers/tripController');
const { protect, verifiedOnly } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, verifiedOnly, createTrip);

router.get('/nearby', protect, getNearbyTrips);
router.get('/my', protect, getMyTrips);
router.get('/:id', protect, getTripById);
router.put('/:id', protect, updateTripStatus);
router.delete('/:id', protect, cancelTrip);

module.exports = router;