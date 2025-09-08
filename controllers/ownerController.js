// controllers/ownerController.js
const { connection } = require('../config/db');

exports.getProfile = (req, res) => {
  connection.query(
    'SELECT id, username, email, bio, logo FROM users WHERE id = ?',
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(results[0]);
    }
  );
};

exports.updateProfile = (req, res) => {
  const { bio } = req.body;
  connection.query(
    'UPDATE users SET bio = ? WHERE id = ?',
    [bio, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ message: 'Profile updated' });
    }
  );
};