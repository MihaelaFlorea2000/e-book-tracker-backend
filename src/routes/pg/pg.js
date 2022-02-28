// /pg
require('dotenv').config();
const router = require('express').Router();
const usersRouter = require('./users/users');
const booksRouter = require('./books/books');
const highlightsRouter = require('./highlights/highlights');
const readsRouter = require('./reads/reads');


router.use('/books', booksRouter);
router.use('/users', usersRouter);
router.use('/highlights/:bookId', highlightsRouter);
router.use('/reads/:bookId', readsRouter)

module.exports = router;