const express = require('express');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');

const Enquiry = require('../model/enquiry.model');
const Branch = require('../model/branch.model');
const Faculty = require('../model/faculty.model');
const Student = require('../model/student.model');

const router = new express.Router();

router.post('/getDashboardData', auth, adminAuth, async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ seen: '0' });
    if (!enquiries) {
      throw new Error('No Enquiry Found');
    }

    dashboardData = {};
    let data = null;
    data = await Branch.find({ status: '0' });
    dashboardData.deactivateBranch = data.length;
    data = await Branch.find({ status: '1' });
    dashboardData.activateBranch = data.length;
    data = await Faculty.find({ status: '0' });
    dashboardData.deactivateFaculty = data.length;
    data = await Faculty.find({ status: '1' });
    dashboardData.activateFaculty = data.length;
    data = await Student.find({ status: '0' });
    dashboardData.deactivateStudent = data.length;
    data = await Student.find({ status: '1' });
    dashboardData.activateStudent = data.length;

    res.status(200).send({ unseenEnquiries: enquiries.length, dashboardData });
  } catch (e) {
    const err = 'Something bad happen, ' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
