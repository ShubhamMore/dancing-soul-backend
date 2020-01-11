const express = require('express');
const Contact = require('../model/contact.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');
const router = new express.Router();

router.post('/saveContact', auth, adminAuth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.body._id);
    if (contact) {
      await Contact.findByIdAndUpdate(req.body._id, req.body);
    } else {
      contact = new Contact(req.body);
      await contact.save();
    }
    res.status(200).send({ success: true });
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getContact', async (req, res) => {
  try {
    const contact = await Contact.findOne();
    res.status(200).send(contact);
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
