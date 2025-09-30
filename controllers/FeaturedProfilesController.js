const { query } = require('../config/db');

const getFeaturedProfiles = async (req, res) => {
  try {
    const sql = `
      SELECT u.id, u.username, u.logo, 
             AVG(r.rating) AS average_rating, 
             COUNT(r.id) AS total_reviews 
      FROM users u 
      LEFT JOIN reviews r ON u.id = r.owner_id 
      GROUP BY u.id 
      ORDER BY average_rating DESC, total_reviews DESC 
      LIMIT 5;
    `;
    const results = await query(sql);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching featured profiles:", err);
    res.status(500).json({ error: "Failed to fetch featured profiles" });
  }
};

// Get All Owners with Search and Pagination
const getAllOwners = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 6 } = req.query;
    const offset = (page - 1) * limit;
    const searchQuery = `%${search}%`;

    const sql = `
      SELECT id, username, logo 
      FROM users 
      WHERE username LIKE ? 
      LIMIT ? OFFSET ?;
    `;
    const results = await query(sql, [searchQuery, parseInt(limit), parseInt(offset)]);

    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching owners:", err);
    res.status(500).json({ error: "Failed to fetch owners" });
  }
};

module.exports = { getFeaturedProfiles, getAllOwners };
