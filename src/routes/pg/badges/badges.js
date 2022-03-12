// /pg/badges
require('dotenv').config();
const router = require('express').Router();
const { pool } = require('../../../config/postgresConfig');
const { authenticateToken } = require('../../../middlewares');

// Get all books for current user
router.get('/', authenticateToken, async (req, res, next) => {
  const user = req.user;

  try {
    const badgeData = await pool.query(
      'SELECT badges.id, badges.type, badges.number, CASE WHEN bn.receiver_id = $1 THEN true ELSE false END AS done FROM badges LEFT JOIN (SELECT * FROM badge_notifications WHERE receiver_id = $1) bn ON badges.id = bn.badge_id;',
      [user.id]
    );

    return res.status(200).json(badgeData.rows);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

module.exports = router;