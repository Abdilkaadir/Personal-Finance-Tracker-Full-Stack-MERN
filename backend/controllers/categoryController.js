const asyncHandler = require('../utils/asyncHandler');
const Category = require('../models/Category');

// @desc    Get all categories (predefined + user's custom ones)
// @route   GET /categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({
    $or: [{ isDefault: true }, { createdBy: req.user._id }],
  }).sort({ name: 1 });

  res.status(200).json(categories);
});

// @desc    Create a custom category
// @route   POST /categories
// @access  Private
const createCategory = asyncHandler(async (req, res) => {
  const { name, type } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const exists = await Category.findOne({ name: name.trim() });
  if (exists) {
    return res.status(400).json({ message: 'Category already exists' });
  }

  const category = await Category.create({
    name: name.trim(),
    type: type || 'both',
    createdBy: req.user._id,
    isDefault: false,
  });

  res.status(201).json(category);
});

module.exports = { getCategories, createCategory };
