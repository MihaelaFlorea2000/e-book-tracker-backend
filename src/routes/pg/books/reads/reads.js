// /pg/books/{book_id}/reads
require('dotenv').config();
const router = require('express').Router({ mergeParams: true });
const { pool } = require('../../../../config/postgresConfig');
const { authenticateToken } = require('../../../../middlewares');

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

    console.log(currentReadId, currentReadIndex );

    if (currentReadId > 0 && currentReadIndex > 0) {
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

module.exports = router;