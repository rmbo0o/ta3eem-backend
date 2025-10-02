const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const FeaturedProfilesRoutes = require('./routes/FeaturedProfilesRoutes');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// trust proxy so req.protocol is https on Render
app.set('trust proxy', 1);

// CORS (kept as you had it)
app.use(
  cors({
    origin: 'https://ta3eem-frontendnew.onrender.com',
    credentials: true,
    exposedHeaders: ['Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Upload directory:
 * - If you attach a Render Persistent Disk, set UPLOAD_DIR=/data/uploads
 * - Otherwise falls back to ./uploads (ephemeral)
 */
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');

// Ensure upload subfolders exist
['', 'menus', 'profiles', 'logos'].forEach((sub) => {
  const dir = path.join(UPLOAD_DIR, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Serve uploads on both legacy and /api paths
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/api/uploads', express.static(UPLOAD_DIR));

// Routes (unchanged)
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', ownerRoutes);
app.use('/api/categories', categoryRoutes);
app.use(FeaturedProfilesRoutes);

// Health
app.get('/healthz', (_req, res) => res.status(200).send('OK'));

// 404 for unknown API routes (not static)
app.use((req, res, next) => {
  if (req.path.startsWith('/api') && !req.path.startsWith('/api/uploads')) {
    return res.status(404).json({ message: 'Not found' });
  }
  next();
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack || err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Serving uploads from: ${UPLOAD_DIR}`);
});
