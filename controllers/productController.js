const pool = require('../config/db');

exports.getProducts = async (req, res) => {
  try {
    let sql = `SELECT p.*, sc.name AS category_name, u.store_name, u.username 
               FROM products p 
               LEFT JOIN store_categories sc ON p.category_id = sc.id
               LEFT JOIN users u ON p.store_id = u.id`;
    const params = [];
    const conditions = [];

    if (req.query.store_id) {
      conditions.push('p.store_id = ?');
      params.push(req.query.store_id);
    }

    if (req.query.category_id) {
      conditions.push('p.category_id = ?');
      params.push(req.query.category_id);
    }

    if (req.query.search) {
      conditions.push('p.name LIKE ?');
      params.push(`%${req.query.search}%`);
    }

    if (req.query.minPrice) {
      conditions.push('p.price >= ?');
      params.push(parseFloat(req.query.minPrice));
    }

    if (req.query.maxPrice) {
      conditions.push('p.price <= ?');
      params.push(parseFloat(req.query.maxPrice));
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStoreProducts = async (req, res) => {
  const { storeId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT p.*, sc.name AS category_name FROM products p LEFT JOIN store_categories sc ON p.category_id = sc.id WHERE p.store_id = ? ORDER BY p.created_at DESC',
      [storeId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching store products:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addProduct = async (req, res) => {
  const { name, description, price, category_id, stock, sku, has_discount, discount_price, social_media_link } = req.body;
  const image_url = req.file ? req.file.path : '';

  try {
    const [result] = await pool.query(
      `INSERT INTO products (store_id, name, description, price, image_url, category_id, stock, sku, has_discount, discount_price, social_media_link) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, description, price, image_url, category_id || null, stock || 0, sku || null, has_discount || 0, discount_price || null, social_media_link || '']
    );

    res.status(201).json({
      id: result.insertId,
      name,
      description,
      price,
      image_url,
      category_id,
      stock,
      sku
    });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category_id, stock, sku, has_discount, discount_price, social_media_link, is_active } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, category_id = ?, stock = ?, sku = ?, has_discount = ?, discount_price = ?, social_media_link = ?, is_active = ?
       WHERE id = ? AND store_id = ?`,
      [name, description, price, category_id || null, stock || 0, sku || null, has_discount || 0, discount_price || null, social_media_link || '', is_active !== undefined ? is_active : 1, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM products WHERE id = ? AND store_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
