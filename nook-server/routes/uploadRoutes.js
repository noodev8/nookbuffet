/*
=======================================================================================================================================
UPLOAD ROUTES - Image upload endpoint for admin category images
=======================================================================================================================================
POST /api/uploads/image
  Accepts a multipart image file, saves it to nook-web/public/assets/uploads/,
  and returns the path so it can be stored in the DB and served by the web app.
=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Directory where uploaded images are saved — inside nook-web's public folder
// so Next.js serves them automatically at /assets/uploads/<filename>
// __dirname is nook-server/routes, so go up two levels to reach the project root
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'nook-web', 'public', 'assets', 'uploads');

// Create the directory if it doesn't exist yet
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// The image types allowed, and the extension each is saved with. The extension comes from
// here rather than the uploaded file's name, so a file can't be saved as e.g. .html
const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${EXTENSIONS[file.mimetype]}`;
    cb(null, safeName);
  }
});

// File filter — images only
const fileFilter = (_req, file, cb) => {
  if (EXTENSIONS[file.mimetype]) {
    cb(null, true);
  } else {
    const error = new Error('Only image files are allowed (jpeg, png, webp, gif)');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});

// ===== POST /api/uploads/image =====
// Accepts a single image field named "image", saves it, returns the URL path
router.post(
  '/image',
  verifyToken,
  checkRole(['admin']),
  (req, res, next) => {
    // Turn multer's errors (too big, wrong type) into a normal API response
    upload.single('image')(req, res, (err) => {
      if (!err) return next();
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.json({ return_code: 'FILE_TOO_LARGE', message: 'Images must be 5 MB or smaller' });
      }
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.json({ return_code: 'INVALID_FILE_TYPE', message: err.message });
      }
      console.error('Image upload error:', err);
      res.json({ return_code: 'SERVER_ERROR', message: 'Could not upload the image' });
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.json({ return_code: 'NO_FILE', message: 'No image file was uploaded' });
    }
    // Return path relative to nook-web public root — served at /assets/uploads/<filename>
    const url = `/assets/uploads/${req.file.filename}`;
    res.json({ return_code: 'SUCCESS', message: 'Image uploaded', url });
  }
);

// ===== DELETE /api/uploads/image =====
// Deletes an uploaded image by filename. Only files inside UPLOAD_DIR are allowed.
router.delete(
  '/image/:filename',
  verifyToken,
  checkRole(['admin']),
  (req, res) => {
    const { filename } = req.params;
    // Safety: strip any path separators so they can't traverse outside UPLOAD_DIR
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      return res.json({ return_code: 'NOT_FOUND', message: 'File not found' });
    }

    fs.unlink(filePath, (err) => {
      if (err) return res.json({ return_code: 'SERVER_ERROR', message: 'Could not delete file' });
      res.json({ return_code: 'SUCCESS', message: 'Image deleted' });
    });
  }
);

module.exports = router;
