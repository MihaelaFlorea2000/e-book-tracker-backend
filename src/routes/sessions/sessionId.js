// /sessions/{read_id}/{session_id}
require('dotenv').config();
const router = require('express').Router({ mergeParams: true });
const { pool } = require('../../config/postgresConfig');
const { normalMsg } = require('../../helpers/returnMsg');
const { authenticateToken } = require('../../middlewares');
const { getTimestamp, getInterval } = require('../../helpers/prepareRead');

// Delete a session
router.delete('/', authenticateToken, async (req, res, next) => {
  const { sessionId, readId } = req.params;
  const user = req.user;

  try {
  
    // Delete read from db
    await pool.query(
      'DELETE FROM sessions WHERE id = $1 AND read_id = $2',
      [sessionId, readId]
    )
    
    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Edit a session
router.put('/', authenticateToken, async (req, res, next) => {
  const { sessionId, readId } = req.params;
  const { startDate, time } = req.body;

  // Format time and dates properly
  const intervalString = getInterval(time);
  const startTimestamp = getTimestamp(startDate);

  try {

    await pool.query(
      `UPDATE sessions SET start_date = TIMESTAMP \'${startTimestamp}\', time = INTERVAL \'${intervalString}\' WHERE id = $1 AND read_id = $2;`,
      [sessionId, readId]
    );

    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})

module.exports = router;