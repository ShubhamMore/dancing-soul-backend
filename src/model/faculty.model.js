const mongoose = require('mongoose');
const validator = require('validator');
const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  birthDate: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
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
      required: true
    },
    created_at: {
      type: String,
      default: Date.now.toString()
    },
    width: {
      type: String,
      required: true
    },
    height: {
      type: String,
      required: true
    }
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  }
});

const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty;
