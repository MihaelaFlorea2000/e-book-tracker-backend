// /search
require('dotenv').config();
const router = require('express').Router();
const { pool } = require('../../config/postgresConfig');
const { authenticateToken } = require('../../middlewares');

// Search for users or books
router.get('/', authenticateToken, async (req, res) => {
  const query = req.query.query;
  const user = req.user;

  try {
    const searchResults = {}

    const userData = await pool.query(
      'SELECT id, first_name AS "firstName", last_name AS "lastName", profile_image AS "profileImage" FROM users WHERE lower(first_name) LIKE lower($1) OR lower(last_name) LIKE lower($1);',
      [`%${query}%`]);

    searchResults.users = userData.rows;

    /**
     * This post helped with searching based on author
     * https://stackoverflow.com/questions/7222106/postgres-query-of-an-array-using-like
     */
    const bookData = await pool.query(
      'SELECT id, title, cover_image AS "coverImage" FROM books WHERE(( 0 < ( SELECT COUNT(*) FROM unnest(authors) AS author WHERE lower(author) LIKE lower($1))) OR lower(title) LIKE lower($1)) AND user_id = $2;',
      [`%${query}%`, user.id]);

    searchResults.books = bookData.rows;

    return res.status(200).json(searchResults);
  } catch (err) {
    return res.status(500).json(err.message);
  }
});

module.exports = router;
