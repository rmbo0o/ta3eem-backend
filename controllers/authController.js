const { connection } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/profiles'); // Save to uploads folder
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

  // Add validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user exists first
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    connection.query(checkQuery, [email], async (err, results) => {
      if (err) throw err;
      
      if (results.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      connection.query(insertQuery, [username, email, hashedPassword], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Registration failed' });
        }
        
        // Generate token for auto-login
        const token = jwt.sign({ id: results.insertId, username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ 
          message: 'User registered successfully',
          token,
          user: { id: results.insertId, username, email }
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Login User (Owner)
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  connection.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Login failed' });
    }

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
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  });
};

// Update Profile (bio, logo)
exports.updateProfile = (req, res) => {
  const bio = req.body;
  const logo = req.file ? `/uploads/profiles/${req.file.filename}` : null;
  const userId = req.user.id;

  const query = 'UPDATE users SET bio = ?, logo = ? WHERE id = ?';
  connection.query(query, [bio, logo, userId], (err, results) => {
    if (err) {
      return res.status(400).json({ message: 'Error updating profile', error: err });
    }
    res.json({ message: 'Profile updated successfully' });
  });
};

// Get Owner Profile Data
exports.getProfile = (req, res) => {
  const userId = req.user.id;

  const query = 'SELECT username, email, bio, logo FROM users WHERE id = ?';
  connection.query(query, [userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: 'Error fetching profile' });
    }
    res.json(results[0]);
  });
};
