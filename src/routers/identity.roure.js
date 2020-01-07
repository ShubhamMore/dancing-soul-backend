const multer = require('multer');
const express = require('express');

const auth = require('../middleware/auth');

const awsRemoveFile = require('../uploads/awsRemoveFile');
const awsUploadFiles = require('../uploads/awsUploadFiles');

const Identity = require('../model/identity.model');

const findIndexByKey = require('../shared/findIndex');

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

router.post(
  '/addIdentity',
  auth,
  multer({ storage: storage }).array('image'),
  async (req, res) => {
    const images = new Array();
    const file = req.files;
    try {
      if (file.length > 0) {
        let imagePaths = new Array();
        let imageNames = new Array();
        for (let i = 0; i < file.length; i++) {
          imagePaths.push(file[i].path);
          imageNames.push(file[i].filename);
        }

        const cloudeDirectory = 'identities';

        try {
          const upload_responce = await awsUploadFiles(
            imagePaths,
            imageNames,
            cloudeDirectory
          );

          const upload_res = upload_responce.upload_res;
          const upload_res_len = upload_res.length;

          if (upload_res_len > 0) {
            for (let i = 0; i < upload_res_len; i++) {
              const img_data = {
                image_name: upload_res[i].key.split('/')[1],
                secure_url: upload_res[i].Location,
                public_id: upload_res[i].key,
                created_at: Date.now(),
                width: upload_res[i].size.width,
                height: upload_res[i].size.height
              };
              images.push(img_data);
            }
          }
        } catch (e) {
          throw new Error('Operation Failed..');
        }
      } else {
        throw new Error('Please Provice Identity');
      }

      const identityData = {
        student: req.body.student,
        identityImages: images
      };

      const identity = new Identity(identityData);

      await identity.save();

      res.status(200).send({ success: true });
    } catch (e) {
      const err = 'Something bad happen, ' + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

router.post('/getIdentity', auth, async (req, res) => {
  try {
    const identity = await Identity.findOne({ student: req.body.student });
    res.status(200).send(identity);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post(
  '/updateIdentity',
  auth,
  multer({ storage: storage }).array('image'),
  async (req, res) => {
    let images = new Array();
    const file = req.files;
    try {
      const identity = await Identity.findById(req.body._id);

      if (!identity) {
        throw new Error('No Identity Found');
      }

      images = identity.identityImages;

      const public_ids = new Array();

      images.forEach(image => {
        public_ids.push(image.public_id);
      });

      if (file.length > 0) {
        let imagePaths = new Array();
        let imageNames = new Array();
        for (let i = 0; i < file.length; i++) {
          imagePaths.push(file[i].path);
          imageNames.push(file[i].filename);
        }

        const cloudeDirectory = 'identities';

        try {
          const upload_responce = await awsUploadFiles(
            imagePaths,
            imageNames,
            cloudeDirectory
          );

          const upload_res = upload_responce.upload_res;
          const upload_res_len = upload_res.length;

          if (upload_res_len > 0) {
            for (let i = 0; i < upload_res_len; i++) {
              const img_data = {
                image_name: upload_res[i].key.split('/')[1],
                secure_url: upload_res[i].Location,
                public_id: upload_res[i].key,
                created_at: Date.now(),
                width: upload_res[i].size.width,
                height: upload_res[i].size.height
              };
              images.push(img_data);

              let public_id_to_remove;

              public_ids.forEach(public_id => {
                if (
                  public_id.split('-')[0] ==
                  upload_res[i].public_id.split('-')[0]
                ) {
                  public_id_to_remove = public_id;
                }
              });

              if (public_id_to_remove) {
                const res = await awsRemoveFile(public_id_to_remove);

                if (res.result == 'ok') {
                  const index = findIndexByKey(
                    images,
                    'public_id',
                    public_id_to_remove
                  );
                  if (index !== null) {
                    images.splice(index, 1);
                  }
                }
              }
            }
          }
        } catch (e) {
          throw new Error('Operation Failed..');
        }
      }

      const identityData = {
        _id: req.body._id,
        student: req.body.student,
        identityImages: images
      };

      await Identity.findByIdAndUpdate(identityData._id, identityData);

      res.status(200).send({ success: true });
    } catch (e) {
      const err = 'Something bad happen, ' + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

module.exports = router;
