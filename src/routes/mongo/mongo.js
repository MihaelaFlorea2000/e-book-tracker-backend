// /mongo
require('dotenv').config();
const router = require('express').Router();
const userRouter = require('./users/users');

router.use('/users', userRouter);

module.exports = router;