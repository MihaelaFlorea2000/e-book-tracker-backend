// /pg/books/{book_id}
require('dotenv').config();
const router = require('express').Router({mergeParams: true});
const { pool } = require('../../../config/postgresConfig');
const { normalMsg } = require('../../../helpers/returnMsg');
const { authenticateToken } = require('../../../middlewares');
const { uploadBookMulter } = require('../../../config/multerConfig');

// Get information about the current user
router.post('/edit/upload', 
  authenticateToken, 
  uploadBookMulter,
  async (req, res, next) => {
    const bookId = req.params.bookId;
    const { file, coverImage } = req.files;

    if (!file) {
      return normalMsg(res, 400, false, "File is required");
    }

    try {
      // Add paths to db
      if (file) {
        await pool.query(
          'UPDATE books SET file = $1 WHERE id = $2;',
          [file.path, bookId]
        )
      }

      if (coverImage) {
        await pool.query(
          'UPDATE books SET cover_image = $1 WHERE id = $2;',
          [coverImage.path, bookId]
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