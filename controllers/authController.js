const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/profiles'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Register User (Owner)
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const token = jwt.sign(
      { id: result.insertId, username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'User registered successfully',
      token,
      user: { id: result.insertId, username, email }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Login User (Owner)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [results] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Update Profile (bio, logo, instagram)
exports.updateProfile = async (req, res) => {
  try {
    const { bio, instagram } = req.body;
    const logo = req.file ? req.file.path : null;
    const userId = req.user.id;

    // Debug logs
    console.log('=== UPDATE PROFILE DEBUG ===');
    console.log('Received data:', { bio, instagram, logo, userId });
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Build query dynamically
    let query = 'UPDATE users SET';
    let params = [];
    let updates = [];

    // Add bio if provided
    if (bio !== undefined) {
      updates.push(' bio = ?');
      params.push(bio);
    }

    // Add instagram if provided (even if empty string)
    if (instagram !== undefined) {
      updates.push(' instagram = ?');
      params.push(instagram);
    }

    // Add logo if provided
    if (logo) {
      updates.push(' logo = ?');
      params.push(logo);
    }

    // If no updates, return error
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No data to update' });
    }

    // Complete the query
    query += updates.join(',');
    query += ' WHERE id = ?';
    params.push(userId);

    console.log('Final SQL:', query);
    console.log('With params:', params);

    // Execute the update
    const [result] = await pool.query(query, params);
    console.log('Update result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch the updated profile
    const [updatedProfile] = await pool.query(
      'SELECT id, username, email, bio, logo, instagram FROM users WHERE id = ?',
      [userId]
    );

    console.log('Updated profile:', updatedProfile[0]);
    console.log('=== END DEBUG ===');

    res.json({ 
      message: 'Profile updated successfully',
      user: updatedProfile[0]
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};

// Get Owner Profile Data
exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [results] = await pool.query(
      'SELECT id, username, email, bio, logo, instagram FROM users WHERE id = ?',
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    console.log('Profile fetched:', results[0]); // Debug log
    res.json(results[0]);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};