const sizeOf = require('image-size');

const getImageSize = async imgUrl => {
  const mimeType = ['jpg', 'jpeg', 'png'];
  const ext = imgUrl.substr(imgUrl.lastIndexOf('.') + 1).toLowerCase();
  if (mimeType.indexOf(ext) !== -1) {
    const dimensions = await sizeOf(imgUrl);
    return { width: dimensions.width, height: dimensions.height };
  }
  return { width: '', height: '' };
};

module.exports = getImageSize;
