const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  authors : [{
    type: String
  }],
  description: String,
  coverImage: String,
  tags : [{
    type: String
  }],
  publisher: String,
  pubDate: String,
  language: String,
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  file: String,
  fileName: {
    type: String,
    required: true
  },
  series: String
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;


