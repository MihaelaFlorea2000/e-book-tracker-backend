// /pg/users
require('dotenv').config();
const router = require('express').Router();
const bcrypt = require('bcrypt');
const { pool } = require('../../../config/postgresConfig');
const { PROFILE_IMAGE } = require('../../../helpers/constants');
const { normalMsg, loginMsg } = require('../../../helpers/returnMsg');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../../../middlewares');

const profileRouter = require('./profile/profile');
const settingsRouter = require('./settings/settings');

// Register a new user
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

  // Check email exists Postgresql
  try {
    const data = await pool.query(
      'SELECT id FROM users WHERE users.email = $1', 
      [email]);
    
    if (data.rows.length !== 0) {
      return normalMsg(res, 400, false, "Email already exists");
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

    // Add user to PostgreSQL
    try {
      await pool.query(
          'INSERT INTO users (email, password, first_name, last_name, profile_image) VALUES ($1, $2, $3, $4, $5)', 
          [email, hash, firstName, lastName, PROFILE_IMAGE]);
      
      return normalMsg(res, 201, true, "OK");
    } catch (err) {
      res.status(500);
      next(err)
    }
  });
});

// Login a user
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return loginMsg(res, 400, false, "Bad Request", false);
  }

  // Get hash from db
  let id = "";
  let hash = "";
  
  try {
    const data = await pool.query(
      'SELECT id, email, password FROM users WHERE email = $1', 
      [email]);

    if (data.rows.length === 0) {
      return loginMsg(res, 400, false, "Invalid credentials", false);
    }

    hash = data.rows[0].password;
    id = data.rows[0].id;
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

// Get information about the current user
router.get('/currentUser', authenticateToken, async (req, res, next) => {
  const user = req.user;
  try {
    const data = await pool.query(
      'SELECT id, first_name AS "firstName", last_name AS "lastName", email, profile_image AS "profileImage" FROM users WHERE users.id = $1', 
      [user.id]
    );
    return res.status(200).json(data.rows[0]);
  } catch (err) {
    res.status(500);
    next(err);
  }
});

// Update the goals set by the current user
router.post('/goals', authenticateToken, async (req, res, next) => {
  const user = req.user;
  const { yearly, monthly, dailyHours, dailyMinutes } = req.body;

  try {
    await pool.query(
      'UPDATE users SET yearly = $1, monthly = $2, daily_hours = $3, daily_minutes = $4 WHERE id = $5',
      [yearly, monthly, dailyHours, dailyMinutes, user.id]
    );
    return normalMsg(res, 200, true, 'OK');
  } catch (err) {
    res.status(500);
    next(err);
  }
});

router.use('/profile', profileRouter);
router.use('/settings', settingsRouter);

// Get information about the current user
router.get('/:userId', authenticateToken, async (req, res, next) => {
  const currentUser = req.user;
  const userId = req.params.userId;

  try {
    const data = await pool.query(
      'SELECT id, first_name AS "firstName", last_name AS "lastName", email, profile_image AS "profileImage" FROM users WHERE users.id = $1',
      [userId]
    );
    return res.status(200).json(data.rows[0]);
  } catch (err) {
    res.status(500);
    next(err);
  }
});

router.get('/:userId/books', authenticateToken, async (req, res, next) => {
  const userId = req.params.userId

  try {
    const bookData = await pool.query(
      'SELECT id, user_id AS "userId", title, authors, description, cover_image AS "coverImage", publisher, pub_date AS "pubDate", language, rating, series FROM books WHERE user_id = $1 ORDER BY last_opened DESC LIMIT 10',
      [userId]
    );

    // Get Tags
    let data = [];

    for (const row of bookData.rows) {
      const book = row;
      book.tags = [];

      const tags = await pool.query(
        'SELECT name FROM tags WHERE book_id = $1',
        [row.id]
      );

      tags.rows.forEach(tag => {
        book.tags.push(tag.name);
      });

      data.push(book);
    }

    return res.status(200).json(data);
  } catch (err) {
    res.status(500);
    next(err)
  }
})

module.exports = router;