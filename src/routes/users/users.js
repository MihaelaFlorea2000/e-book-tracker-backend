// /users
require('dotenv').config();
const router = require('express').Router();
const bcrypt = require('bcrypt');
const { pool } = require('../../config/postgresConfig');
const { PROFILE_IMAGE } = require('../../helpers/constants');
const { returnMsg } = require('../../helpers/returnMsg');

/** Register a new user (PostgreSQL)
 * {
 *    "email": string,
 *    "password": string,
 *    "confrimPassword": string,
 *    "firstName": string,
 *    "lastName": string
 * } 
*/
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

  // Check email exists
  try {
    const data = await pool.query(
      'SELECT id FROM users WHERE users.email = $1', 
      [email]);
    
    if (data.rows.length !== 0) {
      return returnMsg(res, 400, false, "Email already exists");
    } 

  } catch (err) {
    res.status(500);
    next(err);
  }

  // Hash password
  await bcrypt.hash(password, 5, async (err, hash) => {
    if (err) {
      res.status(500);
      next(err)
    } 

    // Add user to db
    try {
      await pool.query(
          'INSERT INTO users (email, password, first_name, last_name, profile_image) VALUES ($1, $2, $3, $4, $5)', 
          [email, hash, firstName, lastName, PROFILE_IMAGE]);
      
      return returnMsg(res, 201, true, "OK");
    } catch (err) {
      res.status(500);
      next(err)
    }
  });
});

module.exports = router;