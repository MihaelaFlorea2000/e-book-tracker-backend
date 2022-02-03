// /pg
require('dotenv').config();
const router = require('express').Router();
const usersRouter = require('./users/users');
const booksRouter = require('./books/books');

router.use('/books', booksRouter);
router.use('/users', usersRouter);

module.exports = router;