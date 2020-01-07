const multer = require('multer');
const express = require('express');

const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');

const awsRemoveFile = require('../uploads/awsRemoveFile');
const awsUploadFile = require('../uploads/awsUploadFile');

const Student = require('../model/student.model');
const Branch = require('../model/branch.model');
const Receipt = require('../model/receipt.model');
const User = require('../model/user.model');

const user_image = require('../shared/user.image');

const sendMail = require('../mail/mail');

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
  '/addStudent',
  auth,
  adminAuth,
  multer({ storage: storage }).single('image'),
  async (req, res) => {
    const file = req.file;
    try {
      const data = req.body;

      const user = new User({
        email: data.email,
        password: data.phone,
        userType: 'student'
      });

      await user.save();

      let image;

      if (file !== undefined) {
        let imagePath = file.path;
        let imageName = file.filename.split;

        const cloudeDirectory = 'students';

        try {
          const upload_responce = await awsUploadFile(
            imagePath,
            imageName,
            cloudeDirectory
          );

          const upload_res = upload_responce.upload_res;

          if (upload_res) {
            const img_data = {
              image_name: upload_res.key.split('/')[1],
              secure_url: upload_res.Location,
              public_id: upload_res.key,
              created_at: Date.now(),
              width: upload_res.size.width,
              height: upload_res.size.height
            };
            image = img_data;
          }
        } catch (e) {
          image = user_image;
        }
      } else {
        image = user_image;
      }

      const studentData = {
        name: data.name,
        birthDate: data.birthDate,
        bloodGroup: data.bloodGroup,
        workPlace: data.workPlace,
        firstGuardianName: data.firstGuardianName,
        firstGuardianRelation: data.firstGuardianRelation,
        secondGuardianName: data.secondGuardianName,
        secondGuardianRelation: data.secondGuardianRelation,
        medicalHistory: data.medicalHistory,
        phone: data.phone,
        email: data.email,
        address: data.address,
        branch: data.branch,
        batch: data.batch,
        batchType: data.batchType,
        status: data.status,
        image: image
      };

      const student = new Student(studentData);

      await student.save();

      const mail = {
        from: process.env.ADMIN_MAIL,
        to: student.email,
        subject: 'Welcome to Dancing Soul',
        text: '',
        html: `
          <b>Welcomm <em>${student.name}</em></b><br>
          <p>Your Dancing soul Login Credentials are</p>
          User id : ${student.email} <br>
          Password : ${student.phone}<br>
          <p><a href=''>Click here to Login with Dancing Soul</a></p>
          `
      };

      await sendMail(mail);

      res.status(200).send(user);
    } catch (e) {
      let err = 'Something bad happend, ';
      if (e.code == 11000) {
        err = 'User alredy register, ';
      }
      err = err + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

router.post('/getStudents', auth, adminAuth, async (req, res) => {
  try {
    const students = await Student.find({
      branch: req.body.branch,
      batch: req.body.batch,
      batchType: req.body.weekType
    });
    if (!students) {
      throw new Error('No Student Found');
    }
    res.status(200).send(students);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getStudent', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.body._id);
    if (!student) {
      throw new Error('No Student Found');
    }

    const branch = await Branch.findById(student.branch);
    if (!branch) {
      throw new Error('No Branch Found');
    }

    const batch = branch.batch.find(curBatch => curBatch._id == student.batch);

    const studentMetaData = {
      branch: branch.branch,
      batch
    };

    res.status(200).send({ student, studentMetaData });
  } catch (e) {
    let err = 'Something bad happen, ';
    if (e.name === 'CastError') {
      err = 'No Student Found, ';
    }
    err = err + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getStudentForReceipt', auth, adminAuth, async (req, res) => {
  try {
    const student = await Student.findById(req.body._id);
    if (!student) {
      throw new Error('No Student Found');
    }

    const branch = await Branch.findById(student.branch);
    if (!branch) {
      throw new Error('No Branch Found');
    }

    const batch = branch.batch.find(batch => batch._id == student.batch);

    const studentMetaData = {
      branch: branch.branch,
      batch
    };

    res.status(200).send({ student, studentMetaData });
  } catch (e) {
    let err = 'Something bad happen, ';
    if (e.name === 'CastError') {
      err = 'No Student Found, ';
    }
    err = err + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getStudentForEditing', auth, adminAuth, async (req, res) => {
  try {
    const student = await Student.findById(req.body._id);
    if (!student) {
      throw new Error('No Student Found');
    }

    const branch = await Branch.find();
    if (branch.length < 1) {
      throw new Error('No Branch Found');
    }

    res.status(200).send({ student, branch });
  } catch (e) {
    let err = 'Something bad happen, ';
    if (e.name === 'CastError') {
      err = 'No Student Found, ';
    }
    err = err + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post(
  '/editStudent',
  auth,
  adminAuth,
  multer({ storage: storage }).single('image'),
  async (req, res) => {
    const file = req.file;
    try {
      const data = req.body;

      const student = await Student.findById(data._id);

      if (!student) {
        throw new Error('No student Found');
      }

      const user = await User.findOne({ email: student.email });

      if (!(user.email == data.email)) {
        await User.findByIdAndUpdate(user._id, { email: data.email });
      }
      let image;

      image = student.image;

      const img_pub_id = student.image.public_id;

      if (file !== undefined) {
        let imagePath = file.path;
        let imageName = file.filename.split('.')[0];

        const cloudeDirectory = 'faculties';

        try {
          const upload_responce = await awsUploadFile(
            imagePath,
            imageName,
            cloudeDirectory
          );

          const upload_res = upload_responce.upload_res;

          if (upload_res) {
            const img_data = {
              image_name: upload_res.key.split('/')[1],
              secure_url: upload_res.Location,
              public_id: upload_res.key,
              created_at: Date.now(),
              width: upload_res.size.width,
              height: upload_res.size.height
            };
            image = img_data;
          }

          if (img_pub_id !== user_image.public_id) {
            await awsRemoveFile(img_pub_id);
          }
        } catch (e) {}
      }

      const studentData = {
        _id: data._id,
        name: data.name,
        birthDate: data.birthDate,
        bloodGroup: data.bloodGroup,
        workPlace: data.workPlace,
        firstGuardianName: data.firstGuardianName,
        firstGuardianRelation: data.firstGuardianRelation,
        secondGuardianName: data.secondGuardianName,
        secondGuardianRelation: data.secondGuardianRelation,
        medicalHistory: data.medicalHistory,
        phone: data.phone,
        email: data.email,
        address: data.address,
        branch: data.branch,
        batch: data.batch,
        batchType: data.batchType,
        status: data.status,
        image: image
      };

      await Student.findByIdAndUpdate(data._id, studentData);

      res.status(200).send({ success: true });
    } catch (e) {
      const err = 'Something bad happen, ' + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

router.post('/changeStudentStatus', auth, adminAuth, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.body._id, {
      status: req.body.status
    });
    if (!student) {
      throw new Error('Student Updation Failed');
    }

    if (req.body.status === '0') {
      const user = await User.findOne({ email: student.email });
      if (!user) {
        return;
      }
      await User.findByIdAndRemove(user._id);
      const mail = {
        from: process.env.ADMIN_MAIL,
        to: student.email,
        subject: 'Thanks for using Dancing Soul',
        text: '',
        html: `
          <b>Thanks</b> ${student.name} <br>
          You are no longer part of dancing Soul Acadamy, Thanks for Supporting Us..
          `
      };
      await sendMail(mail);
    } else if (req.body.status === '1') {
      const user = new User({
        email: student.email,
        password: student.phone,
        userType: 'student'
      });
      await user.save();
      const mail = {
        from: process.env.ADMIN_MAIL,
        to: student.email,
        subject: 'Welcome back ' + student.name + ' to Dancing Soul Acadamy',
        text: '',
        html: `
          <b>Welcomm Back <em>${student.name}</em></b><br>
          <p>Your Dancing soul Login Credentials are</p>
          User id : ${student.email} <br>
          Password : ${student.phone}<br>
          <p><a href=''>Click here to Login with Dancing Soul</a></p>
        `
      };
      await sendMail(mail);
    }
    res.status(200).send({ succes: true });
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deleteStudent', auth, adminAuth, async (req, res) => {
  try {
    // Authenticate user with password
    let user = await User.findByCredentials(req.user.email, req.body.password);
    if (!user) {
      throw new Error('Wrong Password, Please enter correct password');
    }
    // Find Student
    const student = await Student.findById(req.body._id);
    if (!student) {
      throw new Error('No student found');
    }
    // Delete Cloude Image
    if (student.image.public_id !== user_image.public_id) {
      await awsRemoveFile(student.image.public_id);
    }
    // Delete Student
    await Student.findByIdAndRemove(student._id);

    // Delete Student Receipts
    await Receipt.deleteMany({ student: req.body._id });
    // Find student in user
    user = await User.findOne({ email: student.email });
    // Delete student in user
    await User.findByIdAndRemove(user._id);
    // Send Responce
    res.status(200).send({ success: true });
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
