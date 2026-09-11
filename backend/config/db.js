const mongoose = require('mongoose');

const connectDB = async () => {
  // Normalize the environment so DEVELOPMENT and development work the same way.
  const environment = (process.env.NODE_ENV || 'development').toLowerCase();

  // Local development uses MONGO_URI_DEV; every other environment uses MONGO_URI_PRO.
  const mongoUri = environment === 'development'
    ? process.env.MONGO_URI_DEV
    : process.env.MONGO_URI_PRO;

  if (!mongoUri) {
    const variableName = environment === 'development' ? 'MONGO_URI_DEV' : 'MONGO_URI_PRO';
    throw new Error(`${variableName} is missing. Add it to your .env file.`);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected (${environment})`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
