// /mongo/books
require('dotenv').config();
const router = require('express').Router();
const Book = require('../../../models/Book.js');
const { authenticateToken } = require('../../../middlewares');

const bookIdRouter = require('./bookId');

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
  const { title, authors, description, tags, publisher, pubDate, language, rating, fileName, series } = req.body;

  // Add user Mongodb
  const book = new Book({
    userId: user.id,
    title: title, 
    authors: authors === undefined ? [] : authors, 
    description: description,  
    tags: tags === undefined ? [] : tags, 
    publisher: publisher, 
    pubDate: pubDate, 
    language: language, 
    rating: rating === undefined ? 0 : rating,
    fileName: fileName, 
    series: series
  });

  try {
    const data = await book.save();
    return res.status(200).json(data)
  } catch (err) {
    res.status(500);
    next(err);
  }
});

router.use('/:bookId', bookIdRouter)

module.exports = router;