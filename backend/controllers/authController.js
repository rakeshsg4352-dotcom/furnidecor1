const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorMiddleware');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required.');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long.');
  }

  const [existingUsers] = await pool.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUsers.length > 0) {
    res.status(400);
    throw new Error('An account with this email already exists.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, hashedPassword, phone || null, address || null, 'USER']
  );

  const newUserId = result.insertId;
  const token = generateToken(newUserId, 'USER');

  res.status(201).json({
    id: newUserId,
    name,
    email,
    role: 'USER',
    token
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required.');
  }

  const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

  if (users.length === 0) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  const user = users[0];
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  const token = generateToken(user.id, user.role);

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const [users] = await pool.query(
    'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?',
    [req.user.id]
  );

  if (users.length === 0) {
    res.status(404);
    throw new Error('User not found.');
  }

  res.json(users[0]);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Name is required.');
  }

  await pool.query(
    'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
    [name, phone || null, address || null, req.user.id]
  );

  const [users] = await pool.query(
    'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?',
    [req.user.id]
  );

  res.json(users[0]);
});

module.exports = { registerUser, loginUser, getProfile, updateProfile };
