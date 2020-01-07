const express = require('express');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');
const Receipt = require('../model/receipt.model');
const Student = require('../model/student.model');
const Branch = require('../model/branch.model');
const router = new express.Router();

router.post('/addReceipt', auth, adminAuth, async (req, res) => {
  const receipt = new Receipt(req.body);
  try {
    await receipt.save();
    res.status(200).send({ success: true });
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getReceipts', auth, async (req, res) => {
  try {
    const receipts = await Receipt.find({ student: req.body.student });
    if (!receipts) {
      throw new Error('No Receipt found');
    }
    res.status(200).send(receipts);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getReceipt', auth, async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.body._id);
    if (!receipt) {
      throw new Error('No Receipt found');
    }

    const student = await Student.findById(receipt.student);
    if (!student) {
      throw new Error('No Student found');
    }

    const branch = await Branch.findById(student.branch);
    if (!branch) {
      throw new Error('No Branch found');
    }

    const batch = branch.batch.find(curBatch => curBatch._id == student.batch);

    const receiptMetaData = {
      name: student.name,
      branch: branch.branch,
      batch: batch.batch,
      batchType: student.batchType
    };
    res.status(200).send({ receipt, receiptMetaData });
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/editReceipt', auth, adminAuth, async (req, res) => {
  try {
    const receipt = await Receipt.findByIdAndUpdate(req.body._id, req.data);
    if (!receipt) {
      throw new Error('No Receipt found');
    }
    res.status(200).send(receipt);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deleteReceipt', auth, adminAuth, async (req, res) => {
  try {
    const receipt = await Receipt.findByIdAndDelete(req.body._id);
    if (!receipt) {
      throw new Error('No Receipt found');
    }
    res.status(200).send({ success: true });
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
