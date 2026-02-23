const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const { profileStorage } = require('../config/cloudinary');
const pool = require('../config/db');

// Use Cloudinary storage for profile images
const upload = multer({ storage: profileStorage });

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Get profile route
router.get('/profile', authMiddleware, authController.getProfile);

// Update profile (bio, instagram, logo) - FIXED VERSION
router.put('/profile', authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    const { bio, instagram } = req.body;  // ✅ NOW getting instagram!
    const logo = req.file ? req.file.path : req.body.logo;
    const userId = req.user.id;

    console.log('Updating profile with:', { bio, instagram, logo, userId }); // Debug log

    // ✅ NOW updating all three fields!
    const [result] = await pool.query(
      `UPDATE users SET bio = ?, instagram = ?, logo = ? WHERE id = ?`,
      [bio, instagram, logo, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch the updated profile to return
    const [updatedProfile] = await pool.query(
      'SELECT id, username, email, bio, logo, instagram FROM users WHERE id = ?',
      [userId]
    );

    res.json({ 
      message: 'Profile updated successfully',
      user: updatedProfile[0]
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
});

module.exports = router;