const pool = require('../config/db');

// Add a new review
// Add a new review
exports.addReview = async (req, res) => {
  const { owner_id, reviewer_name, comment, rating } = req.body; // Changed from review_text to comment

  if (!owner_id || !comment) { // Changed from review_text to comment
    return res.status(400).json({ message: 'Owner ID and review text are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO reviews (owner_id, reviewer_name, comment, rating) VALUES (?, ?, ?, ?)', // Changed from review_text to comment
      [owner_id, reviewer_name || 'Anonymous', comment, rating || null]
    );

    res.status(201).json({ 
      id: result.insertId, 
      owner_id, 
      reviewer_name, 
      comment, // Changed from review_text to comment
      rating 
    });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

// Get all reviews for an owner
// Get all reviews for an owner
exports.getReviews = async (req, res) => {
  const { ownerId } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT id, owner_id, reviewer_name, comment, rating, created_at FROM reviews WHERE owner_id = ? ORDER BY created_at DESC', // Changed from review_text to comment
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
  const { response_text } = req.body; // Make sure this column exists in your table

  try {
    const [result] = await pool.query(
      'UPDATE reviews SET response_text = ? WHERE id = ?', // Check if column name is correct
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
