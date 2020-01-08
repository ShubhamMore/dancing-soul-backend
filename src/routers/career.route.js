const express = require('express');
const multer = require('multer');

const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');
const Career = require('../model/career.model');

const awsUploadFiles = require('../uploads/awsUploadFiles');

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
  '/addCareer',
  multer({ storage: storage }).array('file'),
  async (req, res) => {
    const file = req.files;
    let coverLatter = null;
    let resume = null;
    try {
      if (file.length > 0) {
        let filePaths = new Array();
        let fileNames = new Array();
        for (let i = 0; i < file.length; i++) {
          filePaths.push(file[i].path);
          fileNames.push(file[i].filename);
        }

        const cloudeDirectory = 'careers';

        try {
          const upload_responce = await awsUploadFiles(
            filePaths,
            fileNames,
            cloudeDirectory
          );

          const upload_res = upload_responce.upload_res;
          const upload_res_len = upload_res.length;

          if (upload_res_len > 0) {
            for (let i = 0; i < upload_res_len; i++) {
              const file_data = {
                file_name: upload_res[i].key.split('/')[1],
                secure_url: upload_res[i].Location,
                public_id: upload_res[i].key,
                created_at: Date.now(),
                width: upload_res[i].size.width,
                height: upload_res[i].size.height
              };
              if (file_data.file_name.includes('coverlatter')) {
                coverLatter = file_data;
              } else {
                resume = file_data;
              }
            }
          }
        } catch (e) {}
      }

      const data = req.body;
      const careerData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        description: data.description,
        coverLatter: coverLatter,
        resume: resume
      };
      const career = new Career(careerData);

      await career.save();

      res.status(200).send({ success: true });
    } catch (e) {
      const err = 'Something bad happen, ' + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

router.post('/getCareers', auth, adminAuth, async (req, res) => {
  try {
    const careers = await Career.find();

    res.status(200).send(careers);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getCareer', auth, adminAuth, async (req, res) => {
  try {
    const career = await Career.findById(req.body._id);
    if (!career) {
      throw new Error('No Career found');
    }
    res.status(200).send(career);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
