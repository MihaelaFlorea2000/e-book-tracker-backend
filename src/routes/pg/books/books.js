// /pg/books
require('dotenv').config();
const router = require('express').Router();
const { pool } = require('../../../config/postgresConfig');
const { normalMsg } = require('../../../helpers/returnMsg');
const { authenticateToken } = require('../../../helpers/authenticate');

router.get('/', authenticateToken, async (req, res, next) => {
  const user = req.user;

  try {
    const data = await pool.query(
      'SELECT id, user_id AS "userId", title, authors, description, cover_image AS "coverImage", tags, publisher, pub_date AS "pubDate", language, rating, file, file_name AS "fileName", series FROM books WHERE user_id = $1', 
      [user.id]
    );
    return res.status(200).json(data.rows);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

// Get information about the current user
router.post('/', authenticateToken, async (req, res, next) => {
  const user = req.user;
  const { title, authors, description, coverImage, tags, publisher, pubDate, language, rating, file, fileName, series } = req.body;

  const book = {
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
  };

  try {
    await pool.query(
      'INSERT INTO books (user_id, title, authors, description, cover_image, tags, publisher, pub_date, language, rating, file, file_name, series) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', 
      [
        user.id, 
        book.title, 
        book.authors, 
        book.description, 
        book.coverImage, 
        book.tags, 
        book.publisher, 
        book.pubDate, 
        book.language, 
        book.rating, 
        book.file, 
        book.fileName, 
        book.series
      ]
    );
    return normalMsg(res, 201, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
});

module.exports = router;