const path = require('path');
const getImageSize = require('../shared/getImageSize');
const fs = require('fs').promises;
const s3 = require('./awsConfig');

const uploadFilesToAWS = async (filePath, fileName, cloudeDirectory) => {
  try {
    let upload_len = filePath.length;
    let upload_res = new Array();
    let upload_err = new Array();
    let file_err = new Array();

    for (let i = 0; i < upload_len; i++) {
      const fileContent = await fs.readFile(filePath[i]);

      // Setting up S3 upload parameters
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME + '/' + cloudeDirectory,
        Key: fileName[i], // File name you want to save as in S3
        Body: fileContent,
        ACL: 'public-read'
      };
      // Uploading files to the bucket
      const res = await s3.upload(params).promise();

      if (res.Location) {
        res.size = await getImageSize(
          path.join(__dirname, '../../', filePath[i])
        );
        upload_res.push(res);
      } else {
        upload_err.push(res);
      }

      fs.unlink(path.join(__dirname, '../../', filePath[i]), err => {
        if (err) {
          file_err.push(err);
        }
      });
    }

    return { upload_res, upload_err, file_err };
  } catch (e) {
    const err = 'Something bad happen while uploading files, ' + e;
    throw new Error(err.replace('Error: ', ''));
  }
};

module.exports = uploadFilesToAWS;
