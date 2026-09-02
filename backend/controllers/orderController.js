const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorMiddleware');

// ===================================================
// @route   POST /api/orders
// @desc    Place an order from the user's current cart
// ===================================================
const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { shipping_address, payment_method } = req.body;

  if (!shipping_address) {
    res.status(400);
    throw new Error('Shipping address is required.');
  }

  // ---- Get the user's cart ----
  const [carts] = await pool.query('SELECT id FROM cart WHERE user_id = ?', [userId]);
  if (carts.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty.');
  }
  const cartId = carts[0].id;

  const sql = 'SELECT ci.id AS cart_item_id, ci.quantity, ci.product_id, ' +
    'p.name, p.price, p.discount_price, p.stock_quantity ' +
    'FROM cart_items ci ' +
    'JOIN products p ON ci.product_id = p.id ' +
    'WHERE ci.cart_id = ?';

  const [cartItems] = await pool.query(sql, [cartId]);

  if (cartItems.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty.');
  }

  // ---- Validate stock for every item BEFORE placing the order ----
  for (const item of cartItems) {
    if (item.stock_quantity < item.quantity) {
      res.status(400);
      throw new Error('Not enough stock for ' + item.name + '. Only ' + item.stock_quantity + ' left.');
    }
  }

  // ---- Calculate total ----
  let totalAmount = 0;
  cartItems.forEach((item) => {
    const effectivePrice = item.discount_price || item.price;
    totalAmount += effectivePrice * item.quantity;
  });

  // ---- Create the order ----
  const [orderResult] = await pool.query(
    'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, order_status) VALUES (?, ?, ?, ?, ?)',
    [userId, totalAmount, shipping_address, payment_method || 'COD', 'PENDING']
  );

  const orderId = orderResult.insertId;

  // ---- Create order_items and deduct stock for each cart item ----
  for (const item of cartItems) {
    const effectivePrice = item.discount_price || item.price;

    await pool.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, item.product_id, item.quantity, effectivePrice]
    );

    await pool.query(
      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
      [item.quantity, item.product_id]
    );
  }

  // ---- Clear the cart now that the order is placed ----
  await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

  res.status(201).json({
    message: 'Order placed successfully!',
    orderId: 'FD' + String(orderId).padStart(5, '0'),
    id: orderId,
    total_amount: totalAmount
  });
});

// ===================================================
// @route   GET /api/orders
// @desc    Get the logged-in user's order history
// ===================================================
const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [orders] = await pool.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );

  res.json(orders);
});

// ===================================================
// @route   GET /api/orders/:id
// @desc    Get a single order's details (with items)
// ===================================================
const getOrderById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const [orders] = await pool.query(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (orders.length === 0) {
    res.status(404);
    throw new Error('Order not found.');
  }

  const sql = 'SELECT oi.quantity, oi.price, p.name, p.image_url ' +
    'FROM order_items oi ' +
    'JOIN products p ON oi.product_id = p.id ' +
    'WHERE oi.order_id = ?';

  const [items] = await pool.query(sql, [id]);

  res.json({ ...orders[0], items });
});

module.exports = { placeOrder, getMyOrders, getOrderById };
