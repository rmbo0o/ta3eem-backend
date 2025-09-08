// profileRoutes.js

const express = require('express');
const router = express.Router();
const { getFeaturedProfiles } = require('../controllers/FeaturedProfilesController');
const { getAllOwners } = require('../controllers/FeaturedProfilesController');
// Route to get featured profiles
router.get('/api/profiles/featured', getFeaturedProfiles);
router.get('/api/owners', getAllOwners);
module.exports = router;
