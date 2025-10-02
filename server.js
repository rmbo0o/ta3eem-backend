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

// Ensure upload directories exist
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

// CORS config
app.use(cors({
  origin: 'https://ta3eem-frontendnew.onrender.com',
  credentials: true,
  exposedHeaders: ['Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

// Serve uploads
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');

// Ensure the directories exist at boot
const subfolders = ['menus', 'profiles', 'logos'];
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
for (const sub of subfolders) {
  fs.mkdirSync(path.join(UPLOAD_DIR, sub), { recursive: true });
}

// Serve static files for both legacy and API-prefixed URLs
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/api/uploads', express.static(UPLOAD_DIR));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', ownerRoutes);
app.use('/api/categories', categoryRoutes);
app.use(FeaturedProfilesRoutes);


app.get('/healthz', (_req, res) => res.status(200).send('OK'));

// 404 handler (for non-static API routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api') && !req.path.startsWith('/api/uploads')) {
    return res.status(404).json({ message: 'Not found' });
  }
  next();
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Serving uploads from: ${UPLOAD_DIR}`);
});
