const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// get food items by category
router.get('/food-items', async (req, res) => {
  let sql = `
    SELECT m.*, c.name AS category_name 
    FROM menus m 
    LEFT JOIN categories c ON m.category_id = c.id
  `;
  const params = [];

  if (req.query.category_id) {
    sql += ' WHERE m.category_id = ?';
    params.push(req.query.category_id);
  } else if (req.query.category_name) {
    sql += ' WHERE c.name = ?';
    params.push(req.query.category_name);
  } else {
    return res.status(400).json({ message: 'Please provide a category_id or category_name to filter items.' });
  }

  try {
    const [results] = await pool.query(sql, params);
    res.json(results);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ message: 'DB error' });
  }
});

// get all categories
router.get('/', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM categories');
    res.json(results);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ message: 'Database Error' });
  }
});

module.exports = router;
