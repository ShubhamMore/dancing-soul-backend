const s3 = require('./awsConfig');

const removeAWSFile = async key => {
  try {
    // Setting up S3 delete parameters
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key // File name you want to save as in S3
    };

    // deleteing files to the bucket
    const res = await s3
      .deleteObject(params, (error, result) => {
        if (error) {
          return error;
        }
        return result;
      })
      .promise();
    return res;
  } catch (e) {
    const err = 'Something bad happen while removing file, ' + e;
    throw new Error(err.replace('Error: ', ''));
  }
};

module.exports = removeAWSFile;
