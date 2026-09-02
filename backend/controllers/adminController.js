const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorMiddleware');

// ===================================================
// @route   GET /api/admin/dashboard
// @desc    Get summary statistics for the admin dashboard
// ===================================================
const getDashboardStats = asyncHandler(async (req, res) => {
  const [[productCount]] = await pool.query('SELECT COUNT(*) AS total FROM products');
  const [[userCount]] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE role = 'USER'");
  const [[orderCount]] = await pool.query('SELECT COUNT(*) AS total FROM orders');
  const [[pendingCount]] = await pool.query("SELECT COUNT(*) AS total FROM orders WHERE order_status = 'PENDING'");
  const [[deliveredCount]] = await pool.query("SELECT COUNT(*) AS total FROM orders WHERE order_status = 'DELIVERED'");
  const [[revenue]] = await pool.query(
    "SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE order_status != 'CANCELLED'"
  );
  const [[lowStockCount]] = await pool.query(
    'SELECT COUNT(*) AS total FROM products WHERE stock_quantity <= 10 AND stock_quantity > 0'
  );
  const [[outOfStockCount]] = await pool.query(
    'SELECT COUNT(*) AS total FROM products WHERE stock_quantity = 0'
  );

  // Order status breakdown (useful for a pie/bar chart on the frontend)
  const [ordersByStatus] = await pool.query(
    'SELECT order_status, COUNT(*) AS count FROM orders GROUP BY order_status'
  );

  // Revenue by category (useful for a chart too)
  const revenueSql = 'SELECT c.name AS category, COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue ' +
    'FROM order_items oi ' +
    'JOIN products p ON oi.product_id = p.id ' +
    'LEFT JOIN categories c ON p.category_id = c.id ' +
    'GROUP BY c.name ' +
    'ORDER BY revenue DESC ' +
    'LIMIT 5';
  const [revenueByCategory] = await pool.query(revenueSql);
 res.json({
    totalProducts: productCount.total,
    totalUsers: userCount.total,
    totalOrders: orderCount.total,
    pendingOrders: pendingCount.total,
    deliveredOrders: deliveredCount.total,
    totalRevenue: revenue.total,
    lowStockProducts: lowStockCount.total,
    outOfStockProducts: outOfStockCount.total,
    ordersByStatus,
    revenueByCategory
  });
});

// ===================================================
// @route   GET /api/admin/users
// @desc    List all users (excluding passwords)
// ===================================================
const getAllUsers = asyncHandler(async (req, res) => {
  const [users] = await pool.query(
'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
  );
  res.json(users);
});

// ===================================================
// @route   GET /api/admin/orders
// @desc    List all orders from all users
// ===================================================
const getAllOrders = asyncHandler(async (req, res) => {
  const sql = 'SELECT o.*, u.name AS customer_name, u.email AS customer_email ' +
    'FROM orders o ' +
    'JOIN users u ON o.user_id = u.id ' +
    'ORDER BY o.created_at DESC';
 const [orders] = await pool.query(sql);
  res.json(orders);
});

// ===================================================
// @route   PUT /api/admin/orders/:id/status
// @desc    Update an order's status
// ===================================================
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { order_status } = req.body;

  const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  if (!order_status || !validStatuses.includes(order_status)) {
    res.status(400);
    throw new Error('Valid order_status is required. Must be one of: ' + validStatuses.join(', '));
  }
 const [existing] = await pool.query('SELECT id FROM orders WHERE id = ?', [id]);
  if (existing.length === 0) {
    res.status(404);
    throw new Error('Order not found.');
  }

  await pool.query('UPDATE orders SET order_status = ? WHERE id = ?', [order_status, id]);

  res.json({ message: 'Order status updated to ' + order_status + '.' });
});
// ===================================================
// @route   GET /api/admin/inventory
// @desc    Get inventory view with stock status
// ===================================================
const getInventory = asyncHandler(async (req, res) => {
  const [products] = await pool.query(
    'SELECT id, name, stock_quantity, image_url FROM products ORDER BY stock_quantity ASC'
  );

  const inventory = products.map((p) => {
    let stockStatus = 'In Stock';
    if (p.stock_quantity === 0) stockStatus = 'Out of Stock';
    else if (p.stock_quantity <= 10) stockStatus = 'Low Stock';

    return { ...p, stock_status: stockStatus };
 });

  res.json(inventory);
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  updateOrderStatus,
  getInventory
};
