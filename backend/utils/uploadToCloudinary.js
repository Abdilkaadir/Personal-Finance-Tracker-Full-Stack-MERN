const cloudinary = require('../config/cloudinary');

/**
 * Uploads an in-memory file buffer (from multer.memoryStorage()) to Cloudinary.
 * @param {Buffer} fileBuffer - The file buffer from req.file.buffer
 * @param {string} folder - Cloudinary folder to store the file in
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadToCloudinary = (fileBuffer, folder = 'profile-pictures') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

module.exports = uploadToCloudinary;
