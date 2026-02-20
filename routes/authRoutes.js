const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const { profileStorage } = require('../config/cloudinary'); // Import Cloudinary profile storage
const pool = require('../config/db');

// Use Cloudinary storage for profile images
const upload = multer({ storage: profileStorage });

// Register route (for new owners)
router.post('/register', authController.register);

// Login route (for owners)
router.post('/login', authController.login);

// Get profile route
router.get('/profile', authMiddleware, authController.getProfile);

// Update profile (bio + logo) - Using Cloudinary
router.put('/profile', authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    const { bio } = req.body;
    // Cloudinary returns the URL in req.file.path
    const logo = req.file ? req.file.path : req.body.logo;
    const userId = req.user.id;

    console.log('Updating profile with:', { bio, logo }); // Debug log

    const [result] = await pool.query(
      `UPDATE users SET bio = ?, logo = ? WHERE id = ?`,
      [bio, logo, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      logo: logo // Return the Cloudinary URL
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
});

module.exports = router;