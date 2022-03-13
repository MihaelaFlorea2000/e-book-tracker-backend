// /pg/friends
require('dotenv').config();
const router = require('express').Router();
const { pool } = require('../../../config/postgresConfig');
const { normalMsg } = require('../../../helpers/returnMsg');
const { authenticateToken } = require('../../../middlewares');
const requestsRouter = require('./friendRequests')

// Get the friends of the current user
router.get('/', authenticateToken, async (req, res, next) => {
  const user = req.user;

  try {
    const data = await pool.query(
      'SELECT users.id, users.first_name AS "firstName", users.last_name AS "lastName", users.profile_image AS "profileImage" FROM friends LEFT JOIN users ON friends.friend_id = users.id WHERE friends.user_id= $1',
      [user.id]
    );
    return res.status(200).json(data.rows);

  } catch (err) {
    res.status(500);
    next(err)
  }
});

router.use('/requests', requestsRouter);

// Get the friends of the current user
router.get('/mutual/:userId', authenticateToken, async (req, res, next) => {
  const user = req.user;
  const userId = req.params.userId

  try {
    const data = await pool.query(
      'SELECT id, first_name AS "firstName", last_name AS "lastName", profile_image AS "profileImage" FROM ((SELECT friend_id FROM friends WHERE user_id = $1) INTERSECT (SELECT friend_id FROM friends WHERE user_id = $2)) AS mutual INNER JOIN users ON friend_id = users.id;',
      [user.id, userId]
    );
    return res.status(200).json(data.rows);

  } catch (err) {
    res.status(500);
    next(err)
  }
});

// Unfriend a user
router.delete('/:friendId', authenticateToken, async (req, res, next) => {
  const user = req.user;
  const friendId = req.params.friendId;

  console.log(friendId, user.id);

  try {

    await pool.query(
      'DELETE FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (friend_id = $1 AND user_id = $2)',
      [user.id, friendId]
    );
    return normalMsg(res, 200, true, 'OK')

  } catch (err) {
    res.status(500);
    next(err)
  }
});


module.exports = router;