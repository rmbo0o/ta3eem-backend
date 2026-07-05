const pool = require('../config/db');

exports.getMyStore = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, store_name, email, bio, logo, store_banner, instagram, phone, whatsapp, city, store_type, featured 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching store:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const { store_name, bio, instagram, phone, whatsapp, city, store_type } = req.body;
    const logo = req.files?.logo ? req.files.logo[0].path : null;
    const store_banner = req.files?.store_banner ? req.files.store_banner[0].path : null;
    const userId = req.user.id;

    let query = 'UPDATE users SET';
    const params = [];
    const updates = [];

    if (store_name !== undefined) { updates.push(' store_name = ?'); params.push(store_name); }
    if (bio !== undefined) { updates.push(' bio = ?'); params.push(bio); }
    if (instagram !== undefined) { updates.push(' instagram = ?'); params.push(instagram); }
    if (phone !== undefined) { updates.push(' phone = ?'); params.push(phone); }
    if (whatsapp !== undefined) { updates.push(' whatsapp = ?'); params.push(whatsapp); }
    if (city !== undefined) { updates.push(' city = ?'); params.push(city); }
    if (store_type !== undefined) { updates.push(' store_type = ?'); params.push(store_type); }
    if (logo) { updates.push(' logo = ?'); params.push(logo); }
    if (store_banner) { updates.push(' store_banner = ?'); params.push(store_banner); }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No data to update' });
    }

    query += updates.join(',');
    query += ' WHERE id = ?';
    params.push(userId);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const [updatedStore] = await pool.query(
      'SELECT id, username, store_name, email, bio, logo, store_banner, instagram, phone, whatsapp, city, store_type FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Store updated successfully',
      store: updatedStore[0]
    });
  } catch (err) {
    console.error('Error updating store:', err);
    res.status(500).json({ message: 'Error updating store', error: err.message });
  }
};

exports.getStoreById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id, username, store_name, bio, logo, store_banner, instagram, phone, whatsapp, city, store_type, featured 
       FROM users WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching store:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllStores = async (req, res) => {
  try {
    const { search = '', category } = req.query;

    let query = 'SELECT id, username, store_name, bio, logo, store_banner, instagram, city, store_type FROM users WHERE 1=1';
    const params = [];

    if (search && search.trim() !== '') {
      query += ' AND (username LIKE ? OR store_name LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (category) {
      query += ' AND store_type = ?';
      params.push(category);
    }

    query += ' ORDER BY featured DESC, id DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching stores:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

exports.getFeaturedStores = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, store_name, bio, logo, store_banner, city FROM users WHERE featured = 1 LIMIT 10'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching featured stores:', err);
    res.status(500).json({ message: 'Database error' });
  }
};
