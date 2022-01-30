// /mongo/users
require('dotenv').config();
const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../../../models/User.js');
const { PROFILE_IMAGE } = require('../../../helpers/constants');
const { returnMsg } = require('../../../helpers/returnMsg');

// Register a user (MongoDB)
router.post('/register', async (req, res, next) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;

  // Check request body is ok
  if (!email || !password || !confirmPassword || !firstName || !lastName) {
    return returnMsg(res, 400, false, "Bad Request");
  }

  // Check passwords match
  if (password !== confirmPassword) {
    return returnMsg(res, 400, false, "Passwords don't match");
  }

  // Check email exists Mongodb
  try {
    const user = await User.findOne({email: email});

    if (user !== null) {
      return returnMsg(res, 400, false, "Email already exists");
    }
    
  } catch (error) {
    res.status(400);
    next(error);
  }

  // Hash password
  await bcrypt.hash(password, 5, async (err, hash) => {
    if (err) {
      res.status(500);
      next(err)
    } 

    // Add user Mongodb
    const user = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hash,
      profileImage: PROFILE_IMAGE
    });

    try {
      await user.save();
      return returnMsg(res, 201, true, "OK");
    } catch (error) {
      res.status(500);
      next(error);
    }
  });
});

module.exports = router;