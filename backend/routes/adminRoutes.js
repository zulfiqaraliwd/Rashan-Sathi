const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  toggleUserActive,
  updateVerification,
  getAllDisputes,
  resolveDispute,
  getAllTransactions,
  getStats,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require protect + adminOnly
router.use(protect, adminOnly);

// Stats (dashboard)
router.get('/stats', getStats);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/toggle-active', toggleUserActive);
router.put('/users/:id/verification', updateVerification);

// Disputes
router.get('/disputes', getAllDisputes);
router.put('/disputes/:id/resolve', resolveDispute);

// Transactions
router.get('/transactions', getAllTransactions);

module.exports = router;