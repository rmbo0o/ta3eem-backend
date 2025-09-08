const { connection } = require('../config/db');
const path = require('path');

const getFeaturedProfiles = (req, res) => {
    const sql = `
      SELECT 
        u.id, 
        u.username, 
        u.logo, 
        AVG(r.rating) AS average_rating, 
        COUNT(r.id) AS total_reviews 
      FROM users u 
      LEFT JOIN reviews r ON u.id = r.owner_id 
      GROUP BY u.id 
      ORDER BY average_rating DESC, total_reviews DESC 
      LIMIT 5;
    `;
  
    connection.query(sql, (err, results) => {
      if (err) {
        console.error("Error fetching featured profiles:", err);
        return res.status(500).json({ error: "Failed to fetch featured profiles" });
      }
  
      res.status(200).json(results);
    });
  };
  
// Get All Owners with Search and Pagination
const getAllOwners = (req, res) => {
    const { search = "", page = 1, limit = 6 } = req.query;
    const offset = (page - 1) * limit;
    const searchQuery = `%${search}%`;
  
    const sql = `
      SELECT id, username, logo 
      FROM users 
      WHERE username LIKE ? 
      LIMIT ? OFFSET ?;
    `;
  
    connection.query(sql, [searchQuery, parseInt(limit), parseInt(offset)], (err, results) => {
      if (err) {
        console.error("Error fetching all owners:", err);
        return res.status(500).json({ error: "Failed to fetch owners" });
      }
  
      res.status(200).json(results);
    });
  };

  
  module.exports = {
    getFeaturedProfiles,
    getAllOwners
  };