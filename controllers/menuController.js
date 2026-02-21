// controllers/menuController.js
const  pool  = require('../config/db');

// Get all menu items for the logged-in owner
exports.getMenuItems = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM menus WHERE owner_id = ?',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching menu items:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get menu items for public view (by ownerId, no auth required)
exports.getPublicMenuItems = async (req, res) => {
  const { ownerId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM menus WHERE owner_id = ?',
      [ownerId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching public menu items:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add new menu item
// Add new menu item
exports.addMenuItem = async (req, res) => {
  const { food_name, description, price, social_media_link, category_id } = req.body;
  
  // Cloudinary returns the secure URL in req.file.path
  const image_url = req.file ? req.file.path : ''; // This will be the full Cloudinary URL

  try {
    const [result] = await pool.query(
      `INSERT INTO menus (owner_id, food_name, description, price, image_url, social_media_link, category_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, food_name, description, price, image_url, social_media_link, category_id]
    );

    res.status(201).json({
      id: result.insertId,
      food_name,
      description,
      price,
      image_url, // Now this is a full Cloudinary URL
      social_media_link,
      category_id
    });
  } catch (err) {
    console.error('Error adding menu item:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { food_name, description, price, social_media_link, category_id } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE menus 
       SET food_name = ?, description = ?, price = ?, social_media_link = ?, category_id = ?
       WHERE id = ? AND owner_id = ?`,
      [food_name, description, price, social_media_link, category_id, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found or not authorized' });
    }

    res.json({ message: 'Menu item updated successfully' });
  } catch (err) {
    console.error('Error updating menu item:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM menus WHERE id = ? AND owner_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found or not authorized' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    console.error('Error deleting menu item:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get food items by type (categories)
// Get food items by type/category with search and price filters
exports.getFoodItemsByType = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, category_id } = req.query;
    
    let sql = `
      SELECT m.*, u.username as owner_name 
      FROM menus m 
      LEFT JOIN users u ON m.owner_id = u.id
      WHERE 1=1
    `;
    let params = [];
    
    // Search by food name (type parameter)
    if (type && type.trim() !== '') {
      sql += ' AND m.food_name LIKE ?';
      params.push(`%${type.trim()}%`);
    }
    
    // Filter by category
    if (category_id) {
      sql += ' AND m.category_id = ?';
      params.push(category_id);
    }
    
    // Filter by minimum price
    if (minPrice && !isNaN(minPrice)) {
      sql += ' AND m.price >= ?';
      params.push(parseFloat(minPrice));
    }
    
    // Filter by maximum price
    if (maxPrice && !isNaN(maxPrice)) {
      sql += ' AND m.price <= ?';
      params.push(parseFloat(maxPrice));
    }
    
    // Order by newest first
    sql += ' ORDER BY m.id DESC';
    
    console.log('Executing SQL:', sql);
    console.log('With params:', params);
    
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching food items by type:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
