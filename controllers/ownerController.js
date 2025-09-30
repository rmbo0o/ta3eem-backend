const pool = require('../config/db');

// Get owner by ID
exports.getOwnerById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT id, username, bio, logo FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching owner:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
