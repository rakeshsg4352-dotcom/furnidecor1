// controllers/productController.js
// Handles listing/searching/filtering products, fetching a single
// product, and admin create/update/delete operations.

const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorMiddleware');

// ===================================================
// @route   GET /api/products
// @desc    List products with search, filters, sorting, pagination
// @query   search, category, minPrice, maxPrice, material, color,
//          sort (featured|newest|price_asc|price_desc|rating), page, limit
// ===================================================
const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    material,
    color,
    sort,
    page = 1,
    limit = 12
  } = req.query;

  // We build the WHERE clause dynamically based on which filters
  // were actually provided, so unfiltered requests still work.
  // NOTE: all column names are qualified with "p." because we JOIN
  // with categories, and both tables have a "name" column — without
  // the prefix, MySQL doesn't know which one we mean ("ambiguous column").
  let conditions = ["p.status = 'ACTIVE'"];
  let params = [];

  if (search) {
    conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    conditions.push('p.category_id = ?');
    params.push(category);
  }

  if (minPrice) {
    conditions.push('p.price >= ?');
    params.push(minPrice);
  }

  if (maxPrice) {
    conditions.push('p.price <= ?');
    params.push(maxPrice);
  }

  if (material) {
    conditions.push('p.material = ?');
    params.push(material);
  }

  if (color) {
    conditions.push('p.color = ?');
    params.push(color);
  }

  const whereClause = conditions.join(' AND ');

  // ---- Sorting ----
  let orderBy = 'p.featured DESC, p.created_at DESC'; // default = "Featured"
  switch (sort) {
    case 'newest':
      orderBy = 'p.created_at DESC';
      break;
    case 'price_asc':
      orderBy = 'p.price ASC';
      break;
    case 'price_desc':
      orderBy = 'p.price DESC';
      break;
    case 'rating':
      orderBy = 'p.rating DESC';
      break;
  }

  // ---- Pagination ----
  const pageNum = Math.max(parseInt(page), 1);
  const limitNum = Math.max(parseInt(limit), 1);
  const offset = (pageNum - 1) * limitNum;

  // ---- Get total count (for pagination info on the frontend) ----
  const [countResult] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE ${whereClause}`,
    params
  );
  const total = countResult[0].total;

  // ---- Get the actual page of products ----
  const [products] = await pool.query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE ${whereClause}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  );

  res.json({
    products,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

// ===================================================
// @route   GET /api/products/:id
// @desc    Get a single product by ID, plus related products
// ===================================================
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [products] = await pool.query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.id = ?`,
    [id]
  );

  if (products.length === 0) {
    res.status(404);
    throw new Error('Product not found.');
  }

  const product = products[0];

  // Fetch a few related products from the same category
  const [relatedProducts] = await pool.query(
    `SELECT id, name, price, discount_price, image_url, rating
     FROM products
     WHERE category_id = ? AND id != ? AND status = 'ACTIVE'
     LIMIT 4`,
    [product.category_id, id]
  );

  res.json({ ...product, relatedProducts });
});

// ===================================================
// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
// ===================================================
const createProduct = asyncHandler(async (req, res) => {
  const {
    name, description, category_id, price, discount_price,
    material, color, dimensions, stock_quantity,
    image_url, featured, status
  } = req.body;

  if (!name || !price) {
    res.status(400);
    throw new Error('Product name and price are required.');
  }

  if (price <= 0) {
    res.status(400);
    throw new Error('Price must be greater than 0.');
  }

  if (stock_quantity !== undefined && stock_quantity < 0) {
    res.status(400);
    throw new Error('Stock quantity cannot be negative.');
  }

  const [result] = await pool.query(
    `INSERT INTO products
     (name, description, category_id, price, discount_price, material,
      color, dimensions, stock_quantity, image_url, featured, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      description || null,
      category_id || null,
      price,
      discount_price || null,
      material || null,
      color || null,
      dimensions || null,
      stock_quantity || 0,
      image_url || null,
      featured ? 1 : 0,
      status || 'ACTIVE'
    ]
  );

  res.status(201).json({
    id: result.insertId,
    message: 'Product created successfully.'
  });
});

// ===================================================
// @route   PUT /api/products/:id
// @desc    Update an existing product
// @access  Private/Admin
// ===================================================
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
  if (existing.length === 0) {
    res.status(404);
    throw new Error('Product not found.');
  }

  const {
    name, description, category_id, price, discount_price,
    material, color, dimensions, stock_quantity,
    image_url, featured, status
  } = req.body;

  if (price !== undefined && price <= 0) {
    res.status(400);
    throw new Error('Price must be greater than 0.');
  }

  await pool.query(
    `UPDATE products SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      category_id = COALESCE(?, category_id),
      price = COALESCE(?, price),
      discount_price = ?,
      material = COALESCE(?, material),
      color = COALESCE(?, color),
      dimensions = COALESCE(?, dimensions),
      stock_quantity = COALESCE(?, stock_quantity),
      image_url = COALESCE(?, image_url),
      featured = COALESCE(?, featured),
      status = COALESCE(?, status)
     WHERE id = ?`,
    [
      name, description, category_id, price,
      discount_price !== undefined ? discount_price : null,
      material, color, dimensions, stock_quantity, image_url,
      featured !== undefined ? (featured ? 1 : 0) : undefined,
      status, id
    ]
  );

  res.json({ message: 'Product updated successfully.' });
});

// ===================================================
// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
// ===================================================
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
  if (existing.length === 0) {
    res.status(404);
    throw new Error('Product not found.');
  }

  await pool.query('DELETE FROM products WHERE id = ?', [id]);

  res.json({ message: 'Product deleted successfully.' });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};