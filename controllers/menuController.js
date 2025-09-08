const { connection } = require('../config/db');
const path = require('path');

// Add Menu Item
exports.addMenuItem = async (req, res) => {
  try {
    console.log('Request Body:', req.body);  // Logs form data
    console.log('Uploaded File:', req.file);  // Logs the uploaded file

    // Get the form data and the uploaded file's path
    const { food_name, description, price, social_media_link, category_id} = req.body;
    const image_url = req.file ? `/uploads/menus/${req.file.filename}` : '';  // Get the image path

    // Validate required fields
    if (!food_name || !description || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Insert into the database
    connection.query(
      `INSERT INTO menus 
      (owner_id, food_name, description, price, image_url, social_media_link ,category_id)
      VALUES (?, ?, ?, ?, ?, ? ,?)`,
      [req.user.id, food_name, description, price, image_url, social_media_link , category_id],
      (err, result) => {
        if (err) {
          console.error('Error adding menu item:', err);
          return res.status(500).json({ message: 'Database error' });
        }

        // Return response after successful insertion
        res.status(201).json({
          id: result.insertId,
          food_name,
          description,
          price,
          image_url,
          social_media_link,
          category_id
        });
      }
    );
  } catch (err) {
    console.error('Error adding menu item:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Menu Item
exports.updateMenuItem = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { food_name, description, price, social_media_link, category_id } = req.body;

  // Validate required fields
  if (!food_name || !description || !price || !category_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const query = `UPDATE menus SET 
    food_name = ?, 
    description = ?, 
    price = ?, 
    social_media_link = ?,
    category_id = ?
    WHERE id = ? AND owner_id = ?`;

  connection.query(
    query,
    [food_name, description, price, social_media_link, category_id, id, userId],
    (err, results) => {
      if (err) {
        console.error('Error updating menu item:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Menu item not found or not owned by user' });
      }
      res.json({ message: 'Menu item updated successfully' });
    }
  );
};

// Delete Menu Item
exports.deleteMenuItem = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const query = 'DELETE FROM menus WHERE id = ? AND owner_id = ?';
  connection.query(query, [id, userId], (err, results) => {
    if (err) {
      return res.status(400).json({ message: 'Error deleting menu item', error: err });
    }
    res.json({ message: 'Menu item deleted successfully' });
  });
};

// Get Menu Items for the Logged-in Owner
exports.getMenuItems = (req, res) => {
  const query = `SELECT 
    id,
    owner_id,
    food_name ,  
    description,
    price,
    image_url as image,
    social_media_link ,
    category_id
   FROM menus 
   WHERE owner_id = ?`;
  connection.query(query, [req.user.id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to fetch menu' });
    }
    
    // Transform NULL values to empty strings for frontend safety
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
  });
};

exports.getPublicMenuItems = (req, res) => {
  const ownerId = req.params.ownerId;
  const sql = 'SELECT * FROM menus WHERE owner_id = ?';

  connection.query(sql, [ownerId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(200).json(results);
  });
};


// Secure and Optimized: Get Food Items by Type
exports.getFoodItemsByType = (req, res) => {
  const type = req.query.type ? req.query.type.trim().toLowerCase() : '';
  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

  // console.log("Search Type:", type);
  // console.log("Price Range:", minPrice, "-", maxPrice);

  // Base SQL Query with Partial Matching
  let sql = `
      SELECT 
          m.id, 
          m.food_name, 
          m.description, 
          m.price, 
          m.image_url, 
          m.social_media_link AS owner_instagram,
          u.username AS owner_name,
          u.logo AS owner_logo,
          u.id AS owner_id
      FROM menus m
      JOIN users u ON m.owner_id = u.id
      WHERE LOWER(m.food_name) LIKE ?`;

  // Adding Price Filtering Conditionally
  const params = [`%${type}%`]; // Partial matching with LIKE
  if (minPrice !== null) {
      sql += " AND m.price >= ?";
      params.push(minPrice);
  }
  if (maxPrice !== null) {
      sql += " AND m.price <= ?";
      params.push(maxPrice);
  }

  // Debugging the final query
  // console.log("Final Query:", sql);
  // console.log("Query Parameters:", params);

  connection.query(sql, params, (err, results) => {
      if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Database error' });
      }

      // console.log("Results:", results);
      res.status(200).json(results);
  });
};

