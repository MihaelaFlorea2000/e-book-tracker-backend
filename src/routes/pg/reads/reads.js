// /pg/reads/{book_id}
require('dotenv').config();
const router = require('express').Router({ mergeParams: true });
const { pool } = require('../../../config/postgresConfig');
const { authenticateToken } = require('../../../middlewares');
const { getTimestamp, getInterval } = require('../../../helpers/prepareRead');

const readIdRouter = require('./readId');

// Get the reads of a specific book
router.get('/', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const user = req.user;

  try {
    const data = await pool.query(
      'SELECT id, start_date AS "startDate", end_date AS "endDate", rating, notes, time, sessions FROM reads WHERE book_id = $1 AND user_id = $2 ORDER BY end_date DESC;',
      [bookId, user.id]
    )

    let currentReadId = -1;
    let currentReadIndex = -1;

    data.rows.forEach((row, index) => {
      if (!row.endDate) {
        currentReadIndex = index;
        currentReadId = row.id;
      }
    })

    if (currentReadId >= 0 && currentReadIndex >= 0) {
      const sessions = await pool.query(
        'SELECT COUNT(id) AS "sessionsNum", SUM(time) AS "totalTime" FROM sessions WHERE read_id = $1',
        [currentReadId]
      )

      data.rows[currentReadIndex].sessions = parseInt(sessions.rows[0].sessionsNum);
      data.rows[currentReadIndex].time = sessions.rows[0].totalTime;
    }

    res.status(200).json(data.rows);
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Add reads to a book
router.post('/', authenticateToken, async (req, res, next) => {
  const user = req.user;
  const bookId = req.params.bookId;
  const { startDate, endDate, time, sessions, rating, notes } = req.body;

  // Format time and dates properly
  const intervalString = getInterval(time);
  const startTimestamp = getTimestamp(startDate);
  const endTimestamp = getTimestamp(endDate);

  try {
    const data = await pool.query(
      `INSERT INTO reads (book_id, user_id, start_date, end_date, time, sessions, rating, notes) VALUES ($1, $2, TIMESTAMP \'${startTimestamp}\', TIMESTAMP \'${endTimestamp}\', INTERVAL \'${intervalString}\', $3, $4, $5) RETURNING *`,
      [
        bookId,
        user.id,
        sessions,
        rating,
        notes
      ]
    );
    return res.status(200).json(data.rows[0]);
  } catch (err) {
    res.status(500);
    next(err)
  }
})

router.use('/:readId', readIdRouter)

module.exports = router;