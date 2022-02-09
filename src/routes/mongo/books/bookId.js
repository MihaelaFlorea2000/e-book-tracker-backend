// /mongo/books/{book_id}
require('dotenv').config();
const router = require('express').Router({mergeParams: true});
const { normalMsg } = require('../../../helpers/returnMsg');
const { authenticateToken } = require('../../../middlewares');
const { uploadBookMulter } = require('../../../config/multerConfig');
const Book = require('../../../models/Book.js');
const { uploadImage }  =require('../../../helpers/uploadImage');
const path = require('path');

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

        await Book.findOneAndUpdate({
          _id: bookId
        }, {
          $set: {file: fileUrl}
        });
      }

      if (coverImage) {
        const toUpload = coverImage[0]
        toUpload.originalname = `coverImage${path.extname(coverImage[0].originalname)}`;
        const coverImageUrl = await uploadImage(toUpload, user.id, bookId);

        await Book.findOneAndUpdate({
          _id: bookId
        }, {
          $set: {coverImage: coverImageUrl}
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