const { connection } = require('../config/db');

// Add a review
exports.addReview = (req, res) => {
  const { owner_id, reviewer_name, comment, rating } = req.body;

  const query = 'INSERT INTO reviews (owner_id, reviewer_name, comment, rating) VALUES (?, ?, ?, ?)';
  connection.query(query, [owner_id, reviewer_name, comment, rating], (err, results) => {
    if (err) {
      return res.status(400).json({ message: 'Error adding review', error: err });
    }
    res.json({ message: 'Review added successfully' });
  });
};

// Get all reviews for an owner
exports.getReviews = (req, res) => {
  const ownerId = req.params.ownerId;

  const query = 'SELECT * FROM reviews WHERE owner_id = ? ORDER BY created_at DESC';
  connection.query(query, [ownerId], (err, results) => {
    if (err) {
      return res.status(400).json({ message: 'Error fetching reviews', error: err });
    }
    res.json(results);
  });
};

exports.addResponse = async (req, res) => {
  const { id } = req.params;  // Review ID from URL
  const { response } = req.body;  // Owner's response

  try {
    const query = 'UPDATE reviews SET response = ? WHERE id = ? AND owner_id = ?';
    connection.query(query, [response, id, req.user.id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Review not found or not authorized' });
      }

      res.status(200).json({ message: 'Response added successfully' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
