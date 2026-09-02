const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  updateOrderStatus,
  getInventory
} = require('../controllers/adminController');

const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// All admin routes require login AND admin role
router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getAllUsers);
router.get('/orders', protect, admin, getAllOrders);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);
router.get('/inventory', protect, admin, getInventory);

module.exports = router;
