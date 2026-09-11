const asyncHandler = require('../utils/asyncHandler');
const Transaction = require('../models/Transaction');

// @desc    Create a new transaction
// @route   POST /transactions
// @access  Private
const createTransaction = asyncHandler(async (req, res) => {
  const { title, amount, type, category, date } = req.body;

  const transaction = await Transaction.create({
    user: req.user._id,
    title,
    amount,
    type,
    category,
    date: date || Date.now(),
  });

  res.status(201).json(transaction);
});

// @desc    Get all transactions for logged-in user (supports pagination & filters)
// @route   GET /transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const { type, category, page = 1, limit = 20 } = req.query;

  const filter = { user: req.user._id };
  if (type) filter.type = type;
  if (category) filter.category = category;

  const transactions = await Transaction.find(filter)
    .sort({ date: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await Transaction.countDocuments(filter);

  res.status(200).json({
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    transactions,
  });
});

// @desc    Get monthly summary - total income/expense per category
// @route   GET /transactions/monthly-summary
// @access  Private
const getMonthlySummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  const now = new Date();
  const targetMonth = month ? Number(month) - 1 : now.getMonth();
  const targetYear = year ? Number(year) : now.getFullYear();

  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 1);

  const summary = await Transaction.aggregate([
    {
      $match: {
        user: req.user._id,
        date: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        totalAmount: 1,
        count: 1,
      },
    },
    { $sort: { category: 1 } },
  ]);

  const totals = summary.reduce(
    (acc, item) => {
      if (item.type === 'income') acc.totalIncome += item.totalAmount;
      if (item.type === 'expense') acc.totalExpense += item.totalAmount;
      return acc;
    },
    { totalIncome: 0, totalExpense: 0 }
  );

  res.status(200).json({
    month: targetMonth + 1,
    year: targetYear,
    ...totals,
    net: totals.totalIncome + totals.totalExpense,
    byCategory: summary,
  });
});

// @desc    Update a transaction
// @route   PUT /transactions/:id
// @access  Private
const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  const fields = ['title', 'amount', 'type', 'category', 'date'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) transaction[field] = req.body[field];
  });

  const updated = await transaction.save();
  res.status(200).json(updated);
});

// @desc    Delete a transaction
// @route   DELETE /transactions/:id
// @access  Private
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  res.status(200).json({ message: 'Transaction deleted successfully' });
});

module.exports = {
  createTransaction,
  getTransactions,
  getMonthlySummary,
  updateTransaction,
  deleteTransaction,
};
