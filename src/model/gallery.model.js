var mongoose = require('mongoose');

var gallerySchema = mongoose.Schema({
  image_name: {
    type: String,
    required: true
  },
  secure_url: {
    type: String,
    required: true
  },
  public_id: {
    type: String,
    require: true
  },
  created_at: {
    type: String,
    default: Date.now.toString()
  },
  width: {
    type: String,
    require: true
  },
  height: {
    type: String,
    require: true
  }
});

const Gallery = mongoose.model('Gallery', gallerySchema);
module.exports = Gallery;
