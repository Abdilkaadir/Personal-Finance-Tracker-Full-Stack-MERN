const express = require('express');
const { getOverview } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { admin } = require('../middlewares/adminMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only analytics and overview
 */

/**
 * @swagger
 * /admin/overview:
 *   get:
 *     summary: Get platform-wide stats (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Overview stats returned }
 *       403: { description: Access denied - admin role required }
 */
router.get('/overview', protect, admin, getOverview);

module.exports = router;
