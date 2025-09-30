const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    const [results] = await pool.query(
      'SELECT id, username, email FROM users WHERE id = ?',
      [decoded.id]
    );

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid user' });
    }

    req.user = results[0];
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
