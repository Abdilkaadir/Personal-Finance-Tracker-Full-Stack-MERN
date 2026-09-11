const asyncHandler = require('../utils/asyncHandler');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');

// @desc    Upload / replace the logged-in user's profile picture
// @route   POST /upload/profile-picture
// @access  Private
const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }

  // Remove old profile picture from Cloudinary if one exists
  if (req.user.profilePicture && req.user.profilePicture.publicId) {
    await cloudinary.uploader.destroy(req.user.profilePicture.publicId);
  }

  const result = await uploadToCloudinary(req.file.buffer, 'profile-pictures');

  req.user.profilePicture = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await req.user.save();

  res.status(200).json({
    message: 'Profile picture uploaded successfully',
    profilePicture: req.user.profilePicture,
  });
});

module.exports = { uploadProfilePicture };
