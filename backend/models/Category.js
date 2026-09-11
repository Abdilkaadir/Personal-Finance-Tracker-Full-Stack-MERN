const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'both'],
      default: 'both',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means it's a predefined/system category
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
