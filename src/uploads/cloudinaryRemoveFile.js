const cloudinary = require('./cloudinaryConfig');

const removeCloudinaryFile = async (public_id, resource_type) => {
  try {
    const res = await cloudinary.v2.uploader.destroy(
      public_id,
      {
        resource_type: resource_type
      },
      (error, result) => {
        if (error) {
          throw new Error('File cant Deleted');
        }
        return result;
      }
    );
    return res;
  } catch (e) {
    const err = 'Something bad happen while removing File file, ' + e;
    throw new Error(err.replace('Error: ', ''));
  }
};

module.exports = removeCloudinaryFile;
