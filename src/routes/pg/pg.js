// /pg
require('dotenv').config();
const router = require('express').Router();
const usersRouter = require('./users/users');
const booksRouter = require('./books/books');
const highlightsRouter = require('./highlights/highlights');


router.use('/books', booksRouter);
router.use('/users', usersRouter);
router.use('/highlights/:bookId', highlightsRouter)

module.exports = router;