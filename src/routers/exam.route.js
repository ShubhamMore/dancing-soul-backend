const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const Exam = require('../model/exam.model');

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
  '/addExam',
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

        const cloudeDirectory = 'exams';

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

      const examData = {
        title: data.title,
        body: data.body,
        file: fileData
      };

      const exam = new Exam(examData);
      exam.file = fileData;

      await exam.save();
      res.status(200).send(exam);
    } catch (e) {
      const err = 'Something bad happen, ' + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

router.post('/getExams', async (req, res) => {
  try {
    const exams = await Exam.find();
    if (!exams) {
      throw new Error('No exams found');
    }
    res.status(200).send(exams);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getExam', async (req, res) => {
  try {
    const exam = await Exam.findById(req.body._id);
    if (!exam) {
      throw new Error('No exams found');
    }
    res.status(200).send(exam);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post(
  '/editExam',
  auth,
  multer({ storage: storage }).single('image'),
  async (req, res) => {
    const file = req.file;
    try {
      const data = req.body;

      const exam = await Exam.findById(data._id);

      if (!exam) {
        throw new Error('No Exam Found');
      }

      let fileData = exam.file;
      let file_pub_id;
      if (fileData) {
        file_pub_id = exam.file.public_id;
      }
      if (file !== undefined) {
        let filePath = file.path;
        let fileName = file.filename;

        const cloudeDirectory = 'exams';

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

      const examData = {
        _id: data._id,
        title: data.title,
        body: data.body,
        file: fileData
      };

      await Exam.findByIdAndUpdate(data._id, examData);

      res.status(200).send(exam);
    } catch (e) {
      const err = 'Something bad happen, ' + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

router.post('/deleteExam', auth, async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.body._id);
    if (!exam) {
      throw new Error('No exams found');
    }
    if (exam.file.file_name !== undefined) {
      await awsRemoveFile(exam.file.public_id);
    }
    res.status(200).send(exam);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deleteExamFile', auth, async (req, res) => {
  const public_id = req.body.public_id;
  try {
    const exam = await Exam.findByIdAndUpdate(req.body._id, {
      file: null
    });
    if (!exam) {
      throw new Error('No exam Found');
    }

    const responce = await awsRemoveFile(public_id);

    res.status(200).send(responce);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
