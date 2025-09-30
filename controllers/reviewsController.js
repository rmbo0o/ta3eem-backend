const pool = require('../config/db');

// Add a new review
exports.addReview = async (req, res) => {
  const { owner_id, reviewer_name, review_text, rating } = req.body;

  if (!owner_id || !review_text) {
    return res.status(400).json({ message: 'Owner ID and review text are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO reviews (owner_id, reviewer_name, review_text, rating) VALUES (?, ?, ?, ?)',
      [owner_id, reviewer_name || 'Anonymous', review_text, rating || null]
    );

    res.status(201).json({ id: result.insertId, owner_id, reviewer_name, review_text, rating });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

// Get all reviews for an owner
exports.getReviews = async (req, res) => {
  const { ownerId } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM reviews WHERE owner_id = ? ORDER BY created_at DESC',
      [ownerId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

// Add a response from the owner
exports.addResponse = async (req, res) => {
  const { id } = req.params;
  const { response_text } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE reviews SET response_text = ? WHERE id = ?',
      [response_text, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Response added successfully' });
  } catch (err) {
    console.error('Error adding response:', err);
    res.status(500).json({ message: 'Database error' });
  }
};
