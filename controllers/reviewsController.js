const { query } = require('../config/db');

// Add a review
exports.addReview = async (req, res) => {
  try {
    const { owner_id, reviewer_name, comment, rating } = req.body;
    const sql = 'INSERT INTO reviews (owner_id, reviewer_name, comment, rating) VALUES (?, ?, ?, ?)';
    await query(sql, [owner_id, reviewer_name, comment, rating]);

    res.json({ message: 'Review added successfully' });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reviews for an owner
exports.getReviews = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    const sql = 'SELECT * FROM reviews WHERE owner_id = ? ORDER BY created_at DESC';
    const results = await query(sql, [ownerId]);

    res.json(results);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add response to a review
exports.addResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const sql = 'UPDATE reviews SET response = ? WHERE id = ? AND owner_id = ?';
    const result = await query(sql, [response, id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Review not found or not authorized' });
    }

    res.status(200).json({ message: 'Response added successfully' });
  } catch (err) {
    console.error('Error adding response:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
