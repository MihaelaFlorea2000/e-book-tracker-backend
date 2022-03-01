// /pg/reads/{book_id}
require('dotenv').config();
const router = require('express').Router();
const { pool } = require('../../../config/postgresConfig');
const { authenticateToken } = require('../../../middlewares');

// Get the numbers
router.get('/numbers', authenticateToken, async (req, res, next) => {
  const user = req.user;

  try {
    const booksRead = await pool.query(
      'SELECT COUNT(id) AS count FROM books WHERE user_id = $1 AND read = true',
      [user.id]
    )

    const booksCurrRead = await pool.query(
      'SELECT COUNT(id) AS count FROM books WHERE user_id = $1 AND current_read IS NOT NULL',
      [user.id]
    )

    const authorsRead = await pool.query(
      'SELECT authors FROM books WHERE user_id = $1 AND read = true',
      [user.id]
    )

    let authorsReadCount = 0;

    authorsRead.rows.forEach((row) => {
      authorsReadCount += row.authors.length
    })

    const longestSession = await pool.query(
      'SELECT MAX(sessions.time) AS max FROM sessions INNER JOIN reads ON sessions.read_id = reads.id INNER JOIN books ON reads.book_id = books.id WHERE books.user_id = $1 AND books.read = true;',
      [user.id]
    )

    const avgTimePerSession = await pool.query(
      'SELECT AVG(sessions.time) AS avg FROM sessions INNER JOIN reads ON sessions.read_id = reads.id INNER JOIN books ON reads.book_id = books.id WHERE books.user_id = $1 AND books.read = true;',
      [user.id]
    )

    const bestDay = await pool.query(
      'SELECT DATE(sessions.start_date) AS day, SUM(sessions.time) FROM sessions INNER JOIN reads ON sessions.read_id = reads.id INNER JOIN books ON reads.book_id = books.id WHERE books.user_id = $1 AND books.read = true GROUP BY day',
      [user.id]
    )

    const numbers = {
      booksRead: parseInt(booksRead.rows[0].count),
      booksCurrRead: parseInt(booksCurrRead.rows[0].count),
      authorsReadCount: authorsReadCount,
      longestSession: longestSession.rows[0].max,
      avgTimePerSession: avgTimePerSession.rows[0].avg,
      bestDay: bestDay.rows[0].day
    }

    res.status(200).json(numbers);
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Get the percentage of books read
router.get('/percentage', authenticateToken, async (req, res, next) => {
  const user = req.user;

  try {
    const booksRead = await pool.query(
      'SELECT COUNT(id) AS count FROM books WHERE user_id = $1 AND read = true',
      [user.id]
    )

    const totalBooks = await pool.query(
      'SELECT COUNT(id) AS count FROM books WHERE user_id = $1',
      [user.id]
    )

    const percentage = {
      value: booksRead.rows[0].count / totalBooks.rows[0].count
    }

    res.status(200).json(percentage);
  } catch (err) {
    res.status(500);
    next(err)
  }
})


module.exports = router;