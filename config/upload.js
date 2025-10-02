// upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function makeStorage(subfolder = 'menus') {
  const dest = path.join(UPLOAD_DIR, subfolder);
  ensureDir(dest);

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '');
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${unique}${ext || '.jpg'}`);
    },
  });
}

function fileFilter(_req, file, cb) {
  const ok =
    /image\/(jpeg|png|webp|gif|bmp)/i.test(file.mimetype) ||
    /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(file.originalname || '');
  if (ok) return cb(null, true);
  cb(new Error('Only image files are allowed'));
}

/**
 * Factory: create an uploader for a specific subfolder.
 * Example: router.post('/menus/upload', uploadMenus.single('image'), handler)
 */
function makeUploader(subfolder = 'menus') {
  return multer({
    storage: makeStorage(subfolder),
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  });
}

// Ready-made uploaders
const uploadMenus = makeUploader('menus');
const uploadProfiles = makeUploader('profiles');
const uploadLogos = makeUploader('logos');

module.exports = {
  UPLOAD_DIR,
  makeUploader,
  uploadMenus,
  uploadProfiles,
  uploadLogos,
};
