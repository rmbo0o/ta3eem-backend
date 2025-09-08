const express = require('express');
const { connection } = require('../config/db');
const router = express.Router();

router.get('/owners/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT id, username, bio, logo FROM users WHERE id = ?';
    connection.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error fetching owner:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Owner not found' });
      }
      res.json(results[0]);
    });
  });
  
module.exports = router;  