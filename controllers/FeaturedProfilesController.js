const pool = require('../config/db');

// Get featured profiles
exports.getFeaturedProfiles = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, bio, logo FROM users WHERE featured = 1 LIMIT 10'
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching featured profiles:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

// Get all owners
exports.getAllOwners = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, bio, logo FROM users'
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching owners:', err);
    res.status(500).json({ message: 'Database error' });
  }
};
