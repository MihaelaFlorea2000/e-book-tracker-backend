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
      'SELECT id, start_date AS "startDate", end_date AS "endDate", rating, notes FROM reads WHERE book_id = $1 AND user_id = $2 ORDER BY end_date DESC;',
      [bookId, user.id]
    );

    const readsData = [];

    for (const row of data.rows) {
      const sessionsData = await pool.query(
        'SELECT COUNT(id)::INTEGER AS "sessionsNum", SUM(time) AS "totalTime" FROM sessions WHERE read_id = $1',
        [row.id]
      )

      const read = row;
      read.time = sessionsData.rows[0].totalTime;
      read.sessions = sessionsData.rows[0].sessionsNum;

      readsData.push(read);
    }

    res.status(200).json(readsData);
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Add reads to a book
router.post('/', authenticateToken, async (req, res, next) => {
  const user = req.user;
  const bookId = req.params.bookId;
  const { startDate, endDate, rating, notes } = req.body;

  // Format time and dates properly
  const startTimestamp = getTimestamp(startDate);
  const endTimestamp = getTimestamp(endDate);

  try {
    const data = await pool.query(
      `INSERT INTO reads (book_id, user_id, start_date, end_date, rating, notes) VALUES ($1, $2, TIMESTAMP \'${startTimestamp}\', TIMESTAMP \'${endTimestamp}\', $3, $4) RETURNING *`,
      [
        bookId,
        user.id,
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