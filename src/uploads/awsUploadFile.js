const path = require('path');
const fs = require('fs').promises;
const getImageSize = require('../shared/getImageSize');

const s3 = require('./awsConfig');

const uploadFileToAWS = async (filePath, fileName, cloudeDirectory) => {
  try {
    let upload_res;
    let upload_err;
    let file_err;

    const fileContent = await fs.readFile(filePath);

    // Setting up S3 upload parameters
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME + '/' + cloudeDirectory,
      Key: fileName, // File name you want to save as in S3
      Body: fileContent,
      ACL: 'public-read'
    };

    // Uploading files to the bucket
    const res = await s3.upload(params).promise();
    if (res.Location) {
      res.size = await getImageSize(path.join(__dirname, '../../', filePath));
      upload_res = res;
    } else {
      upload_err = res;
    }

    fs.unlink(path.join(__dirname, '../../', filePath), err => {
      if (err) {
        file_err = err;
      }
    });

    return { upload_res, upload_err, file_err };
  } catch (e) {
    const err = 'Something bad happen while uploading file, ' + e;
    throw new Error(err.replace('Error: ', ''));
  }
};

module.exports = uploadFileToAWS;
