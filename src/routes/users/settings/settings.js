// /users/settings
require('dotenv').config();
const router = require('express').Router();
const { pool } = require('../../../config/postgresConfig');
const { normalMsg } = require('../../../helpers/returnMsg');
const { authenticateToken } = require('../../../middlewares');

// Get appearance and privacy settings 
// for the current user
router.get('/', authenticateToken, async (req, res, next) => {
  const user = req.user;
  try {
    const data = await pool.query(
      'SELECT dark_theme AS "darkTheme", font_size AS "fontSize", reader_theme AS "readerTheme", notifications, profile_visibility AS "profileVisibility", show_goals AS "showGoals", show_books as "showBooks", show_numbers AS "showNumbers" FROM users WHERE id = $1',
      [user.id]
    );
    return res.status(200).json(data.rows[0]);
  } catch (err) {
    res.status(500);
    next(err);
  }
});

// Delete current user profile
router.delete('/delete', authenticateToken, async (req, res, next) => {
  const user = req.user;
  try {
    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [user.id]
    );
    return normalMsg(res, 200, true, 'OK');
  } catch (err) {
    res.status(500);
    next(err);
  }
});

// Edit appearance settings
router.put('/appearance', authenticateToken, async (req, res, next) => {
  const user = req.user;
  const { darkTheme, fontSize, readerTheme } = req.body

  try {
    await pool.query(
      'UPDATE users SET dark_theme = $1, font_size = $2, reader_theme = $3 WHERE id = $4',
      [darkTheme, fontSize, readerTheme, user.id]
    );
    return normalMsg(res, 200, true, 'OK');
  } catch (err) {
    res.status(500);
    next(err);
  }
});

// Edit privacy settings
router.put('/privacy', authenticateToken, async (req, res, next) => {
  const user = req.user;
  const { 
    notifications, 
    profileVisibility, 
    showGoals, 
    showBooks, 
    showNumbers
  } = req.body

  try {
    await pool.query(
      'UPDATE users SET notifications = $1, profile_visibility = $2, show_goals = $3, show_books = $4, show_numbers = $5 WHERE id = $6',
      [notifications, profileVisibility, showGoals, showBooks, showNumbers, user.id]
    );
    return normalMsg(res, 200, true, 'OK');
  } catch (err) {
    res.status(500);
    next(err);
  }
});

// Get privacy preferences for a user
router.get('/profile/:userId', 
  authenticateToken, 
  async (req, res, next) => {
    const userId = req.params.userId;

    try {
      const data = await pool.query(
        'SELECT profile_visibility AS "profileVisibility", show_goals AS "showGoals", show_books as "showBooks", show_numbers AS "showNumbers" FROM users WHERE id = $1',
        [userId]
      );
      return res.status(200).json(data.rows[0]);
    } catch (err) {
      res.status(500);
      next(err);
    }
  }
);

module.exports = router;