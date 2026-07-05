const express = require('express');
const router = express.Router();
const multer = require('multer');
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middleware/authMiddleware');
const { profileStorage } = require('../config/cloudinary');

const upload = multer({ storage: profileStorage });

router.get('/all', storeController.getAllStores);
router.get('/featured', storeController.getFeaturedStores);
router.get('/me', authMiddleware, storeController.getMyStore);
router.get('/:id', storeController.getStoreById);
router.put('/me', authMiddleware, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'store_banner', maxCount: 1 }
]), storeController.updateStore);

module.exports = router;
