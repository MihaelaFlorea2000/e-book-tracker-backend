// /mongo/books/{book_id}
require('dotenv').config();
const router = require('express').Router({mergeParams: true});
const { normalMsg } = require('../../../helpers/returnMsg');
const { authenticateToken } = require('../../../middlewares');
const { uploadBookMulter } = require('../../../config/multerConfig');
const Book = require('../../../models/Book.js');

// Get information about the current user
router.post('/edit/upload', 
  authenticateToken, 
  uploadBookMulter,
  async (req, res, next) => {
    const bookId = req.params.bookId;
    const { file, coverImage } = req.files;

    try {

      // Add paths to db
      if (file) {
        await Book.findOneAndUpdate({
          _id: bookId
        }, {
          $set: {file: file[0].path}
        });
      }

      if (coverImage) {
        await Book.findOneAndUpdate({
          _id: bookId
        }, {
          $set: {coverImage: coverImage[0].path}
        });
      }
      return normalMsg(res, 200, true, "OK");
    } catch (err) {
      res.status(500);
      next(err)
    }
  }
);

module.exports = router;