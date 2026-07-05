const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage });

router.get('/', productController.getProducts);
router.get('/store/:storeId', productController.getStoreProducts);
router.post('/', authMiddleware, upload.single('image'), productController.addProduct);
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;
