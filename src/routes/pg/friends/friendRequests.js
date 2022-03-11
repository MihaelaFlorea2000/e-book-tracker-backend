// /pg/friends/requests
require('dotenv').config();
const router = require('express').Router();
const { pool } = require('../../../config/postgresConfig');
const { normalMsg } = require('../../../helpers/returnMsg');
const { authenticateToken } = require('../../../middlewares');
const { areFriends, haveSentRequest, haveReceivedRequest } = require('../../../helpers/friendCheck');

// Get the incoming friend requests of the current user
router.get('/', authenticateToken, async (req, res) => {
  const user = req.user;

  try {
    const data = await pool.query(
      'SELECT FR.id AS "requestId", FR.date as "requestDate", users.id AS "senderId", users.first_name AS "firstName", users.last_name AS "last_name", users.profile_image AS "profileImage" FROM friend_requests FR INNER JOIN users ON FR.sender_id = users.Id WHERE FR.receiver_id = $1 ORDER BY "requestDate" DESC',
      [user.id]
    );
    return res.status(200).json(data.rows);

  } catch (e) {
    res.status(500);
    next(err)
  }
});

// Send a friend request
router.post('/', authenticateToken, async (req, res) => {
  const user = req.user;
  const { receiverId } = req.body;

  try {
    const friends = await areFriends(user.id, receiverId);
    const sentRequest = await haveSentRequest(user.id, receiverId);
    const receivedRequest = await haveReceivedRequest(user.id, receiverId);

    if (friends || sentRequest || receivedRequest) {
      return normalMsg(res, 400, false, 'Already friends')
    }

    const data = await pool.query(
      "INSERT INTO friend_requests (sender_id, receiver_id, date) VALUES ($1, $2, current_timestamp) RETURNING *",
      [user.id, receiverId]);
    
    return res.status(200).json(data.rows);

  } catch (e) {
    return res.status(500).json({ status: false, message: e.message });
  }
});

// Unsend a friend requests
router.delete('/:userId', authenticateToken, async (req, res) => {
  const userId = req.params.userId;

  try {
    await pool.query(
      'DELETE FROM friend_requests WHERE receiver_id = $1 AND sender_id = $2',
      [userId, user.id]);

    return normalMsg(res, 200, true, 'OK')

  } catch (e) {
    return res.status(500).json({ status: false, message: e.message });
  }
});

// Answer a friend requests
router.post('/:requestId', authenticateToken, async (req, res) => {
  const user = req.user;
  const requestId = req.params.requestId;
  const { accept } = req.body;

  try {
    const requestData = await pool.query(
      "SELECT * FROM friend_requests WHERE id = $1",
      [requestId]);

    const friendId = requestData.rows[0].sender_id;
    let message = "";
    
    if (accept) {
      await pool.query(
        'INSERT INTO friends (user_id, friend_id) VALUES ($1, $2) RETURNING *',
        [user.id, friendId]);
      
      await pool.query(
        'INSERT INTO friends (user_id, friend_id) VALUES ($1, $2) RETURNING *',
        [friendId, user.id]);
      
        message = "Accepted"
    
    } else {
      message = "Rejected"
    }

    await pool.query(
      'DELETE FROM friend_requests WHERE id = $1',
      [requestId]);

    return normalMsg(res, 200, true, message);

  } catch (e) {
    res.status(500);
    next(err)
  }
});


module.exports = router;