const multer = require('multer');
const express = require('express');

const auth = require('../middleware/auth');

const storage = require('../image-upload/multerConfig');

const cloudinaryRemoveImage = require('../image-upload/cloudinaryRemoveImage');
const cloudinaryUploadImages = require('../image-upload/cloudinaryUploadImages');

const Student = require('../model/student.model');
const Receipt = require('../model/receipt.model');
const Branch = require('../model/branch.model');
const User = require('../model/user.model');

const no_image = require('../shared/no_image.image');
const user_image = require('../shared/user.image');

const findIndexByKey = require('../shared/findIndex');

const router = new express.Router();

router.post(
  '/addBranch',
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
          imageNames.push(file[i].filename.split('.')[0]);
        }

        const cloudeDirectory = 'branches';

        try {
          const upload_responce = await cloudinaryUploadImages(
            imagePaths,
            imageNames,
            cloudeDirectory
          );

          const upload_res = upload_responce.upload_res;
          const upload_res_len = upload_res.length;

          if (upload_res_len > 0) {
            for (let i = 0; i < upload_res_len; i++) {
              const img_data = {
                image_name:
                  upload_res[i].original_filename + '.' + upload_res[i].format,
                secure_url: upload_res[i].secure_url,
                public_id: upload_res[i].public_id,
                created_at: upload_res[i].created_at,
                width: upload_res[i].width,
                height: upload_res[i].height
              };
              images.push(img_data);
            }
          }
        } catch (e) {
          images.push(no_image);
        }
      } else {
        images.push(no_image);
      }

      const data = req.body;
      const branchData = {
        branch: data.branch,
        city: data.city,
        address: data.address,
        email: data.email,
        phone: data.phone,
        description: data.description,
        images: images,
        batch: JSON.parse(data.batch),
        status: data.status
      };
      const branch = new Branch(branchData);

      await branch.save();

      res.status(200).send({ success: true });
    } catch (e) {
      const err = 'Something bad happen, ' + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

router.post('/getBranches', auth, async (req, res) => {
  try {
    const branches = await Branch.find();
    if (!branches) {
      throw new Error('No Branch Found');
    }

    res.status(200).send(branches);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getActivateBranches', async (req, res) => {
  try {
    const branch = await Branch.find({ status: '1' });
    if (!branch) {
      throw new Error('No Branch Found');
    }

    res.status(200).send(branch);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getBranch', auth, async (req, res) => {
  try {
    const branch = await Branch.findById(req.body._id);
    if (!branch) {
      throw new Error('No Branch Found');
    }

    res.status(200).send(branch);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post(
  '/editBranch',
  auth,
  multer({ storage: storage }).array('image'),
  async (req, res) => {
    let images = new Array();
    const file = req.files;
    try {
      const branch = await Branch.findById(req.body._id);

      if (!branch) {
        throw new Error('No Branch Found');
      }

      images = branch.images;

      if (file.length > 0) {
        let imagePaths = new Array();
        let imageNames = new Array();
        for (let i = 0; i < file.length; i++) {
          imagePaths.push(file[i].path);
          imageNames.push(file[i].filename.split('.')[0]);
        }

        const cloudeDirectory = 'branches';

        try {
          const upload_responce = await cloudinaryUploadImages(
            imagePaths,
            imageNames,
            cloudeDirectory
          );

          const upload_res = upload_responce.upload_res;
          const upload_res_len = upload_res.length;

          if (upload_res_len > 0) {
            for (let i = 0; i < upload_res_len; i++) {
              const img_data = {
                image_name:
                  upload_res[i].original_filename + '.' + upload_res[i].format,
                secure_url: upload_res[i].secure_url,
                public_id: upload_res[i].public_id,
                created_at: upload_res[i].created_at,
                width: upload_res[i].width,
                height: upload_res[i].height
              };
              images.push(img_data);
            }
          }

          const index = findIndexByKey(images, 'public_id', no_image.public_id);

          if (index !== null) {
            images.splice(index, 1);
          }
        } catch (e) {}
      }

      const data = req.body;
      const branchData = {
        _id: data._id,
        branch: data.branch,
        city: data.city,
        address: data.address,
        email: data.email,
        phone: data.phone,
        description: data.description,
        images: images,
        batch: JSON.parse(data.batch),
        status: data.status
      };

      await Branch.findByIdAndUpdate(data._id, branchData);

      res.status(200).send({ success: true });
    } catch (e) {
      const err = 'Something bad happen, ' + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

router.post('/changeBranchStatus', auth, async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.body._id, {
      status: req.body.status
    });
    if (!branch) {
      throw new Error('No Branch Found');
    }

    const data = {
      success: true
    };
    res.status(200).send(data);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deleteBranchImage', auth, async (req, res) => {
  const public_id = req.body.public_id;
  try {
    const branch = await Branch.findById(req.body._id);
    if (!branch) {
      throw new Error('No Branch Found');
    }
    const images = branch.images;

    const responce = await cloudinaryRemoveImage(public_id);

    if (responce.result == 'ok') {
      const index = findIndexByKey(images, 'public_id', public_id);
      if (index !== null) {
        images.splice(index, 1);
      }
    }

    if (images.length === 0) {
      images.push(no_image);
    }

    branch.images = images;

    await Branch.findByIdAndUpdate(req.body._id, branch);

    res.status(200).send(responce);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deleteBranch', auth, async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.user.email,
      req.body.password
    );
    if (!user) {
      throw new Error('Wrong Password, Please enter correct password');
    }

    const branch = await Branch.findById(req.body._id);

    if (!branch) {
      throw new Error('No Branch Found');
    }

    const students = await Student.find({ branch: branch._id });

    const stu_len = students.length;

    for (let i = 0; i < stu_len; i++) {
      if (students[i].image.public_id !== user_image.public_id) {
        await addresscloudinaryRemoveImage(students[i].image.public_id);
      }

      await Receipt.deleteMany({ student: students[i]._id });

      await Student.findByIdAndDelete(students[i]._id);

      await User.findOneAndDelete({ email: students[i].email });
    }

    const images = branch.images;

    const index = findIndexByKey(images, 'public_id', no_image.public_id);
    if (index !== null) {
      for (let i = 0; i < images.length; i++) {
        await cloudinaryRemoveImage(images[i].public_id);
      }
    }

    await Branch.findByIdAndDelete(req.body._id);

    res.status(200).send({ success: true });
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
