// /pg/reads/{book_id}
require('dotenv').config();
const router = require('express').Router();
const { pool } = require('../../../config/postgresConfig');
const { authenticateToken } = require('../../../middlewares');
const { round } = require('../../../helpers/round');
const { getDaysInMonth, formatDate } = require('../../../helpers/formatDates');

// Get the numbers
router.get('/numbers', authenticateToken, async (req, res, next) => {
  const user = req.user;

  try {
    const booksRead = await pool.query(
      'SELECT COUNT(DISTINCT id) AS count FROM books WHERE user_id = $1 AND read = true',
      [user.id]
    )

    const booksCurrRead = await pool.query(
      'SELECT COUNT(DISTINCT id) AS count FROM books WHERE user_id = $1 AND current_read IS NOT NULL',
      [user.id]
    )

    const authorsRead = await pool.query(
      'SELECT authors FROM books WHERE user_id = $1 AND read = true',
      [user.id]
    )

    let authorsReadCount = 0;

    authorsRead.rows.forEach((row) => {
      authorsReadCount += row.authors.length
    })

    const longestSession = await pool.query(
      'SELECT MAX(sessions.time) AS max FROM sessions INNER JOIN reads ON sessions.read_id = reads.id INNER JOIN books ON reads.book_id = books.id WHERE books.user_id = $1 AND books.read = true;',
      [user.id]
    )

    const avgTimePerSession = await pool.query(
      'SELECT AVG(sessions.time) AS avg FROM sessions INNER JOIN reads ON sessions.read_id = reads.id INNER JOIN books ON reads.book_id = books.id WHERE books.user_id = $1 AND books.read = true;',
      [user.id]
    )

    const bestDay = await pool.query(
      'SELECT DATE(sessions.start_date) AS day, SUM(sessions.time) FROM sessions INNER JOIN reads ON sessions.read_id = reads.id INNER JOIN books ON reads.book_id = books.id WHERE books.user_id = $1 AND books.read = true GROUP BY day',
      [user.id]
    )

    const bestDayValue = bestDay.rows[0] ? bestDay.rows[0].day : '';

    const numbers = {
      booksRead: parseInt(booksRead.rows[0].count),
      booksCurrRead: parseInt(booksCurrRead.rows[0].count),
      authorsReadCount: authorsReadCount,
      longestSession: longestSession.rows[0].max,
      avgTimePerSession: avgTimePerSession.rows[0].avg,
      bestDay: bestDayValue
    }

    res.status(200).json(numbers);
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Get the percentage of books read
router.get('/percentage', authenticateToken, async (req, res, next) => {
  const user = req.user;

  try {
    const booksRead = await pool.query(
      'SELECT COUNT(DISTINCT id) AS count FROM books WHERE user_id = $1 AND read = true',
      [user.id]
    )

    const totalBooks = await pool.query(
      'SELECT COUNT(DISTINCT id) AS count FROM books WHERE user_id = $1',
      [user.id]
    )

    const percentage = {
      value: round(booksRead.rows[0].count / totalBooks.rows[0].count)
    }

    res.status(200).json(percentage);
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Get the done goals
router.get('/goals', authenticateToken, async (req, res, next) => {
  const user = req.user;

  try {

    // Get user goals
    const setGoals = await pool.query(
      'SELECT yearly, monthly, daily_hours AS "dailyHours", daily_minutes AS "dailyMinutes" FROM users WHERE id = $1',
      [user.id]
    )

    // Books read per year
    const yearlyBooks = await pool.query(
      'SELECT COUNT(DISTINCT books.id) AS count FROM books INNER JOIN reads ON books.id = reads.book_id WHERE books.user_id = $1 AND reads.end_date IS NOT NULL AND books.read = true AND(EXTRACT(YEAR FROM reads.end_date)) = EXTRACT(YEAR FROM current_timestamp);',
      [user.id]
    )

    // Books read per month
    const monthlyBooks = await pool.query(
      'SELECT COUNT(DISTINCT books.id) AS count FROM books INNER JOIN reads ON books.id = reads.book_id WHERE books.user_id = $1 AND reads.end_date IS NOT NULL AND books.read = true AND(EXTRACT(YEAR FROM reads.end_date)) = EXTRACT(YEAR FROM current_timestamp)AND(EXTRACT(MONTH FROM reads.end_date)) = EXTRACT(MONTH FROM current_timestamp);',
      [user.id]
    )

    // Time read per day
    const dailyTime = await pool.query(
      'SELECT SUM(sessions.time) AS count FROM sessions INNER JOIN reads ON sessions.read_id = reads.id INNER JOIN books ON reads.book_id = books.id WHERE books.user_id = $1 AND DATE(sessions.start_date) = CURRENT_DATE;',
      [user.id]
    )

    // Minutes and hours read per day
    const hoursPerDay = dailyTime.rows[0].count.hours ? dailyTime.count.rows[0].hours : 0;
    const minutesPerDay = dailyTime.rows[0].count.minutes ? dailyTime.rows[0].count.minutes : 0;

    // Total user daily goal in minutes
    const setDaily = setGoals.rows[0].dailyHours * 60 + setGoals.rows[0].dailyMinutes;

    // Total done daily goal in minutes
    const doneDaily = hoursPerDay * 60 + minutesPerDay;

    // Percentage of yearly goal
    const yearlyPercent = parseInt(yearlyBooks.rows[0].count) / setGoals.rows[0].yearly;

    // Percentage of monthly goal
    const monthlyPercent = parseInt(monthlyBooks.rows[0].count) / setGoals.rows[0].monthly;
    
    // Completed Goals
    const doneGoals = {
      yearly: parseInt(yearlyBooks.rows[0].count),
      monthly: parseInt(monthlyBooks.rows[0].count),
      dailyHours: hoursPerDay,
      dailyMinutes: minutesPerDay
    }

    const percentageGoals = {
      yearly: yearlyPercent,
      monthly: monthlyPercent,
      daily: doneDaily / setDaily
    }

    // All goals
    const goals = {
      set: setGoals.rows[0],
      done: doneGoals,
      percentage: percentageGoals
    }

    res.status(200).json(goals);
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Get the weekly reading time
router.get('/weekly', authenticateToken, async (req, res, next) => {
  const user = req.user;

  try {

    // Get user goals
    const pastWeek = await pool.query(
      "SELECT TO_CHAR(DATE(sessions.start_date), 'Dy') AS \"label\", EXTRACT(HOUR FROM SUM(sessions.time))::INTEGER AS \"totalTime\" FROM sessions INNER JOIN reads ON sessions.read_id = reads.id INNER JOIN books ON reads.book_id = books.id WHERE books.user_id = $1 AND books.read = true AND sessions.time IS NOT NULL AND DATE(sessions.start_date) > CURRENT_DATE - INTERVAL '7' day GROUP BY \"label\" ORDER BY \"label\" ASC;",
      [user.id]
    )

    // Fill blank days with 0
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat', 'Sun'];
    const weekMap = new Map();

    weekDays.forEach((day) => {
      weekMap.set(day, 0);
    })

    pastWeek.rows.forEach((row) => {
      weekMap.set(row.label, row.totalTime)
    })

    const weekly = {
      labels: Array.from(weekMap.keys()),
      dataValues: Array.from(weekMap.values())
    }

    res.status(200).json(weekly);
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Get the monthly reading time
router.get('/monthly', authenticateToken, async (req, res, next) => {
  const user = req.user;

  try {

    // Books read per year
    const pastMonth = await pool.query(
      "SELECT DATE(sessions.start_date)::DATE AS \"label\", EXTRACT(HOUR FROM SUM(sessions.time))::INTEGER AS \"totalTime\" FROM sessions INNER JOIN reads ON sessions.read_id = reads.id INNER JOIN books ON reads.book_id = books.id WHERE books.user_id = $1 AND books.read = true AND sessions.time IS NOT NULL AND DATE(sessions.start_date) > CURRENT_DATE - INTERVAL '1' month GROUP BY \"label\" ORDER BY \"label\" ASC;",
      [user.id]
    )

    // Fill blank days with 0
    const monthDays = getDaysInMonth();
    const monthMap = new Map();

    monthDays.forEach((day) => {
      monthMap.set(day, 0);
    })

    pastMonth.rows.forEach((row) => {
      monthMap.set(formatDate(row.label), row.totalTime)
    })

    const monthly = {
      labels: Array.from(monthMap.keys()),
      dataValues: Array.from(monthMap.values())
    }

    res.status(200).json(monthly);
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Get the yearly reading time
router.get('/yearly', authenticateToken, async (req, res, next) => {
  const user = req.user;

  try {

    // Books read per month
    const pastYear = await pool.query(
      "SELECT TO_CHAR(DATE(sessions.start_date), 'Mon') AS \"label\", EXTRACT(HOUR FROM SUM(sessions.time))::INTEGER AS \"totalTime\" FROM sessions INNER JOIN reads ON sessions.read_id = reads.id INNER JOIN books ON reads.book_id = books.id WHERE books.user_id = $1 AND books.read = true AND sessions.time IS NOT NULL AND DATE(sessions.start_date) > CURRENT_DATE - INTERVAL '1' year GROUP BY \"label\" ORDER BY \"label\" ASC;",
      [user.id]
    )

    // Fill blank months with 0
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const yearMap = new Map();

    monthNames.forEach((day) => {
      yearMap.set(day, 0);
    })

    pastYear.rows.forEach((row) => {
      yearMap.set(row.label, row.totalTime)
    })

    const yearly = {
      labels: Array.from(yearMap.keys()),
      dataValues: Array.from(yearMap.values())
    }

    res.status(200).json(yearly);
  } catch (err) {
    res.status(500);
    next(err)
  }
})

module.exports = router;