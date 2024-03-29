// /books
require('dotenv').config();
const router = require('express').Router();
const { pool } = require('../../config/postgresConfig');
const { START_LOCATION } = require('../../helpers/constants');
const { authenticateToken } = require('../../middlewares');

const bookIdRouter = require('./bookId');

// Get all books for current user
router.get('/', authenticateToken, async (req, res, next) => {
  const user = req.user;

  try {
    const bookData = await pool.query(
      'SELECT id, user_id AS "userId", title, authors, description, cover_image AS "coverImage", publisher, pub_date AS "pubDate", language, rating, file, file_name AS "fileName", series, location, last_opened AS "lastOpened" FROM books WHERE user_id = $1 ORDER BY last_opened DESC', 
      [user.id]
    );

    // Get Tags for each book
    let data = [];

    for (const row of bookData.rows) {
      const book = row;
      book.tags = [];

      const tags = await pool.query(
        'SELECT name FROM tags WHERE book_id = $1',
        [row.id]
      );

      tags.rows.forEach(tag => {
        book.tags.push(tag.name);
      });

      data.push(book);
    }

    return res.status(200).json(data);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

// Add a new book
router.post('/', authenticateToken, async (req, res, next) => {
  const user = req.user;
  const { 
    title, 
    authors, 
    description, 
    tags, 
    publisher, 
    pubDate, 
    language, 
    rating, 
    fileName, 
    series 
  } = req.body;

  try {
    const data = await pool.query(
      `INSERT INTO books (user_id, title, authors, description, publisher, pub_date, language, rating, file_name, series, location, last_opened) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, to_timestamp(${Date.now()} / 1000.0)) RETURNING *`, 
      [
        user.id, 
        title, 
        authors, 
        description, 
        publisher, 
        pubDate, 
        language, 
        rating,
        fileName, 
        series,
        START_LOCATION
      ]
    );

    // Insert tags
    for (const tag of tags) {
      await pool.query(
        `INSERT INTO tags (book_id, name) VALUES ($1, $2)`,
        [
          data.rows[0].id,
          tag
        ]
      );
    }

    return res.status(200).json(data.rows[0]);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

// Route for requests for a specific book
router.use('/:bookId', bookIdRouter);

module.exports = router;