const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String
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

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;
