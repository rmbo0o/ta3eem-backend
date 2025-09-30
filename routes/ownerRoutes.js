const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/owners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await pool.query(
      'SELECT id, username, bio, logo FROM users WHERE id = ?',
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching owner:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
