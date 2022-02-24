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
      'SELECT id, start_date AS "startDate", end_date AS "endDate", rating, notes, time, sessions FROM reads WHERE book_id = $1 AND user_id = $2;',
      [bookId, user.id]
    )
    res.status(200).json(data.rows);
  } catch (err) {
    res.status(500);
    next(err)
  }
})

module.exports = router;