const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  content: {
    type: String,
    default: ''
  },
  careerContent: {
    type: String,
    default: ''
  }
});

const Content = mongoose.model('Content', contentSchema);
module.exports = Content;
