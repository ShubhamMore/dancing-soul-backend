const express = require('express');
const multer = require('multer');

const auth = require('../middleware/auth');
const Article = require('../model/article.model');

const awsUploadFile = require('../uploads/awsUploadFile');
const awsRemoveFile = require('../uploads/awsRemoveFile');

const MIME_TYPE_MAP = {
  // PDF
  'application/pdf': 'pdf',
  // IMAGES
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    cb(error, 'fileToUpload');
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(' ')
      .join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

const router = new express.Router();

router.post(
  '/addArticle',
  auth,
  multer({ storage: storage }).single('image'),
  async (req, res) => {
    const file = req.file;
    try {
      const data = req.body;

      let fileData = null;

      if (file !== undefined) {
        let filePath = file.path;
        let fileName = file.filename;

        const cloudeDirectory = 'articles';

        try {
          const upload_responce = await awsUploadFile(
            filePath,
            fileName,
            cloudeDirectory
          );

          const upload_res = upload_responce.upload_res;

          if (upload_res) {
            const file_data = {
              file_name: upload_res.key.split('/')[1],
              secure_url: upload_res.Location,
              public_id: upload_res.key,
              created_at: Date.now(),
              width: upload_res.size.width,
              height: upload_res.size.height
            };
            fileData = file_data;
          }
        } catch (e) {
          fileData = null;
        }
      }

      const articleData = {
        title: data.title,
        body: data.body,
        file: fileData
      };

      const article = new Article(articleData);
      article.file = fileData;
      await article.save();

      res.status(200).send({ success: true });
    } catch (e) {
      const err = 'Something bad happen, ' + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

router.post('/getArticles', async (req, res) => {
  try {
    const articles = await Article.find();
    if (!articles) {
      throw new Error('No Article found');
    }
    res.status(200).send(articles);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getAllArticles', async (req, res) => {
  try {
    const articles = await Article.find();
    res.status(200).send(articles);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getArticle', async (req, res) => {
  try {
    const article = await Article.findById(req.body._id);
    if (!article) {
      throw new Error('No Articles found');
    }
    res.status(200).send(article);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post(
  '/editArticle',
  auth,
  multer({ storage: storage }).single('image'),
  async (req, res) => {
    const file = req.file;
    try {
      const data = req.body;

      const article = await Article.findById(data._id);

      if (!article) {
        throw new Error('No Faculty Found');
      }

      let fileData = article.file;
      let file_pub_id;
      if (fileData) {
        file_pub_id = article.file.public_id;
      }
      if (file !== undefined) {
        let filePath = file.path;
        let fileName = file.filename;

        const cloudeDirectory = 'articles';

        try {
          const upload_responce = await awsUploadFile(
            filePath,
            fileName,
            cloudeDirectory
          );

          const upload_res = upload_responce.upload_res;

          if (upload_res) {
            const file_data = {
              file_name: upload_res.key.split('/')[1],
              secure_url: upload_res.Location,
              public_id: upload_res.key,
              created_at: Date.now(),
              width: upload_res.size.width,
              height: upload_res.size.height
            };
            fileData = file_data;
          }
          await awsRemoveFile(file_pub_id);
        } catch (e) {}
      }

      const articleData = {
        _id: data._id,
        title: data.title,
        body: data.body,
        file: fileData
      };

      await Article.findByIdAndUpdate(data._id, articleData);

      res.status(200).send(article);
    } catch (e) {
      const err = 'Something bad happen, ' + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

router.post('/deleteArticle', auth, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.body._id);
    if (!article) {
      throw new Error('No Articles found');
    }
    if (article.file.file_name !== undefined) {
      await awsRemoveFile(article.file.public_id);
    }

    res.status(200).send({ success: true });
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deleteArticleFile', auth, async (req, res) => {
  const public_id = req.body.public_id;
  try {
    const article = await Article.findByIdAndUpdate(req.body._id, {
      file: null
    });
    if (!article) {
      throw new Error('No Article Found');
    }

    const responce = await awsRemoveFile(public_id);

    res.status(200).send(responce);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
