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
exports.addMenuItem = async (req, res) => {
  const { food_name, description, price, social_media_link, category_id } = req.body;
  const image_url = req.file ? `/uploads/menus/${req.file.filename}` : '';

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
      image_url,
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
exports.getFoodItemsByType = async (req, res) => {
  const { category_id } = req.query;

  try {
    let sql = `
      SELECT m.*, c.name AS category_name 
      FROM menus m 
      LEFT JOIN categories c ON m.category_id = c.id
    `;
    const params = [];

    if (category_id) {
      sql += ' WHERE m.category_id = ?';
      params.push(category_id);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching food items by type:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
