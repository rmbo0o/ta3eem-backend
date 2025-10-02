// profileRoutes.js
const express = require('express');
const router = express.Router();
const {
  getFeaturedProfiles,
  getAllOwners,
} = require('../controllers/FeaturedProfilesController');

// Keep the same public paths your frontend already calls:
router.get('/api/profiles/featured', getFeaturedProfiles);
router.get('/api/owners', getAllOwners);

module.exports = router;
