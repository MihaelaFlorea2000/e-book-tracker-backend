const { pool } = require('../config/postgresConfig');

const areFriends = async (userId, friendId) => {
  if (userId === friendId) return true;

  const data = await pool.query(
    'SELECT * FROM friends WHERE user_id = $1 AND friend_id = $2',
    [userId, friendId]
  );

  if (data.rows.length === 0) {
    return false;
  }

  return true
}

const haveRequest = async (userId, friendId) => {
  const data = await pool.query(
    'SELECT * FROM friend_requests WHERE (sender_id = $1 AND receiver_id = $2) OR (receiver_id = $1 AND sender_id = $2)',
    [userId, friendId]
  );

  if (data.rows.length === 0) {
    return false;
  }

  return true
}


module.exports = { areFriends, haveRequest }