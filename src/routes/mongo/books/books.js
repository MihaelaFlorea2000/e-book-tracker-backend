// /pg/books
require('dotenv').config();
const router = require('express').Router();
const Book = require('../../../models/Book.js');
const { normalMsg } = require('../../../helpers/returnMsg');
const { authenticateToken } = require('../../../helpers/authenticate');
const { COVER_IMAGE } = require('../../../helpers/constants');

router.get('/', authenticateToken, async (req, res, next) => {
  const user = req.user;

  try {
    const bookData = await Book.find({userId: user.id}, {__v: 0});
    return res.status(200).json(bookData);
  } catch (err) {
    res.status(500);
    next(err);
  }
});

// Get information about the current user
router.post('/', authenticateToken, async (req, res, next) => {
  const user = req.user;
  const { title, authors, description, coverImage, tags, publisher, pubDate, language, rating, file, fileName, series } = req.body;

  // Add user Mongodb
  const book = new Book({
    userId: user.id,
    title: title, 
    authors: authors === undefined ? [] : authors, 
    description: description, 
    coverImage: coverImage === undefined ? COVER_IMAGE : coverImage, 
    tags: tags === undefined ? [] : tags, 
    publisher: publisher, 
    pubDate: pubDate, 
    language: language, 
    rating: rating === undefined ? 0 : rating, 
    file: file, 
    fileName: fileName, 
    series: series
  });

  try {
    await book.save();
    return normalMsg(res, 201, true, "OK");
  } catch (err) {
    res.status(500);
    next(err);
  }
});

module.exports = router;