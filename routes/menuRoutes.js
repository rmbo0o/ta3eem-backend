const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const { storage } = require('../config/cloudinary');


const upload = multer({ storage });

// Routes
router.get('/public/:ownerId', menuController.getPublicMenuItems);
router.get('/', authMiddleware, menuController.getMenuItems);
router.post('/', authMiddleware, upload.single('image'), menuController.addMenuItem);
router.put('/:id', authMiddleware, menuController.updateMenuItem);
router.delete('/:id', authMiddleware, menuController.deleteMenuItem);

// Search food items by type (public)
router.get('/food-items', menuController.getFoodItemsByType);

module.exports = router;
