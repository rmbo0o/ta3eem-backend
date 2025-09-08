const express = require('express');
const router = express.Router();
const { connection } = require('../config/db');

// console.log("Category Routes Loaded");

router.get('/food-items', (req, res) => {
  // console.log("API Endpoint Hit:", req.query);

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

  // console.log("Generated SQL Query:", sql);
  // console.log("Query Parameters:", params);

  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'DB error' });
    }
    // console.log("Query Results:", results.length);
    res.json(results);
  });
});

router.get('/', (req, res) => {
  const sql = `SELECT * FROM categories`;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Database Error' });
    }
    res.json(results);
  });
});

module.exports = router;
