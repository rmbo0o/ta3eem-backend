const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/profiles'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Register route (for new owners)
router.post('/register', authController.register);

// Login route (for owners)
router.post('/login', authController.login);

// Get profile route
router.get('/profile', authMiddleware, authController.getProfile);

// Update profile (bio + logo)
router.put('/profile', authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    const { bio } = req.body;
    const logo = req.file ? `/uploads/profiles/${req.file.filename}` : req.body.logo;
    const userId = req.user.id;

    const [result] = await pool.query(
      `UPDATE users SET bio = ?, logo = ? WHERE id = ?`,
      [bio, logo, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

module.exports = router;
