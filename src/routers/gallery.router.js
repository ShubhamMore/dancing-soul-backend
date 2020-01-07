const multer = require('multer');
const express = require('express');

const fs = require('fs').promises;
const path = require('path');

const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');
const Gallery = require('../model/gallery.model');
const Video = require('../model/video.model');

const awsUploadFiles = require('../uploads/awsUploadFiles');
const awsUploadFile = require('../uploads/awsUploadFile');
const awsRemoveFile = require('../uploads/awsRemoveFile');

const MIME_TYPE_MAP = {
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

const writeImagesToFile = async category => {
  const images = await Gallery.find(
    { category },
    { _id: 0, secure_url: 1, width: 1, height: 1 }
  );

  const saveImages = new Array();

  images.forEach(curImage => {
    const devicePreviews = {};

    devicePreviews.preview_xxs = {
      path: curImage.secure_url,
      width: curImage.width,
      height: curImage.height
    };
    devicePreviews.preview_xs = {
      path: curImage.secure_url,
      width: curImage.width,
      height: curImage.height
    };
    devicePreviews.preview_s = {
      path: curImage.secure_url,
      width: curImage.width,
      height: curImage.height
    };
    devicePreviews.preview_m = {
      path: curImage.secure_url,
      width: curImage.width,
      height: curImage.height
    };
    devicePreviews.preview_l = {
      path: curImage.secure_url,
      width: curImage.width,
      height: curImage.height
    };
    devicePreviews.preview_xl = {
      path: curImage.secure_url,
      width: curImage.width,
      height: curImage.height
    };
    devicePreviews.raw = {
      path: curImage.secure_url,
      width: curImage.width,
      height: curImage.height
    };

    saveImages.push(devicePreviews);
  });

  let imagePath;

  if (category == 'mdp') {
    imagePath = path.join(__dirname, '../../', 'images/mdp.json');
  } else if (category == 'itc') {
    imagePath = path.join(__dirname, '../../', 'images/itc.json');
  } else if (category == 'mdm') {
    imagePath = path.join(__dirname, '../../', 'images/mdm.json');
  } else {
    imagePath = path.join(__dirname, '../../', 'images/images.json');
  }
  await fs.writeFile(imagePath, JSON.stringify(saveImages));

  // It Will Be Deleted After User side work is done
  imagePath = path.join(__dirname, '../../', 'images/images.json');
  await fs.writeFile(imagePath, JSON.stringify(saveImages));
};

router.post(
  '/addImages',
  auth,
  adminAuth,
  multer({ storage: storage }).array('image'),
  async (req, res) => {
    const file = req.files;
    if (file !== undefined) {
      let imagePaths = new Array();
      let imageNames = new Array();
      for (let i = 0; i < file.length; i++) {
        imagePaths.push(file[i].path);
        imageNames.push(file[i].filename);
      }

      const cloudeDirectory = 'gallery';
      try {
        const upload_responce = await awsUploadFiles(
          imagePaths,
          imageNames,
          cloudeDirectory
        );

        const upload_res = upload_responce.upload_res;
        const upload_res_len = upload_res.length;

        const responce = new Array();

        if (upload_res_len > 0) {
          for (let i = 0; i < upload_res_len; i++) {
            const img_data = {
              category: req.body.category,
              image_name: upload_res[i].key.split('/')[1],
              secure_url: upload_res[i].Location,
              public_id: upload_res[i].key,
              created_at: Date.now(),
              width: upload_res[i].size.width,
              height: upload_res[i].size.height
            };
            const gallery = new Gallery(img_data);
            const res = await gallery.save();
            responce.push(res);
          }
        }

        await writeImagesToFile(req.body.category);

        res.status(200).send({ responce, upload_responce });
      } catch (e) {
        const err = 'Something bad happen, ' + e;
        res.status(400).send(err.replace('Error: ', ''));
      }
    } else {
      res.status(400).send({ error: 'File Not Found' });
    }
  }
);

router.post(
  '/addImage',
  auth,
  adminAuth,
  multer({ storage: storage }).single('image'),
  async (req, res) => {
    const file = req.file;
    let imagePath = file.path;
    let imageName = file.filename;

    const cloudeDirectory = 'gallery';

    try {
      const upload_responce = await awsUploadFile(
        imagePath,
        imageName,
        cloudeDirectory
      );

      const upload_res = upload_responce.upload_res;

      const img_data = {
        category: req.body.category,
        image_name: upload_res.key.split('/')[1],
        secure_url: upload_res.Location,
        public_id: upload_res.key,
        created_at: Date.now(),
        width: upload_res.size.width,
        height: upload_res.size.height
      };

      const gallery = new Gallery(img_data);

      const responce = await gallery.save();

      await writeImagesToFile(req.body.category);

      res.status(200).send({ responce, upload_responce });
    } catch (e) {
      const err = 'Something bad happen, ' + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

router.post('/getImages', auth, adminAuth, async (req, res) => {
  try {
    const images = await Gallery.find({ category: req.body.category });
    res.status(200).send(images);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getAllImages', async (req, res) => {
  try {
    const image = {
      mdp: false,
      itc: false,
      mdm: false
    };

    const mdp = await Gallery.find(
      { category: 'mdp' },
      { _id: 0, secure_url: 1, width: 1, height: 1 }
    );
    if (mdp.length > 0) {
      image.mdp = true;
      const mdpPath = path.join(__dirname, '../../', 'images/mdp.json');
      const mdpData = JSON.parse(await fs.readFile(mdpPath));
      if (mdpData.length != mdp.length) {
        await writeImagesToFile('mdp');
      }
    }

    const itc = await Gallery.find(
      { category: 'itc' },
      { _id: 0, secure_url: 1, width: 1, height: 1 }
    );
    if (itc.length > 0) {
      image.itc = true;
      const itcPath = path.join(__dirname, '../../', 'images/itc.json');
      const itcData = JSON.parse(await fs.readFile(itcPath));
      if (itcData.length != itc.length) {
        await writeImagesToFile('itc');
      }
    }

    const mdm = await Gallery.find(
      { category: 'mdm' },
      { _id: 0, secure_url: 1, width: 1, height: 1 }
    );
    if (mdm.length > 0) {
      image.mdm = true;
      const mdmPath = path.join(__dirname, '../../', 'images/mdm.json');
      const mdmData = JSON.parse(await fs.readFile(mdmPath));
      if (mdmData.length != mdm.length) {
        await writeImagesToFile('mdm');
      }
    }

    res.status(200).send(image);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/removeImage', auth, adminAuth, async (req, res) => {
  const public_id = req.body.public_id;
  try {
    const image = await Gallery.findOneAndRemove({ public_id });

    if (!image) {
      throw new Error('No Image Found');
    }

    const responce = await awsRemoveFile(public_id);

    await writeImagesToFile(image.category);

    res.status(200).send(responce);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/addVideo', auth, adminAuth, async (req, res) => {
  try {
    const video = new Video(req.body);
    await video.save();
    res.status(200).send({ success: true });
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getVideos', async (req, res) => {
  try {
    const video = await Video.find();
    res.status(200).send(video);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getVideo', async (req, res) => {
  try {
    const video = await Video.findById(req.body._id);

    if (!video) {
      throw new Error('No Video Found');
    }

    res.status(200).send(video);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/removeVideo', auth, adminAuth, async (req, res) => {
  try {
    const video = await Video.findByIdAndRemove(req.body._id);

    if (!video) {
      throw new Error('No Video Found');
    }

    res.status(200).send({ success: true });
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
