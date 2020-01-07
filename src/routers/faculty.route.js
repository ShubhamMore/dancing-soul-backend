const multer = require('multer');
const express = require('express');

const auth = require('../middleware/auth');

const awsRemoveFile = require('../uploads/awsRemoveFile');
const awsUploadFile = require('../uploads/awsUploadFile');

const Faculty = require('../model/faculty.model');
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
  '/addFaculty',
  auth,
  multer({ storage: storage }).single('image'),
  async (req, res) => {
    const file = req.file;
    try {
      const data = req.body;

      const user = new User({
        email: data.email,
        password: data.phone,
        userType: 'faculty'
      });

      await user.save();

      let image;

      if (file !== undefined) {
        let imagePath = file.path;
        let imageName = file.filename;

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
        } catch (e) {
          image = user_image;
        }
      } else {
        image = user_image;
      }

      const facultyData = {
        name: data.name,
        birthDate: data.birthDate,
        description: data.description,
        image: image,
        email: data.email,
        phone: data.phone,
        status: data.status
      };

      const faculty = new Faculty(facultyData);

      await faculty.save();

      const mail = {
        from: process.env.ADMIN_MAIL,
        to: faculty.email,
        subject: 'Welcome to Dancing Soul',
        text: '',
        html: `
          <b>Welcomm <em>${faculty.name}</em></b><br>
          <p>Your Dancing soul Login Credentials are</p>
          User id : ${faculty.email} <br>
          Password : ${faculty.phone}<br>
          <p><a href=''>Click here to Login with Dancing Soul</a></p>
        `
      };

      await sendMail(mail);

      res.status(200).send(user);
    } catch (e) {
      let err = 'Something bad happend, ';
      if (e.code == 11000) {
        err = 'User alredy register';
      }
      err = err + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

router.post('/getFaculties', auth, async (req, res) => {
  try {
    const faculties = await Faculty.find();
    if (!faculties) {
      throw new Error('No Faculty found');
    }
    res.status(200).send(faculties);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getActivateFaculties', async (req, res) => {
  try {
    const faculties = await Faculty.find({ status: '1' });
    if (!faculties) {
      throw new Error('No Faculty found');
    }
    res.status(200).send(faculties);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getFaculty', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.body._id);
    if (!faculty) {
      throw new Error('No Facultys found');
    }
    res.status(200).send(faculty);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/changeFacultyStatus', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.body._id, {
      status: req.body.status
    });
    if (!faculty) {
      throw new Error('No Faculty found');
    }

    if (req.body.status === '0') {
      const user = await User.findOne({ email: faculty.email });
      if (!user) {
        return;
      }
      await User.findByIdAndRemove(user._id);
      const mail = {
        from: process.env.ADMIN_MAIL,
        to: faculty.email,
        subject: 'Thanks for being part of Dancing Soul',
        text: '',
        html: `
          <b>Thanks</b> faculty.name <br>
          You are no longer part of dancing Soul Acadamy, Thanks for Supporting Us..
        `
      };
      await sendMail(mail);
    } else if (req.body.status === '1') {
      const user = new User({
        email: faculty.email,
        password: faculty.phone,
        userType: 'faculty'
      });
      await user.save();
      const mail = {
        from: process.env.ADMIN_MAIL,
        to: faculty.email,
        subject: 'Welcome to Dancing Soul',
        text: '',
        html: `
          <b>Welcomm Back <em>${faculty.name}</em></b><br>
          <p>Your Dancing soul Login Credentials are</p>
          User id : ${faculty.email} <br>
          Password : ${faculty.phone}<br>
          <p><a href=''>Click here to Login with Dancing Soul</a></p>
        `
      };
      await sendMail(mail);
    }

    res.status(200).send(faculty);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post(
  '/editFaculty',
  auth,
  multer({ storage: storage }).single('image'),
  async (req, res) => {
    const file = req.file;
    try {
      const data = req.body;

      const faculty = await Faculty.findById(data._id);

      if (!faculty) {
        throw new Error('No Faculty Found');
      }

      const user = await User.findOne({ email: faculty.email });

      if (!(user.email == data.email)) {
        await User.findByIdAndUpdate(user._id, { email: data.email });
      }

      let image;

      image = faculty.image;

      const img_pub_id = faculty.image.public_id;

      if (file !== undefined) {
        let imagePath = file.path;
        let imageName = file.filename;

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

      const facultyData = {
        _id: data._id,
        name: data.name,
        birthDate: data.birthDate,
        description: data.description,
        image: image,
        email: data.email,
        phone: data.phone,
        status: data.status
      };

      await Faculty.findByIdAndUpdate(data._id, facultyData);

      res.status(200).send({ success: true });
    } catch (e) {
      const err = 'Something bad happen, ' + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

router.post('/deleteFaculty', auth, async (req, res) => {
  try {
    let user = await User.findByCredentials(req.user.email, req.body.password);
    if (!user) {
      throw new Error('Wrong Password, Please enter correct password');
    }

    const faculty = await Faculty.findById(req.body._id);
    if (!faculty) {
      throw new Error('No faculty found');
    }

    if (faculty.image.public_id !== user_image.public_id) {
      await awsRemoveFile(faculty.image.public_id);
    }

    await Faculty.findByIdAndDelete(req.body._id);

    user = await User.findOne({ email: faculty.email });

    await User.findByIdAndDelete(user._id);

    res.status(200).send({ success: true });
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
