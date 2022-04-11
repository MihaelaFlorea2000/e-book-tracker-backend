// /highlights/{book_id}
require('dotenv').config();
const router = require('express').Router({ mergeParams: true });
const { pool } = require('../../config/postgresConfig');
const { authenticateToken } = require('../../middlewares');

const highlighIdRouter = require('./highlightId');

// Get all highlihgts for this book
router.get('/', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;

  try {
    const data = await pool.query(
      'SELECT id, book_id AS "bookId", text, cfi_range AS "cfiRange", color, note FROM highlights WHERE book_id = $1',
      [bookId]
    );
    return res.status(200).json(data.rows);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

// Add a new book highlight
router.post('/', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const user = req.user;
  const { text, cfiRange, color, note } = req.body;

  try {
    const data = await pool.query(
      'INSERT INTO highlights (book_id, text, cfi_range, color, note) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        bookId,
        text,
        cfiRange,
        color,
        note
      ]
    );

    // Check if we got highlight badge
    // Total highlghts added
    const highlightsAddedData = await pool.query(
      'SELECT COUNT(DISTINCT highlights.id)::INTEGER AS count FROM highlights INNER JOIN books ON highlights.book_id = books.id WHERE user_id = $1;',
      [user.id]
    )

    const highlightsAdded = highlightsAddedData.rows[0].count;

    // Biggest highlight badge we have so far
    const badges = await pool.query(
      "SELECT MAX(badges.number)::INTEGER AS max FROM badge_notifications INNER JOIN badges ON badge_notifications.badge_id = badges.id WHERE badge_notifications.receiver_id = $1 AND badges.type='highlights';",
      [user.id]
    );

    const maxBadge = badges.rows[0].max ? badges.rows[0].max : 0;

    if (highlightsAdded === 10 && maxBadge === 0) {
      // First highlight badge
      await pool.query(
        "INSERT INTO badge_notifications (badge_id, receiver_id, date) values (2, $1, CURRENT_TIMESTAMP)",
        [user.id]
      );

    } else if (highlightsAdded === 50 && maxBadge === 10) {
      // Second highlight badge
      await pool.query(
        "INSERT INTO badge_notifications (badge_id, receiver_id, date) values (5, $1, CURRENT_TIMESTAMP)",
        [user.id]
      );

    } else if (highlightsAdded === 100 && maxBadge === 50) {
      // Second highlight badge
      await pool.query(
        "INSERT INTO badge_notifications (badge_id, receiver_id, date) values (8, $1, CURRENT_TIMESTAMP)",
        [user.id]
      );
    }

    return res.status(200).json(data.rows[0]);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

// Routes for a specific highlight
router.use('/:highlightId', highlighIdRouter);

module.exports = router;