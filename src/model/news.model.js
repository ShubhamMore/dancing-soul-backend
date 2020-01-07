const mongoose = require('mongoose');
const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  file: {
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

const News = mongoose.model('News', newsSchema);

module.exports = News;
