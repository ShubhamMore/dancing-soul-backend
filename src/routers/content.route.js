const express = require('express');
const Content = require('../model/content.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');
const router = new express.Router();

router.post('/saveContent', auth, adminAuth, async (req, res) => {
  try {
    const newContent = {
      content: req.body.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
      careerContent: req.body.careerContent.replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
    };
    let content = await Content.findById(req.body._id);
    if (content) {
      await Content.findByIdAndUpdate(req.body._id, newContent);
    } else {
      content = new Content(newContent);
      await content.save();
    }
    res.status(200).send({ success: true });
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getContent', async (req, res) => {
  try {
    const content = await Content.findOne();
    res.status(200).send(content);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
