const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Admin overview - total users, top spending categories, totals
// @route   GET /admin/overview
// @access  Private/Admin
const getOverview = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();

  const topCategories = await Transaction.aggregate([
    { $match: { type: 'expense' } },
    {
      $group: {
        _id: '$category',
        totalSpent: { $sum: { $abs: '$amount' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 5 },
    {
      $project: {
        _id: 0,
        category: '$_id',
        totalSpent: 1,
        count: 1,
      },
    },
  ]);

  const totals = await Transaction.aggregate([
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  res.status(200).json({
    totalUsers,
    totalTransactions: await Transaction.countDocuments(),
    topSpendingCategories: topCategories,
    totalsByType: totals,
  });
});

module.exports = { getOverview };
