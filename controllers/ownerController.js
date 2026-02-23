const pool = require('../config/db');

// Get owner by ID
exports.getOwnerById = async (req, res) => {
  const { id } = req.params;

  try {
    console.log('Fetching owner with ID:', id); // Debug log
    
    const [rows] = await pool.query(
      'SELECT id, username, bio, logo, instagram FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    console.log('Raw database row:', rows[0]); // Debug log
    
    // Make sure instagram is not null/undefined
    const ownerData = {
      ...rows[0],
      instagram: rows[0].instagram || '' // Convert null to empty string if needed
    };
    
    console.log('Sending owner data:', ownerData); // Debug log
    res.json(ownerData);
  } catch (err) {
    console.error('Error fetching owner:', err);
    res.status(500).json({ message: 'Server error' });
  }
};