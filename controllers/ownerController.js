const { query } = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const sql = 'SELECT id, username, email, bio, logo FROM users WHERE id = ?';
    const results = await query(sql, [req.user.id]);

    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { bio } = req.body;
    const sql = 'UPDATE users SET bio = ? WHERE id = ?';
    await query(sql, [bio, req.user.id]);

    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
