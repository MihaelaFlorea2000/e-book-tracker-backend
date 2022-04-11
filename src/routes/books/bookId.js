// /books/{book_id}
require('dotenv').config();
const router = require('express').Router({mergeParams: true});
const { pool } = require('../../config/postgresConfig');
const { normalMsg } = require('../../helpers/returnMsg');
const { authenticateToken } = require('../../middlewares');
const { uploadBookMulter, deleteBook } = require('../../config/multerConfig');
const { uploadBookImage } = require('../../helpers/uploadImage');
const { round } = require('../../helpers/round');
const { START_LOCATION } = require('../../helpers/constants');
const path = require('path');

// Get information about a book
router.get('/', authenticateToken, async (req, res, next) => {
  const { bookId } = req.params;

  try {
    const bookData = await pool.query(
      'SELECT id, user_id AS "userId", title, authors, description, cover_image AS "coverImage", publisher, pub_date AS "pubDate", language, rating, file, file_name AS "fileName", series, location, last_opened AS "lastOpened" FROM books WHERE id = $1;',
      [bookId]
    )

    // Return average rating
    const avgRatingData = await pool.query(
      'SELECT AVG(reads.rating) AS avg FROM reads INNER JOIN books ON reads.book_id = books.id WHERE books.id = $1;',
      [bookId]
    )

    const avgRating = round(avgRatingData.rows[0].avg);

    const data = bookData.rows[0];
    data.rating = data.rating === 0 ? avgRating : data.rating;

    // Add tags
    data.tags = [];

    const tags = await pool.query(
      'SELECT name FROM tags WHERE book_id = $1',
      [bookId]
    );

    tags.rows.forEach(tag => {
      data.tags.push(tag.name);
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Delete a book
router.delete('/', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const user = req.user;

  try {
    const data = await pool.query(
      'SELECT id, user_id AS "userId" FROM books WHERE id = $1',
      [bookId]
    )

    if (data.rows.length === 0) {
      return res.status(404).json({ status: false, message: "Not Found" });
    }

    if (data.rows[0].userId !== user.id) {
      return res.status(401).json({ status: false, message: "Unauthorised" });
    }

    // Delete from bucket
    await deleteBook(user.id, bookId);

    // Delete from db
    await pool.query(
      'DELETE FROM books WHERE id = $1',
      [bookId]
    )

    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})
 
// Book was opened
router.post('/opened', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const user = req.user;

  try {
    const book = await pool.query(
      'SELECT id, user_id AS "userId", current_read AS "currentRead" FROM books WHERE id = $1',
      [bookId]
    )

    if (book.rows.length === 0) {
      return res.status(404).json({ status: false, message: "Not Found" });
    }

    if (book.rows[0].userId !== user.id) {
      return res.status(401).json({ status: false, message: "Unauthorised" });
    }

    let currentRead = book.rows[0].currentRead

    // Check book is not currently being read
    if (currentRead === null) {
      // Create new read
      const newRead = await pool.query(
        'INSERT INTO reads (book_id, user_id, start_date) VALUES($1, $2, current_timestamp) RETURNING id',
        [bookId, user.id]
      );

      console.log(newRead.rows[0].id);

      // Update book currentRead
      await pool.query(
        'UPDATE books SET current_read = $1 WHERE id = $2;',
        [newRead.rows[0].id, bookId]
      );

      currentRead = newRead.rows[0].id;
    }

    // Update book lastOpened
    await pool.query(
      'UPDATE books SET last_opened = current_timestamp WHERE id = $1;',
      [bookId]
    );

    // Check reading streak
    const readToday = await pool.query(
      'SELECT * FROM sessions INNER JOIN reads ON sessions.read_id = reads.id INNER JOIN books ON reads.book_id = books.id WHERE books.user_id = $1 AND DATE(sessions.start_date) = CURRENT_DATE;',
      [user.id]
    );

    // Is the user reading for the first time today?
    if (readToday.rows.length === 0) {
      // Had the user read yesterday?
      const readYesterday = await pool.query(
        "SELECT * FROM sessions INNER JOIN reads ON sessions.read_id = reads.id INNER JOIN books ON reads.book_id = books.id WHERE books.user_id = $1 AND DATE(sessions.start_date) = (CURRENT_DATE - INTERVAL '1 day') LIMIT 1;",
        [user.id]
      );

      let currentStreak;

      if (readYesterday.rows.length > 0) {
        // Yes => increment reading streak
        const streakData = await pool.query(
          'UPDATE users SET current_streak = current_streak + 1 WHERE id = $1  RETURNING current_streak AS "currentStreak"',
          [user.id]
        );

        currentStreak = streakData.rows[0].currentStreak;

      } else {
        // No => reset reading streak
        await pool.query(
          "UPDATE users SET current_streak = 1 WHERE id = $1",
          [user.id]
        );

        currentStreak = 1;
      }

      const longestStreakData = await pool.query(
        'SELECT longest_streak AS "longestStreak" FROM users WHERE id = $1',
        [user.id]
      );

      let longestStreak = longestStreakData.rows[0].longestStreak

      if (currentStreak > longestStreak) {
        await pool.query(
          'UPDATE users SET longest_streak = $1 WHERE id = $2 ',
          [currentStreak, user.id]
        );

        longestStreak = currentStreak
      }

      // Check if we got read badge
      // Biggest read badge we have so far
      const badges = await pool.query(
        "SELECT MAX(badges.number)::INTEGER AS max FROM badge_notifications INNER JOIN badges ON badge_notifications.badge_id = badges.id WHERE badge_notifications.receiver_id = $1 AND badges.type='days';",
        [user.id]
      );

      const maxBadge = badges.rows[0].max ? badges.rows[0].max : 0

      if (longestStreak === 7 && maxBadge === 0) {
        // First highlight badge
        await pool.query(
          "INSERT INTO badge_notifications (badge_id, receiver_id, date) values (3, $1, CURRENT_TIMESTAMP)",
          [user.id]
        );

      } else if (longestStreak === 30 && maxBadge === 7) {
        // Second highlight badge
        await pool.query(
          "INSERT INTO badge_notifications (badge_id, receiver_id, date) values (6, $1, CURRENT_TIMESTAMP)",
          [user.id]
        );

      } else if (longestStreak === 100 && maxBadge === 30) {
        // Second highlight badge
        await pool.query(
          "INSERT INTO badge_notifications (badge_id, receiver_id, date) values (9, $1, CURRENT_TIMESTAMP)",
          [user.id]
        );
      }
    
    }

    // Create new session
    await pool.query(
      'INSERT INTO sessions (read_id, start_date) VALUES ($1, current_timestamp)',
      [currentRead]
    );

    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Book was closed
router.post('/closed', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const user = req.user;
  const { location } = req.body;

  try {
    const book = await pool.query(
      'SELECT id, user_id AS "userId", current_read AS "currentRead" FROM books WHERE id = $1',
      [bookId]
    )

    if (book.rows.length === 0) {
      return res.status(404).json({ status: false, message: "Not Found" });
    }

    if (book.rows[0].userId !== user.id) {
      return res.status(401).json({ status: false, message: "Unauthorised" });
    }

    // Update current session time
    await pool.query(
      'UPDATE sessions SET time = AGE(current_timestamp, start_date) WHERE read_id = $1 AND time IS NULL',
      [book.rows[0].currentRead]
    )

    // Update book location
    await pool.query(
      'UPDATE books SET location = $1 WHERE id = $2;',
      [location, bookId]
    );

    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Book was finished
router.post('/finished', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const user = req.user;
  const { rating, notes } = req.body;

  try {
    const book = await pool.query(
      'SELECT id, user_id AS "userId", current_read AS "currentRead" FROM books WHERE id = $1',
      [bookId]
    )

    if (book.rows.length === 0) {
      return res.status(404).json({ status: false, message: "Not Found" });
    }

    if (book.rows[0].userId !== user.id) {
      return res.status(401).json({ status: false, message: "Unauthorised" });
    }

    const currentRead = book.rows[0].currentRead;

    // Book is not currently being read anymore
    await pool.query(
      'UPDATE books SET current_read = null, read = true, location = $1 WHERE id = $2',
      [START_LOCATION, bookId]
    )

    // Update read
    await pool.query(
      'UPDATE reads SET end_date = current_timestamp, rating = $1, notes = $2 WHERE id = $3',
      [rating, notes, currentRead]
    )

    // Check if we got book badge
    // Total books read
    const booksReadData = await pool.query(
      'SELECT COUNT(DISTINCT id)::INTEGER AS count FROM books WHERE user_id = $1 AND read = true',
      [user.id]
    )

    const booksRead = booksReadData.rows[0].count;

    // Biggest book badge we have so far
    const badges = await pool.query(
      "SELECT MAX(badges.number)::INTEGER AS max FROM badge_notifications INNER JOIN badges ON badge_notifications.badge_id = badges.id WHERE badge_notifications.receiver_id = $1 AND badges.type='books';",
      [user.id]
    );

    const maxBadge = badges.rows[0].max ? badges.rows[0].max : 0;

    if (booksRead === 10 && maxBadge === 0) {
      // First book badge
      await pool.query(
        "INSERT INTO badge_notifications (badge_id, receiver_id, date) values (1, $1, CURRENT_TIMESTAMP)",
        [user.id]
      );
 
    } else if (booksRead === 50 && maxBadge === 10) {
      // Second book badge
      await pool.query(
        "INSERT INTO badge_notifications (badge_id, receiver_id, date) values (4, $1, CURRENT_TIMESTAMP)",
        [user.id]
      );

    } else if (booksRead === 100 && maxBadge === 50) {
      // Second book badge
      await pool.query(
        "INSERT INTO badge_notifications (badge_id, receiver_id, date) values (7, $1, CURRENT_TIMESTAMP)",
        [user.id]
      );
    }

    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Edit book metadata
router.put('/edit', authenticateToken, async (req, res, next) => {
  const bookId = req.params.bookId;
  const user = req.user;
  const { title, authors, description, tags, publisher, pubDate, language, rating, series } = req.body;

  try {
    const data = await pool.query(
      'SELECT id, user_id AS "userId" FROM books WHERE id = $1',
      [bookId]
    )

    if (data.rows.length === 0) {
      return res.status(404).json({ status: false, message: "Not Found" });
    }

    if (data.rows[0].userId !== user.id) {
      return res.status(401).json({ status: false, message: "Unauthorised" });
    }

    await pool.query(
      'UPDATE books SET title = $1, authors = $2, description = $3, publisher = $4, pub_date = $5, language = $6, rating = $7, series = $8 WHERE id = $9;',
      [title, authors, description, publisher, pubDate, language, rating, series, bookId]
    );

    // Update tags
    await pool.query(
      'DELETE FROM tags WHERE book_id = $1',
      [bookId]
    );

    // Insert tags
    for (const tag of tags) {
      await pool.query(
        `INSERT INTO tags (book_id, name) VALUES ($1, $2)`,
        [
          bookId,
          tag
        ]
      );
    }

    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Upload epub file and cover image to Google Bucket
router.post('/edit/upload', 
  authenticateToken, 
  uploadBookMulter,
  async (req, res, next) => {
    const user = req.user;
    const bookId = req.params.bookId;
    const { file, coverImage } = req.files;

    try {
      // Add paths to db
      if (file) {
        const toUpload = file[0];
        toUpload.originalname = 'file.epub';
        const fileUrl = await uploadBookImage(toUpload, user.id, bookId);

        await pool.query(
          'UPDATE books SET file = $1 WHERE id = $2;',
          [fileUrl, bookId]
        )
      }

      if (coverImage) {
        const toUpload = coverImage[0]
        toUpload.originalname = `coverImage${path.extname(coverImage[0].originalname)}`;
        const coverImageUrl = await uploadBookImage(toUpload, user.id, bookId);
        
        await pool.query(
          'UPDATE books SET cover_image = $1 WHERE id = $2;',
          [coverImageUrl, bookId]
        )
      }
      return normalMsg(res, 200, true, "OK");
    } catch (err) {
      res.status(500);
      next(err)
    }
  }
);

module.exports = router;