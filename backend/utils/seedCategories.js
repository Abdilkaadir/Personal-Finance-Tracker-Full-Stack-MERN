// Optional one-off script: run with `node utils/seedCategories.js`
// Populates the database with a starter set of predefined categories.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');

const defaultCategories = [
  { name: 'Salary', type: 'income', isDefault: true },
  { name: 'Freelance', type: 'income', isDefault: true },
  { name: 'Food', type: 'expense', isDefault: true },
  { name: 'Transport', type: 'expense', isDefault: true },
  { name: 'Rent', type: 'expense', isDefault: true },
  { name: 'Utilities', type: 'expense', isDefault: true },
  { name: 'Entertainment', type: 'expense', isDefault: true },
  { name: 'Healthcare', type: 'expense', isDefault: true },
  { name: 'Savings', type: 'both', isDefault: true },
  { name: 'Other', type: 'both', isDefault: true },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for seeding...');

    for (const cat of defaultCategories) {
      await Category.findOneAndUpdate(
        { name: cat.name },
        cat,
        { upsert: true, new: true }
      );
    }

    console.log('Default categories seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
