const pool = require('../config/db');

// GET /api/profiles/featured
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

// GET /api/owners with search functionality
exports.getAllOwners = async (req, res) => {
  try {
    const { search = '' } = req.query;
    
    let query = 'SELECT id, username, bio, logo FROM users';
    let params = [];
    
    // Add search functionality if search term exists
    if (search && search.trim() !== '') {
      query += ' WHERE username LIKE ?';
      params.push(`%${search.trim()}%`);
    }
    
    console.log('Executing query:', query, 'with params:', params); // Debug log
    
    const [rows] = await pool.query(query, params);
    res.json(rows); // Return just the array, no pagination object
  } catch (err) {
    console.error('Error fetching owners:', err);
    res.status(500).json({ message: 'Database error' });
  }
};