// routes/productRoutes.js
// Maps URLs to product controller functions.

const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Public routes — anyone can browse products
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only routes — must be logged in AND have role = ADMIN
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;