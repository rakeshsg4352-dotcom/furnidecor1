// controllers/categoryController.js
// Handles listing, creating, updating, and deleting categories.

const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorMiddleware');

// ===================================================
// @route   GET /api/categories
// @desc    List all categories
// ===================================================
const getCategories = asyncHandler(async (req, res) => {
  const [categories] = await pool.query(
    'SELECT * FROM categories ORDER BY name ASC'
  );
  res.json(categories);
});

// ===================================================
// @route   GET /api/categories/:id
// @desc    Get a single category
// ===================================================
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [categories] = await pool.query(
    'SELECT * FROM categories WHERE id = ?',
    [id]
  );

  if (categories.length === 0) {
    res.status(404);
    throw new Error('Category not found.');
  }

  res.json(categories[0]);
});

// ===================================================
// @route   POST /api/categories
// @desc    Create a new category
// @access  Private/Admin
// ===================================================
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image_url } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Category name is required.');
  }

  // Prevent duplicate category names
  const [existing] = await pool.query(
    'SELECT id FROM categories WHERE name = ?',
    [name]
  );

  if (existing.length > 0) {
    res.status(400);
    throw new Error('A category with this name already exists.');
  }

  const [result] = await pool.query(
    'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
    [name, description || null, image_url || null]
  );

  res.status(201).json({
    id: result.insertId,
    message: 'Category created successfully.'
  });
});

// ===================================================
// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private/Admin
// ===================================================
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, image_url } = req.body;

  const [existing] = await pool.query('SELECT id FROM categories WHERE id = ?', [id]);
  if (existing.length === 0) {
    res.status(404);
    throw new Error('Category not found.');
  }

  await pool.query(
    `UPDATE categories SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      image_url = COALESCE(?, image_url)
     WHERE id = ?`,
    [name, description, image_url, id]
  );

  res.json({ message: 'Category updated successfully.' });
});

// ===================================================
// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private/Admin
// ===================================================
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existing] = await pool.query('SELECT id FROM categories WHERE id = ?', [id]);
  if (existing.length === 0) {
    res.status(404);
    throw new Error('Category not found.');
  }

  // Note: products referencing this category will have their
  // category_id set to NULL automatically (see the foreign key
  // ON DELETE SET NULL rule we defined in the schema).
  await pool.query('DELETE FROM categories WHERE id = ?', [id]);

  res.json({ message: 'Category deleted successfully.' });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};