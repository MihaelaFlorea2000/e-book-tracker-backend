// Require dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Create app
const app = express();

// App middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Hello 🌏!!'
  })
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}!`)
});