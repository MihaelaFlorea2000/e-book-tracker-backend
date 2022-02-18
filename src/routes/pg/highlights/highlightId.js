// /pg/highlights/{book_id}/{highlight_id}
require('dotenv').config();
const router = require('express').Router({ mergeParams: true });
const { pool } = require('../../../config/postgresConfig');
const { normalMsg } = require('../../../helpers/returnMsg');
const { authenticateToken } = require('../../../middlewares');

// Get information about one specific highlight
router.get('/', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const highlightId = req.params.highlightId;

  try {
    const data = await pool.query(
      'SELECT id, book_id AS "bookId", text, cfi_range AS cfiRange, color, note FROM highlights WHERE id = $1 AND book_id = $2;',
      [highlightId, bookId]
    )
    res.status(200).json(data.rows[0]);
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Delete a highlight
router.delete('/', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const highlightId = req.params.highlightId;

  try {
    
    await pool.query(
      'DELETE FROM highlights WHERE id = $1 AND book_id = $2',
      [highlightId, bookId]
    )

    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Edit a highlight
router.put('/', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const highlightId = req.params.highlightId;
  const { text, cfiRange, color, note } = req.body;

  try {
  
    await pool.query(
      'UPDATE highlights SET text = $1, cfi_range = $2, color = $3, note = $4 WHERE id = $5 AND book_id = $6;',
      [text, cfiRange, color, note, highlightId, bookId]
    );

    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})

module.exports = router;