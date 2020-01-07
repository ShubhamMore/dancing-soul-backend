const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDE_NAME,
  api_key: process.env.CLOUDINARY_CLOUDE_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUDE_API_SECRET
});

module.exports = cloudinary;
