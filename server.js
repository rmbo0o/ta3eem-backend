const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const { connectDB } = require('./config/db');
const reviewRoutes = require('./routes/reviewRoutes');
const ownerRoutes = require('./routes/ownerRoutes'); // or ownerRoutes
const categoryRoutes= require('./routes/categoryRoutes');
const FeaturedProfilesRoutes = require('./routes/FeaturedProfilesRoutes');
const path = require('path');

dotenv.config();

const app = express();

const uploadDirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads/menus'),
  path.join(__dirname, 'uploads/profiles')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Enhanced CORS configuration
app.use(cors({
  origin: 'https://ta3eem-frontend.onrender.com',
  credentials: true,
  exposedHeaders: ['Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', ownerRoutes);
app.use('/api/categories',categoryRoutes);
app.use(FeaturedProfilesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(5000,'0.0.0.0', () => {
  console.log('Server running on port 5000');
});