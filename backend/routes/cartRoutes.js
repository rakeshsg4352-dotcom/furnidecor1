const express = require('express');
const router = express.Router();

const {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem
} = require('../controllers/cartController');

const { protect } = require('../middleware/authMiddleware');

// All cart routes require login — a cart belongs to a specific user
router.get('/', protect, getCart);
router.post('/items', protect, addCartItem);
router.put('/items/:id', protect, updateCartItem);
router.delete('/items/:id', protect, removeCartItem);

module.exports = router;
