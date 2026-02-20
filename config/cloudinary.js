const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Organize uploads by user/owner
    const ownerId = req.user.id;
    
    return {
      folder: `ta3eem/owners/${ownerId}/menus`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      transformation: [
        { width: 800, height: 600, crop: 'limit' }, // Resize large images
        { quality: 'auto' } // Automatic optimization
      ]
    };
  }
});

// Storage for profile images
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ownerId = req.user.id;
    return {
      folder: `ta3eem/owners/${ownerId}/profile`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      public_id: 'profile', // Fixed name so it overwrites
      transformation: [
        { width: 300, height: 300, crop: 'limit' }
      ]
    };
  }
});


module.exports = { cloudinary, storage , profileStorage};