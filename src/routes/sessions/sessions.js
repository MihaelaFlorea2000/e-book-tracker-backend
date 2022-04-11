// /sessions/{read_id}
require('dotenv').config();
const router = require('express').Router({ mergeParams: true });
const { pool } = require('../../config/postgresConfig');
const { authenticateToken } = require('../../middlewares');
const { getTimestamp, getInterval } = require('../../helpers/prepareRead');

const sessionId = require('./sessionId');

// Get the sessions of a read
router.get('/', authenticateToken, async (req, res, next) => {
  const readId = req.params.readId;

  try {
    const data = await pool.query(
      'SELECT id, start_date AS "startDate", time FROM sessions WHERE read_id = $1 ORDER BY start_date ASC;',
      [readId]
    )

    res.status(200).json(data.rows);
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Add sessions to a read
router.post('/', authenticateToken, async (req, res, next) => {
  const readId = req.params.readId;
  const { startDate, time } = req.body;

  // Format time and dates properly
  const intervalString = getInterval(time);
  const startTimestamp = getTimestamp(startDate);

  try {
    const data = await pool.query(
      `INSERT INTO sessions (read_id, start_date, time) VALUES ($1, TIMESTAMP \'${startTimestamp}\', INTERVAL \'${intervalString}\') RETURNING *`,
      [
        readId
      ]
    );
    return res.status(200).json(data.rows[0]);
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Routes for a specific session
router.use('/:sessionId', sessionId)

module.exports = router;