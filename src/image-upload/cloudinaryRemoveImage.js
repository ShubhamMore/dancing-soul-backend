const cloudinary = require('./cloudinaryConfig');

const removeCloudeImage = async public_id => {
  try {
    const res = await cloudinary.v2.uploader.destroy(
      public_id,
      (error, result) => {
        if (error) {
          throw new Error('File cant Deleted');
        }
        return result;
      }
    );
    return res;
  } catch (e) {
    const err = 'Something bad happen while removing image file, ' + e;
    throw new Error(err.replace('Error: ', ''));
  }
};

module.exports = removeCloudeImage;
