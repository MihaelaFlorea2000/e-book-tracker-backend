const { pool } = require('../config/postgresConfig');

// Check if two users are friends
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

// Check if a user sent a friend 
// request to another user
const haveSentRequest = async (userId, friendId) => {
  const data = await pool.query(
    'SELECT * FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2',
    [userId, friendId]
  );

  if (data.rows.length === 0) {
    return false;
  }

  return true
}

// Check if a user has received a friend 
// request from another user
const haveReceivedRequest = async (userId, friendId) => {
  const data = await pool.query(
    'SELECT * FROM friend_requests WHERE receiver_id = $1 AND sender_id = $2',
    [userId, friendId]
  );

  if (data.rows.length === 0) {
    return false;
  }

  return true
}

module.exports = { 
  areFriends, 
  haveSentRequest, 
  haveReceivedRequest
}