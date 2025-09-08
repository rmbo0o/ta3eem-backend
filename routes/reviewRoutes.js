const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', reviewsController.addReview);
router.get('/:ownerId', reviewsController.getReviews);
// Route to handle review response
router.put('/:id', authMiddleware, reviewsController.addResponse);

// // In reviewRoutes.js or new ownerRoutes.js
// router.get('/api/owners/:id', (req, res) => {
//     const ownerId = req.params.id;
//     const query = 'SELECT id, username, bio, logo FROM users WHERE id = ?';
  
//     connection.query(query, [ownerId], (err, results) => {
//       if (err) return res.status(500).json({ message: 'Database error' });
//       if (results.length === 0) return res.status(404).json({ message: 'Owner not found' });
//       res.json(results[0]);
//     });
//   });
  
module.exports = router;
