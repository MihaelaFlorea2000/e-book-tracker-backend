// /pg/reads/{book_id}/{read_id}
require('dotenv').config();
const router = require('express').Router({ mergeParams: true });
const { pool } = require('../../../config/postgresConfig');
const { normalMsg } = require('../../../helpers/returnMsg');
const { authenticateToken } = require('../../../middlewares');
const { getTimestamp, getInterval } = require('../../../helpers/prepareRead');
const { START_LOCATION } = require('../../../helpers/constants');

// Delete one specific read
router.delete('/', authenticateToken, async (req, res, next) => {
  const {bookId, readId} = req.params;
  const user = req.user;

  try {
    const bookData = await pool.query(
      'SELECT current_read AS "currentRead" FROM books WHERE id = $1 AND user_id = $2;',
      [bookId, user.id]
    )

    // If deleting the current read
    if (readId === bookData.rows[0].currentRead) {
      // Set book currentRead to null
      await pool.query(
        'UPDATE books SET current_read = null WHERE id = $1',
        [bookId]
      )

      // Delete sessions corresponding to the read
      await pool.query(
        'DELETE FROM sessions WHERE read_id = $1',
        [readId]
      )
    }
    // Delete read from db
    await pool.query(
      'DELETE FROM reads WHERE id = $1',
      [readId]
    )

    // Check how many reads the book has left
    const remainingReads = await pool.query(
      'SELECT COUNT(id) AS "numReads" from reads WHERE book_id = $1',
      [bookId]
    )

    // If book has no other reads
    if (parseInt(remainingReads.rows[0].numReads) === 0) {
      await pool.query(
        'UPDATE books SET read = false WHERE id = $1',
        [bookId]
      )
    }
    
    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Edit a read
router.put('/', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const readId = req.params.readId;
  const { startDate, endDate, time, sessions, rating, notes } = req.body;

  // Format time and dates properly
  const intervalString = getInterval(time);
  const startTimestamp = getTimestamp(startDate);
  const endTimestamp = getTimestamp(endDate);

  try {

    await pool.query(
      `UPDATE reads SET start_date = TIMESTAMP \'${startTimestamp}\', end_date = TIMESTAMP \'${endTimestamp}\', time = INTERVAL \'${intervalString}\', sessions = $1, rating = $2, notes = $3 WHERE id = $4 AND book_id = $5;`,
      [sessions, rating, notes, readId, bookId]
    );

    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Edit a read to mark as finished
router.post('/finished', authenticateToken, async (req, res, next) => {
  const user = req.user;
  const bookId = req.params.bookId;
  const readId = req.params.readId;
  const { startDate, endDate, time, sessions, rating, notes } = req.body;

  // Format time and dates properly
  const intervalString = getInterval(time);
  const startTimestamp = getTimestamp(startDate);
  const endTimestamp = getTimestamp(endDate);

  try {
    const book = await pool.query(
      'SELECT id, user_id AS "userId", current_read AS "currentRead" FROM books WHERE id = $1',
      [bookId]
    )

    if (book.rows.length === 0) {
      return res.status(404).json({ status: false, message: "Not Found" });
    }

    if (book.rows[0].userId !== user.id) {
      return res.status(401).json({ status: false, message: "Unauthorised" });
    }

    const currentRead = book.rows[0].currentRead

    // Book is not currently being read anymore
    await pool.query(
      'UPDATE books SET current_read = null, read = true, location = $1 WHERE id = $2',
      [START_LOCATION, bookId]
    )

    // Update read
    await pool.query(
      `UPDATE reads SET start_date = TIMESTAMP \'${startTimestamp}\', end_date = TIMESTAMP \'${endTimestamp}\', time = INTERVAL \'${intervalString}\', sessions = $1, rating = $2, notes = $3 WHERE id = $4 AND book_id = $5;`,
      [sessions, rating, notes, readId, bookId]
    );

    // Delete sessions
    await pool.query(
      'DELETE FROM sessions WHERE read_id = $1',
      [currentRead]
    )

    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})

module.exports = router;