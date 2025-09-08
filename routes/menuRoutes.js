const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const { connection } = require('../config/db');

// Configure Multer storage (for file uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/menus')); // Folder where the images will be saved
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Save the file with a unique name
  }
});

// Initialize multer with the above storage configuration
const upload = multer({ storage: storage });

// Define the routes here
router.post('/menu', upload.single('image'), (req, res) => {
  const { food_name, description, price, social_media_link , category_id} = req.body;
  const image_url = req.file ? `/uploads/menus/${req.file.filename}` : ''; // Save the correct image path

  // Insert the menu item into the database (adjust the query as necessary)
  const query = `INSERT INTO menus (food_name, description, price, image_url, social_media_link, category_id) VALUES (?, ?, ?, ?, ? , ?)`;
  
  connection.query(query, [food_name, description, price, image_url, social_media_link , category_id], (err, result) => {
    if (err) {
      console.error('Error inserting into database:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(201).json({
      id: result.insertId,
      food_name,
      description,
      price,
      image_url,
      social_media_link, 
      category_id
    });
  });
});

// Routes
router.get('/public/:ownerId', menuController.getPublicMenuItems);
router.get('/', authMiddleware, menuController.getMenuItems );
router.post('/', authMiddleware, upload.single('image'), menuController.addMenuItem);

router.put('/:id', authMiddleware, (req, res) => {
  console.log('PUT request received for ID:', req.params.id);
  menuController.updateMenuItem(req, res);
});
router.delete('/:id', authMiddleware, menuController.deleteMenuItem);

// Route to get food items by type
router.get('/food-items', menuController.getFoodItemsByType);

// router.put('/:id', upload.single('image'), async (req, res) => {
//   try {
//     // Validation
//     if (!req.body.food_name) {
//       return res.status(400).json({ error: 'Food name is required' });
//     }

//     // Prepare update data
//     const updateData = {
//       food_name: req.body.food_name,
//       description: req.body.description,
//       price: req.body.price,
//       category_id: req.body.category_id
//     };

//     // Handle image if uploaded
//     if (req.file) {
//       updateData.image = `/uploads/${req.file.filename}`;
//     }

//     // Update in database
//     const updatedItem = await MenuItem.findByIdAndUpdate(
//       req.params.id, 
//       updateData,
//       { new: true } // Return the updated document
//     );

//     if (!updatedItem) {
//       return res.status(404).json({ error: 'Menu item not found' });
//     }

//     res.json(updatedItem);
    
//   } catch (error) {
//     console.error('Update error:', error);
//     res.status(500).json({ 
//       error: 'Update failed',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

// Public route to get menu by owner ID (no token required)
// Public route to get menu by owner ID (no token required)




module.exports = router;
