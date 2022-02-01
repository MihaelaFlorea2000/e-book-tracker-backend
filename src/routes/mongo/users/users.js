// /mongo/users
require('dotenv').config();
const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../../../models/User.js');
const { PROFILE_IMAGE } = require('../../../helpers/constants');
const { normalMsg, loginMsg } = require('../../../helpers/returnMsg');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../../../helpers/authenticate');

// Register a user (MongoDB)
router.post('/register', async (req, res, next) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;

  // Check request body is ok
  if (!email || !password || !confirmPassword || !firstName || !lastName) {
    return normalMsg(res, 400, false, "Bad Request");
  }

  // Check passwords match
  if (password !== confirmPassword) {
    return normalMsg(res, 400, false, "Passwords don't match");
  }

  // Check email exists Mongodb
  try {
    const user = await User.findOne({email: email});

    if (user !== null) {
      return normalMsg(res, 400, false, "Email already exists");
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
      return normalMsg(res, 201, true, "OK");
    } catch (error) {
      res.status(500);
      next(error);
    }
  });
});

// Login a user (MongoDB)
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return loginMsg(res, 400, false, "Bad Request", false);
  }

  // Get hash from db
  let id = "";
  let hash = "";
  
  try {
    const user = await User.findOne({email: email});

    if (user === null) {
      return loginMsg(res, 400, false, "Invalid credentials", false);
    }

    hash = user.password;
    id = user.id;
  } catch (err) {
    res.status(500);
    next(err);
  }

  // Check password
  bcrypt.compare(password, hash, function(err, result) {
    if (result) {
      const token = jwt.sign(
        { id: id }, 
        process.env.TOKEN_SECRET
      );
      return loginMsg(res, 200, true, "OK", token);
    } else {
      return loginMsg(res, 401, false, "Invalid credentials", false);
    }
  });
});

// Get information about the current user (MongoDB)
router.get('/currentUser', authenticateToken, async (req, res, next) => {
  const user = req.user;
  try {
    const userData = await User.findById(user.id);
    return res.status(200).json(userData);
  } catch (err) {
    return res.status(500).json(err.message);
  }
});

module.exports = router;