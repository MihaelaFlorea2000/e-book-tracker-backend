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
  } catch {
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