// middleware/adminMiddleware.js
// Runs AFTER authMiddleware's `protect`. Checks that the logged-in
// user has the ADMIN role before allowing access to admin-only routes.

const admin = (req, res, next) => {
  // req.user was set by the `protect` middleware, which ran before this
  if (req.user && req.user.role === 'ADMIN') {
    next(); // user is an admin, allow the request through
  } else {
    res.status(403);
    throw new Error('Access denied. Admin privileges required.');
  }
};

module.exports = { admin };