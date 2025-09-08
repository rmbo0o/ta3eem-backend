const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const { connection } = require('../config/db');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/profiles'));// Save images in the 'uploads' folder
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname)); // Append file extension
    },
  });
  
  const upload = multer({ storage: storage });

// Register route (for new owners)
router.post('/register', authController.register);

// Login route (for owners to authenticate)
router.post('/login', authController.login);

// Get profile data route (owner can fetch their profile data)
router.get('/profile', authMiddleware, authController.getProfile);

// Profile update route (owner can update bio and logo)
router.put('/profile', authMiddleware, upload.single('logo'), async (req, res) => {
    const { bio } = req.body;
    const logo = req.file ? `/uploads/profiles/${req.file.filename}` : req.body.logo; // Get logo from multer or use existing logo
    const userId = req.user.id;
  
    // Query to update user profile
    const query = `UPDATE users SET bio = ?, logo = ? WHERE id = ?`;
    connection.query(query, [bio, logo, userId], (err, result) => {
      if (err) {
        console.error('Error updating profile:', err);
        return res.status(500).json({ message: 'Error updating profile' });
      }
      res.json({ message: 'Profile updated successfully' });
    });
  });




module.exports = router;
