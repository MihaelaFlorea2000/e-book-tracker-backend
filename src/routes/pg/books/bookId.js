// /pg/books/{book_id}
require('dotenv').config();
const router = require('express').Router({mergeParams: true});
const { pool } = require('../../../config/postgresConfig');
const { normalMsg } = require('../../../helpers/returnMsg');
const { authenticateToken } = require('../../../middlewares');
const { uploadBookMulter, deleteBook } = require('../../../config/multerConfig');
const { uploadImage }  =require('../../../helpers/uploadImage');
const { START_LOCATION } = require('../../../helpers/constants');
const path = require('path');

const readsRouter = require('./reads/reads');

// Get information about one specific book
router.get('/', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const user = req.user;

  try {
    const data = await pool.query(
      'SELECT id, user_id AS "userId", title, authors, description, cover_image AS "coverImage", tags, publisher, pub_date AS "pubDate", language, rating, file, file_name AS "fileName", series, location, last_opened AS "lastOpened" FROM books WHERE id = $1 AND user_id = $2;',
      [bookId, user.id]
    )
    res.status(200).json(data.rows[0]);
  } catch (err){
    res.status(500);
    next(err)
  }
})

// Delete a book
router.delete('/', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const user = req.user;

  try {
    const data = await pool.query(
      'SELECT id, user_id AS "userId" FROM books WHERE id = $1',
      [bookId]
    )

    if (data.rows.length === 0) {
      return res.status(404).json({ status: false, message: "Not Found" });
    }

    if (data.rows[0].userId !== user.id) {
      return res.status(401).json({ status: false, message: "Unauthorised" });
    }

    // Delete from bucket
    await deleteBook(user.id, bookId);

    // Delete from db
    await pool.query(
      'DELETE FROM books WHERE id = $1',
      [bookId]
    )

    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})

router.use('/reads', readsRouter)
 
// Book was opened
router.post('/opened', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const user = req.user;

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

    let currentRead = book.rows[0].currentRead

    // Check book has not been currently read
    if (currentRead === null) {
      // Create new read
      const newRead = await pool.query(
        'INSERT INTO reads (book_id, user_id, start_date) VALUES($1, $2, current_timestamp) RETURNING id',
        [bookId, user.id]
      );

      // Update book currentRead
      await pool.query(
        'UPDATE books SET current_read = $1 WHERE id = $2;',
        [newRead.rows[0].id, bookId]
      );

      currentRead = newRead.rows[0].id;
    }

    // Update book lastOpened
    await pool.query(
      'UPDATE books SET last_opened = current_timestamp WHERE id = $1;',
      [bookId]
    );

    // Create new session
    await pool.query(
      'INSERT INTO sessions (read_id, start_date) VALUES ($1, current_timestamp)',
      [currentRead]
    );

    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Book was closed
router.post('/closed', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const user = req.user;
  const { location } = req.body;

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

    // Update session time
    await pool.query(
      'UPDATE sessions SET time = AGE(current_timestamp, start_date) WHERE read_id = $1',
      [book.rows[0].currentRead]
    )

    // Update book location
    await pool.query(
      'UPDATE books SET location = $1 WHERE id = $2;',
      [location, bookId]
    );

    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Book was closed
router.post('/finished', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const user = req.user;
  const { rating, notes } = req.body;

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

    // Calculate total read time and number of sessions
    const sessions = await pool.query(
      'SELECT COUNT(id) AS "sessionsNum", SUM(time) AS "totalTime" FROM sessions WHERE read_id = $1',
      [currentRead]
    )

    // Update read
    await pool.query(
      'UPDATE reads SET end_date = current_timestamp, rating = $1, notes = $2, time = $3, sessions = $4 WHERE id = $5',
      [rating, notes, sessions.rows[0].totalTime, sessions.rows[0].sessionsNum, currentRead]
    )

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

// Edit a book
router.put('/edit', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const user = req.user;
  const { title, authors, description, tags, publisher, pubDate, language, rating, series } = req.body;

  try {
    const data = await pool.query(
      'SELECT id, user_id AS "userId" FROM books WHERE id = $1',
      [bookId]
    )

    if (data.rows.length === 0) {
      return res.status(404).json({ status: false, message: "Not Found" });
    }

    if (data.rows[0].userId !== user.id) {
      return res.status(401).json({ status: false, message: "Unauthorised" });
    }

    await pool.query(
      'UPDATE books SET title = $1, authors = $2, description = $3, tags = $4, publisher = $5, pub_date = $6, language = $7, rating = $8, series = $9 WHERE id = $10;',
      [title, authors, description, tags, publisher, pubDate, language, rating, series, bookId]
    );

    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Get information about the current user
router.post('/edit/upload', 
  authenticateToken, 
  uploadBookMulter,
  async (req, res, next) => {
    const user = req.user;
    const bookId = req.params.bookId;
    const { file, coverImage } = req.files;

    try {
      // Add paths to db
      if (file) {
        const toUpload = file[0];
        toUpload.originalname = 'file.epub';
        const fileUrl = await uploadImage(toUpload, user.id, bookId);

        await pool.query(
          'UPDATE books SET file = $1 WHERE id = $2;',
          [fileUrl, bookId]
        )
      }

      if (coverImage) {
        const toUpload = coverImage[0]
        toUpload.originalname = `coverImage${path.extname(coverImage[0].originalname)}`;
        const coverImageUrl = await uploadImage(toUpload, user.id, bookId);
        
        await pool.query(
          'UPDATE books SET cover_image = $1 WHERE id = $2;',
          [coverImageUrl, bookId]
        )
      }
      return normalMsg(res, 200, true, "OK");
    } catch (err) {
      res.status(500);
      next(err)
    }
  }
);

module.exports = router;