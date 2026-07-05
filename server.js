const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const FeaturedProfilesRoutes = require('./routes/FeaturedProfilesRoutes');
const storeRoutes = require('./routes/storeRoutes');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

app.set('trust proxy', 1);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'https://souqy-frontend.onrender.com',
    credentials: true,
    exposedHeaders: ['Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');

['', 'products', 'profiles', 'logos', 'banners'].forEach((sub) => {
  const dir = path.join(UPLOAD_DIR, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/api/uploads', express.static(UPLOAD_DIR));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', ownerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/seed', require('./routes/seedRoutes'));
app.use(FeaturedProfilesRoutes);

// Health
app.get('/healthz', (_req, res) => res.status(200).send('OK'));

app.use((req, res, next) => {
  if (req.path.startsWith('/api') && !req.path.startsWith('/api/uploads')) {
    return res.status(404).json({ message: 'Not found' });
  }
  next();
});

app.use((err, _req, res, _next) => {
  console.error(err.stack || err);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Souqy Server running on port ${PORT}`);
  console.log(`Serving uploads from: ${UPLOAD_DIR}`);
});


