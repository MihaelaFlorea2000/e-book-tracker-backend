// /pg/highlights/:bookId
require('dotenv').config();
const router = require('express').Router({ mergeParams: true });
const { pool } = require('../../../config/postgresConfig');
const { authenticateToken } = require('../../../middlewares');

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
    return res.status(200).json(data.rows[0]);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

router.use('/:highlightId', highlighIdRouter);

module.exports = router;