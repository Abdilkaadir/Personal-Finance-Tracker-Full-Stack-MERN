const express = require('express');
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Predefined and custom transaction categories
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List predefined and custom categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of categories }
 *   post:
 *     summary: Create a custom category (optional)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: Freelance Income }
 *               type: { type: string, enum: [income, expense, both], example: income }
 *     responses:
 *       201: { description: Category created }
 *       400: { description: Category already exists or validation error }
 */
router.get('/', protect, getCategories);
router.post('/', protect, createCategory);

module.exports = router;
