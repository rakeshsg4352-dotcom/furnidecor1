// middleware/authMiddleware.js
// Protects routes by verifying the JWT token sent by the frontend.
// If valid, attaches the decoded user info to req.user so controllers
// can access who's making the request.

const jwt = require('jsonwebtoken');
const { asyncHandler } = require('./errorMiddleware');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // The frontend sends the token in the request header like this:
  // Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      // Extract just the token part (after "Bearer ")
      token = authHeader.split(' ')[1];

      // Verify the token using our secret key.
      // If it's invalid or expired, this throws an error automatically.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the decoded payload (id, role) to the request object
      // so every controller after this middleware can use req.user
      req.user = decoded;

      next(); // move on to the actual route handler
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed or expired.');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided.');
  }
});

module.exports = { protect };