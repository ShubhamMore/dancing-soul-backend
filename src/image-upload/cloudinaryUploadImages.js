const path = require('path');
const fs = require('fs');

const cloudinary = require('./cloudinaryConfig');

const uploadImagesToCloude = async (filePaths, imageNames, cloudeDirectory) => {
  try {
    let upload_len = filePaths.length;
    let upload_res = new Array();
    let upload_err = new Array();
    let file_err = new Array();

    for (let i = 0; i < upload_len; i++) {
      let filePath = filePaths[i];
      let fileName = imageNames[i];
      await cloudinary.v2.uploader.upload(
        filePath,
        {
          folder: cloudeDirectory,
          public_id: fileName
        },
        (error, responce) => {
          if (error) {
            fs.unlink(path.join(__dirname, '../../', filePath), err => {
              if (err) {
                file_err.push(err);
              }
            });
            upload_err.push(error);
          }

          fs.unlink(path.join(__dirname, '../../', filePath), err => {
            if (err) {
              file_err.push(err);
            }
          });
          upload_res.push(responce);
        }
      );
    }

    return { upload_res, upload_err, file_err };
  } catch (e) {
    const err = 'Something bad happen while uploading image files, ' + e;
    throw new Error(err.replace('Error: ', ''));
  }
};

module.exports = uploadImagesToCloude;
