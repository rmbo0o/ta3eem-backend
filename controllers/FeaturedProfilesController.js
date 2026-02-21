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

// GET /api/owners with search and pagination
exports.getAllOwners = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 6 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT id, username, bio, logo FROM users';
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    let queryParams = [];
    let countParams = [];
    
    // Add search functionality
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query += ' WHERE username LIKE ?';
      countQuery += ' WHERE username LIKE ?';
      queryParams.push(searchTerm);
      countParams.push(searchTerm);
    }
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Execute queries
    const [rows] = await pool.query(query, queryParams);
    const [totalResult] = await pool.query(countQuery, countParams);
    
    // Return data with pagination info
    res.json({
      owners: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult[0].total,
        pages: Math.ceil(totalResult[0].total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching owners:', err);
    res.status(500).json({ message: 'Database error' });
  }
};