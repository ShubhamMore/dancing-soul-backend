const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const adminAuth = async (req, res, next) => {
  try {
    if (req.user.userType !== 'admin') {
      throw new Error();
    }
    next();
  } catch (e) {
    res.status(401).send({ error: 'Invalid Access.' });
  }
};

module.exports = adminAuth;
