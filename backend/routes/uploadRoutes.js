const express = require('express');
const { uploadProfilePicture } = require('../controllers/uploadController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File uploads (profile pictures) via Cloudinary
 */

/**
 * @swagger
 * /upload/profile-picture:
 *   post:
 *     summary: Upload or replace the logged-in user's profile picture
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: Upload successful, returns Cloudinary URL }
 *       400: { description: No file provided or invalid file type }
 */
router.post('/profile-picture', protect, upload.single('image'), uploadProfilePicture);

module.exports = router;
