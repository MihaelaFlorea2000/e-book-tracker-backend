// /mongo
require('dotenv').config();
const router = require('express').Router();
const usersRouter = require('./users/users');
const booksRouter = require('./books/books');

router.use('/users', usersRouter);
router.use('/books', booksRouter);

module.exports = router;