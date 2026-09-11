const express = require('express');
const {
  createTransaction,
  getTransactions,
  getMonthlySummary,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
  createTransactionSchema,
  updateTransactionSchema,
} = require('../validators/transactionValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Manage income and expense transactions
 */

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Add a new income or expense transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, amount, type, category]
 *             properties:
 *               title: { type: string, example: Groceries }
 *               amount: { type: number, example: -50 }
 *               type: { type: string, enum: [income, expense], example: expense }
 *               category: { type: string, example: Food }
 *               date: { type: string, format: date, example: 2025-05-27 }
 *     responses:
 *       201: { description: Transaction created }
 *       400: { description: Validation error }
 *   get:
 *     summary: List all transactions for the logged-in user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: List of transactions }
 */
router.post('/', protect, validate(createTransactionSchema), createTransaction);
router.get('/', protect, getTransactions);

/**
 * @swagger
 * /transactions/monthly-summary:
 *   get:
 *     summary: Get total spent/earned per category for a given month
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *         description: 1-12, defaults to current month
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *         description: defaults to current year
 *     responses:
 *       200: { description: Monthly summary grouped by category }
 */
// NOTE: this route must be declared BEFORE /:id so Express doesn't treat
// "monthly-summary" as an :id param
router.get('/monthly-summary', protect, getMonthlySummary);

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     summary: Edit a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               amount: { type: number }
 *               type: { type: string, enum: [income, expense] }
 *               category: { type: string }
 *               date: { type: string, format: date }
 *     responses:
 *       200: { description: Transaction updated }
 *       404: { description: Transaction not found }
 *   delete:
 *     summary: Remove a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Transaction deleted }
 *       404: { description: Transaction not found }
 */
router.put('/:id', protect, validate(updateTransactionSchema), updateTransaction);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;
