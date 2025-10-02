const pool = require('../config/db');

/**
 * Build a public HTTPS URL for any stored logo value.
 * Supports:
 *  - "profiles/<file>.jpg"
 *  - "uploads/profiles/<file>.jpg"
 *  - full URLs like "http://localhost:5000/uploads/profiles/<file>.jpg"
 */
function toPublicLogoUrl(req, logo) {
  if (!logo) return null;

  // If it's already an absolute URL, normalize localhost -> current host
  if (/^https?:\/\//i.test(logo)) {
    // replace http://localhost:5000 with the current request host/protocol
    const base = `${req.protocol}://${req.get('host')}`;
    return logo.replace(/^https?:\/\/localhost:\d+/i, base);
  }

  // Ensure we don't duplicate "uploads/"
  const cleaned = String(logo).replace(/^\/?uploads\//i, '');
  // If it starts with "profiles/" or "menus/" etc., keep it; otherwise, assume profiles
  const relative =
    /^(profiles|menus|logos)\//i.test(cleaned) ? cleaned : `profiles/${cleaned}`;

  return `${req.protocol}://${req.get('host')}/api/uploads/${relative}`;
}

// GET /api/profiles/featured
exports.getFeaturedProfiles = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, bio, logo FROM users WHERE featured = 1 LIMIT 10'
    );

    const data = rows.map((r) => ({
      ...r,
      logoUrl: toPublicLogoUrl(req, r.logo),
    }));

    res.json(data);
  } catch (err) {
    console.error('Error fetching featured profiles:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

// GET /api/owners
exports.getAllOwners = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, bio, logo FROM users'
    );

    const data = rows.map((r) => ({
      ...r,
      logoUrl: toPublicLogoUrl(req, r.logo),
    }));

    res.json(data);
  } catch (err) {
    console.error('Error fetching owners:', err);
    res.status(500).json({ message: 'Database error' });
  }
};
