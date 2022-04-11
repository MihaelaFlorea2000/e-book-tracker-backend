// Require dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Require Middleware
const middlewares = require('./middlewares');
const usersRouter = require('./routes/users/users');
const booksRouter = require('./routes/books/books');
const highlightsRouter = require('./routes/highlights/highlights');
const readsRouter = require('./routes/reads/reads');
const sessionsRouter = require('./routes/sessions/sessions');
const metricsRouter = require('./routes/metrics/metrics');
const searchRouter = require('./routes/search/search');
const friendsRouter = require('./routes/friends/friends');
const notificationsRouter = require('./routes/notifications/notifications');
const badgesRouter = require('./routes/badges/badges');

// Create app
const app = express();

// App middleware
app.use('/uploads', express.static('uploads'));
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Hello 🌏!'
  })
});

// Routes
app.use('/books', booksRouter);
app.use('/users', usersRouter);
app.use('/highlights/:bookId', highlightsRouter);
app.use('/reads/:bookId', readsRouter);
app.use('/sessions/:readId', sessionsRouter);
app.use('/metrics', metricsRouter);
app.use('/search', searchRouter);
app.use('/friends', friendsRouter);
app.use('/notifications', notificationsRouter);
app.use('/badges', badgesRouter);

// Error handling middleware
app.use(middlewares.errorHandler);

module.exports = app