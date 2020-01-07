const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');
const News = require('../model/news.model');

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
  '/addNews',
  auth,
  adminAuth,
  multer({ storage: storage }).single('image'),
  async (req, res) => {
    const file = req.file;
    try {
      const data = req.body;

      let fileData = null;

      if (file !== undefined) {
        let filePath = file.path;
        let fileName = file.filename;

        const cloudeDirectory = 'news';

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

      const newsData = {
        title: data.title,
        body: data.body,
        file: fileData
      };

      const news = new News(newsData);
      news.file = fileData;

      await news.save();
      res.status(200).send({ success: true });
    } catch (e) {
      const err = 'Something bad happen, ' + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

router.post('/getAllNews', async (req, res) => {
  try {
    const allNews = await News.find();
    if (!allNews) {
      throw new Error('No news found');
    }
    res.status(200).send(allNews);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getNews', async (req, res) => {
  try {
    const news = await News.findById(req.body._id);
    if (!news) {
      throw new Error('No news found');
    }
    res.status(200).send(news);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post(
  '/editNews',
  auth,
  adminAuth,
  multer({ storage: storage }).single('image'),
  async (req, res) => {
    const file = req.file;
    try {
      const data = req.body;

      const news = await News.findById(data._id);

      if (!news) {
        throw new Error('No News Found');
      }

      let fileData = news.file;
      let file_pub_id;
      if (fileData) {
        file_pub_id = news.file.public_id;
      }
      if (file !== undefined) {
        let filePath = file.path;
        let fileName = file.filename;

        const cloudeDirectory = 'news';

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

      const newsData = {
        _id: data._id,
        title: data.title,
        body: data.body,
        file: fileData
      };

      await News.findByIdAndUpdate(data._id, newsData);
      res.status(200).send(news);
    } catch (e) {
      const err = 'Something bad happen, ' + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

router.post('/deleteNews', auth, adminAuth, async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.body._id);
    if (!news) {
      throw new Error('No news found');
    }
    if (news.file.file_name !== undefined) {
      await awsRemoveFile(news.file.public_id);
    }
    res.status(200).send({ success: true });
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deleteNewsFile', auth, adminAuth, async (req, res) => {
  const public_id = req.body.public_id;
  try {
    const news = await News.findByIdAndUpdate(req.body._id, {
      file: null
    });
    if (!news) {
      throw new Error('No News Found');
    }

    const responce = await awsRemoveFile(public_id);

    res.status(200).send(responce);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
