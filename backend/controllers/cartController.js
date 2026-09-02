const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Helper: get the user's cart id, creating a cart row if one doesn't exist yet.
const getOrCreateCartId = async (userId) => {
  const [existing] = await pool.query('SELECT id FROM cart WHERE user_id = ?', [userId]);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [result] = await pool.query('INSERT INTO cart (user_id) VALUES (?)', [userId]);
  return result.insertId;
};

const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const cartId = await getOrCreateCartId(userId);

  const sql = 'SELECT ci.id AS cart_item_id, ci.quantity, p.id AS product_id, ' +
    'p.name, p.price, p.discount_price, p.image_url, p.stock_quantity ' +
    'FROM cart_items ci ' +
    'JOIN products p ON ci.product_id = p.id ' +
    'WHERE ci.cart_id = ?';

  const [items] = await pool.query(sql, [cartId]);

  let subtotal = 0;
  items.forEach((item) => {
    const effectivePrice = item.discount_price || item.price;
    subtotal += effectivePrice * item.quantity;
  });

  res.json({
    items,
    subtotal: subtotal.toFixed(2),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
  });
});

const addCartItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity < 1) {
    res.status(400);
    throw new Error('product_id and a valid quantity are required.');
  }

  const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [product_id]);
  if (products.length === 0) {
    res.status(404);
    throw new Error('Product not found.');
  }

  const product = products[0];

  if (product.stock_quantity < quantity) {
    res.status(400);
    throw new Error('Not enough stock available. Only ' + product.stock_quantity + ' left.');
  }

  const cartId = await getOrCreateCartId(userId);

  const [existingItem] = await pool.query(
    'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cartId, product_id]
  );

  if (existingItem.length > 0) {
    const newQuantity = existingItem[0].quantity + parseInt(quantity);

    if (product.stock_quantity < newQuantity) {
      res.status(400);
      throw new Error('Not enough stock available. Only ' + product.stock_quantity + ' left.');
    }

    await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [newQuantity, existingItem[0].id]
    );
  } else {
    await pool.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
      [cartId, product_id, quantity]
    );
  }

  res.status(201).json({ message: 'Item added to cart.' });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error('A valid quantity is required.');
  }

  const sql = 'SELECT ci.*, p.stock_quantity FROM cart_items ci ' +
    'JOIN cart c ON ci.cart_id = c.id ' +
    'JOIN products p ON ci.product_id = p.id ' +
    'WHERE ci.id = ? AND c.user_id = ?';

  const [items] = await pool.query(sql, [id, userId]);

  if (items.length === 0) {
    res.status(404);
    throw new Error('Cart item not found.');
  }

  if (items[0].stock_quantity < quantity) {
    res.status(400);
    throw new Error('Not enough stock available. Only ' + items[0].stock_quantity + ' left.');
  }

  await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, id]);

  res.json({ message: 'Cart item updated.' });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const sql = 'SELECT ci.id FROM cart_items ci ' +
    'JOIN cart c ON ci.cart_id = c.id ' +
    'WHERE ci.id = ? AND c.user_id = ?';

  const [items] = await pool.query(sql, [id, userId]);

  if (items.length === 0) {
    res.status(404);
    throw new Error('Cart item not found.');
  }

  await pool.query('DELETE FROM cart_items WHERE id = ?', [id]);

  res.json({ message: 'Item removed from cart.' });
});

module.exports = { getCart, addCartItem, updateCartItem, removeCartItem };
