const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
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
  description: {
    type: String,
    required: true
  },
  date: {
    type: String,
    default: Date.now().toString()
  },
  coverLatter: {
    file_name: {
      type: String
    },
    secure_url: {
      type: String
    },
    public_id: {
      type: String
    },
    created_at: {
      type: String
    },
    width: {
      type: String
    },
    height: {
      type: String
    }
  },
  resume: {
    file_name: {
      type: String
    },
    secure_url: {
      type: String
    },
    public_id: {
      type: String
    },
    created_at: {
      type: String
    },
    width: {
      type: String
    },
    height: {
      type: String
    }
  }
});

const Career = mongoose.model('Career', careerSchema);
module.exports = Career;
