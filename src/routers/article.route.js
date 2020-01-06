const multer = require('multer');
const express = require('express');
const auth = require('../middleware/auth');
const Article = require('../model/article.model');

const storage = require('../image-upload/multerConfig');

const cloudinaryRemoveImage = require('../image-upload/cloudinaryRemoveImage');
const cloudinaryUploadImage = require('../image-upload/cloudinaryUploadImage');

const noImage = require('../shared/no_image.image');

const router = new express.Router();

router.post(
  '/addArticle',
  auth,
  multer({ storage: storage }).single('image'),
  async (req, res) => {
    const file = req.file;
    try {
      const data = req.body;

      let image;

      if (file !== undefined) {
        let imagePath = file.path;
        let imageName = file.filename.split('.')[0];

        const cloudeDirectory = 'articles';

        try {
          const upload_responce = await cloudinaryUploadImage(
            imagePath,
            imageName,
            cloudeDirectory
          );

          const upload_res = upload_responce.upload_res;

          if (upload_res) {
            const img_data = {
              image_name:
                upload_res.original_filename + '.' + upload_res.format,
              secure_url: upload_res.secure_url,
              public_id: upload_res.public_id,
              created_at: upload_res.created_at,
              width: upload_res.width,
              height: upload_res.height
            };
            image = img_data;
          }
        } catch (e) {
          image = noImage;
        }
      } else {
        image = noImage;
      }

      const articleData = {
        title: data.title,
        body: data.body,
        image: image
      };

      const article = new Article(articleData);

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

    const article = new Array();

    articles.forEach(curArticle => {
      const articleObj = {
        _id: curArticle._id,
        title: curArticle.title,
        body: curArticle.body
      };
      if (curArticle.image.public_id != noImage.public_id) {
        articleObj.url = curArticle.image.secure_url;
      }
      article.push(articleObj);
    });

    res.status(200).send(article);
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

      let image;

      image = article.image;

      const img_pub_id = article.image.public_id;
      if (file !== undefined) {
        let imagePath = file.path;
        let imageName = file.filename.split('.')[0];

        const cloudeDirectory = 'articles';

        try {
          const upload_responce = await cloudinaryUploadImage(
            imagePath,
            imageName,
            cloudeDirectory
          );

          const upload_res = upload_responce.upload_res;

          if (upload_res) {
            const img_data = {
              image_name:
                upload_res.original_filename + '.' + upload_res.format,
              secure_url: upload_res.secure_url,
              public_id: upload_res.public_id,
              created_at: upload_res.created_at,
              width: upload_res.width,
              height: upload_res.height
            };
            image = img_data;
          }

          if (img_pub_id !== noImage.public_id) {
            await cloudinaryRemoveImage(img_pub_id);
          }
        } catch (e) {}
      }

      const articleData = {
        _id: data._id,
        title: data.title,
        body: data.body,
        image: image
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

    const responce = await cloudinaryRemoveImage(article.image.public_id);

    res.status(200).send(responce);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deleteArticleImage', auth, async (req, res) => {
  const public_id = req.body.public_id;
  try {
    const article = await Article.findById(req.body._id);
    if (!article) {
      throw new Error('No Article Found');
    }

    const responce = await cloudinaryRemoveImage(public_id);

    if (responce.result == 'ok') {
      article.image = noImage;
      await article.save();
    }

    res.status(200).send(responce);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
