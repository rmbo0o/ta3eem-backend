const pool = require('../config/db');

// GET /api/profiles/featured
exports.getFeaturedProfiles = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, bio, logo FROM users WHERE featured = 1 LIMIT 10'
    );

    // Cloudinary URLs are already full URLs, no transformation needed
    res.json(rows);
  } catch (err) {
    console.error('Error fetching featured profiles:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

// GET /api/owners
exports.getAllOwners = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, bio, logo FROM users'
    );

    // Cloudinary URLs are already full URLs
    res.json(rows);
  } catch (err) {
    console.error('Error fetching owners:', err);
    res.status(500).json({ message: 'Database error' });
  }
};