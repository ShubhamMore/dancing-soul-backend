const mongoose = require('mongoose');
const validator = require('validator');
const enquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  seen: {
    type: String,
    required: true
  },
  date: {
    type: String,
    default: Date.now().toString()
  }
});
const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry;
