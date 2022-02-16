// /pg/books/{book_id}
require('dotenv').config();
const router = require('express').Router({mergeParams: true});
const { pool } = require('../../../config/postgresConfig');
const { normalMsg } = require('../../../helpers/returnMsg');
const { authenticateToken } = require('../../../middlewares');
const { uploadBookMulter } = require('../../../config/multerConfig');
const { uploadImage }  =require('../../../helpers/uploadImage');
const path = require('path');

// Get information about one specific book
router.get('/', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const user = req.user;

  try {
    const data = await pool.query(
      'SELECT id, user_id AS "userId", title, authors, description, cover_image AS "coverImage", tags, publisher, pub_date AS "pubDate", language, rating, file, file_name AS "fileName", series FROM books WHERE id = $1 AND user_id = $2;',
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

// Edit the book last location
router.put('/edit/location', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const user = req.user;
  const { location } = req.body;

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
      'UPDATE books SET location = $1 WHERE id = $2;',
      [location, bookId]
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