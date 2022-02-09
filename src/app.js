// Require dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

// Require Middleware
const middlewares = require('./middlewares');
const pgRouter = require('./routes/pg/pg')
const mongoRouter = require('./routes/mongo/mongo');

// Create app
const app = express();

// Connect to Mongodb
const url = process.env.MONGODB_URL;
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// App middleware
app.use('/uploads', express.static('uploads'));
app.use(cors({
  origin: process.env.CORS_ORIGIN
}));
app.use((req, res, next) => {
  res.header("Cross-Origin-Resource-Policy", "same-site")
  next()
})
app.use(helmet());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Hello 🌏!'
  })
});

// Routes
app.use('/pg', pgRouter);
app.use('/mongo', mongoRouter);

// Error handling middleware
app.use(middlewares.errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}!`)
});