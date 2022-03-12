// /pg/notifications
require('dotenv').config();
const router = require('express').Router();
const { pool } = require('../../../config/postgresConfig');
const { authenticateToken } = require('../../../middlewares');

// Get all books for current user
router.get('/', authenticateToken, async (req, res, next) => {
  const user = req.user;

  try {
    const notificationData = await pool.query(
      '(SELECT sender_id AS "senderId", receiver_id AS "receiverId", date, type, profile_image AS image, first_name AS "firstName", last_name AS "lastName" FROM friend_requests INNER JOIN users ON friend_requests.sender_id = users.id WHERE receiver_id = $1) UNION (SELECT badge_id AS "senderId", receiver_id AS "receiverId", date, type, null AS image, null AS "firstName", null AS "lastName" FROM badge_notifications WHERE receiver_id = $1) ORDER BY date DESC',
      [user.id]
    );

    return res.status(200).json(notificationData.rows);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

module.exports = router;