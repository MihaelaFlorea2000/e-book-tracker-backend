// /pg/books/{book_id}/reads/{read_id}
require('dotenv').config();
const router = require('express').Router({ mergeParams: true });
const { pool } = require('../../../../config/postgresConfig');
const { normalMsg } = require('../../../../helpers/returnMsg');
const { authenticateToken } = require('../../../../middlewares');

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

module.exports = router;