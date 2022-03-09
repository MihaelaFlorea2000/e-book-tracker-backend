// /pg/users/profile
require('dotenv').config();
const router = require('express').Router();
const { pool } = require('../../../../config/postgresConfig');
const { normalMsg } = require('../../../../helpers/returnMsg');
const { authenticateToken } = require('../../../../middlewares');

// Get information about the current user
router.get('/', authenticateToken, async (req, res, next) => {
  const user = req.user;
  try {
    const data = await pool.query(
      'SELECT dark_theme AS "darkTheme" FROM users WHERE id = $1',
      [user.id]
    );
    return res.status(200).json(data.rows[0]);
  } catch (err) {
    res.status(500);
    next(err);
  }
});

// Get information about the current user
router.put('/theme', authenticateToken, async (req, res, next) => {
  const user = req.user;
  const { darkTheme } = req.body

  try {
    await pool.query(
      'UPDATE users SET dark_theme = $1 WHERE id = $2',
      [darkTheme, user.id]
    );
    return normalMsg(res, 200, true, 'OK')
  } catch (err) {
    res.status(500);
    next(err);
  }
});

module.exports = router;