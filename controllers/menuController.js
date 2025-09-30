const { query } = require('../config/db');
const path = require('path');

// Add Menu Item
exports.addMenuItem = async (req, res) => {
  try {
    const { food_name, description, price, social_media_link, category_id } = req.body;
    const image_url = req.file ? `/uploads/menus/${req.file.filename}` : '';

    if (!food_name || !description || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const sql = `
      INSERT INTO menus 
      (owner_id, food_name, description, price, image_url, social_media_link, category_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      req.user.id, food_name, description, price, image_url, social_media_link, category_id
    ]);

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

// Update Menu Item
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { food_name, description, price, social_media_link, category_id } = req.body;

    if (!food_name || !description || !price || !category_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const sql = `
      UPDATE menus SET 
      food_name = ?, description = ?, price = ?, 
      social_media_link = ?, category_id = ?
      WHERE id = ? AND owner_id = ?
    `;
    const result = await query(sql, [
      food_name, description, price, social_media_link, category_id, id, userId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found or not owned by user' });
    }
    res.json({ message: 'Menu item updated successfully' });
  } catch (err) {
    console.error('Error updating menu item:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Menu Item
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sql = 'DELETE FROM menus WHERE id = ? AND owner_id = ?';
    await query(sql, [id, userId]);

    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    console.error('Error deleting menu item:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Menu Items for Logged-in Owner
exports.getMenuItems = async (req, res) => {
  try {
    const sql = `
      SELECT id, owner_id, food_name, description, price, image_url as image, 
             social_media_link, category_id
      FROM menus WHERE owner_id = ?
    `;
    const results = await query(sql, [req.user.id]);

    const sanitizedItems = results.map(item => ({
      id: item.id,
      food_name: item.food_name || '',
      description: item.description || '',
      price: item.price || 0,
      image: item.image || '',
      social_media_link: item.social_media_link || '',
      category_id: item.category_id || null
    }));

    res.json(sanitizedItems);
  } catch (err) {
    console.error('Error fetching menu:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Public Menu Items
exports.getPublicMenuItems = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    const sql = 'SELECT * FROM menus WHERE owner_id = ?';
    const results = await query(sql, [ownerId]);

    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching public menu:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search Food Items by Type
exports.getFoodItemsByType = async (req, res) => {
  try {
    const type = req.query.type ? req.query.type.trim().toLowerCase() : '';
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

    let sql = `
      SELECT m.id, m.food_name, m.description, m.price, m.image_url, 
             m.social_media_link AS owner_instagram, 
             u.username AS owner_name, u.logo AS owner_logo, u.id AS owner_id
      FROM menus m
      JOIN users u ON m.owner_id = u.id
      WHERE LOWER(m.food_name) LIKE ?
    `;

    const params = [`%${type}%`];
    if (minPrice !== null) {
      sql += " AND m.price >= ?";
      params.push(minPrice);
    }
    if (maxPrice !== null) {
      sql += " AND m.price <= ?";
      params.push(maxPrice);
    }

    const results = await query(sql, params);
    res.status(200).json(results);
  } catch (err) {
    console.error('Error searching food items:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
