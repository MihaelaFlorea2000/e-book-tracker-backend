const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  return res.json({
    status: false,
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '📚' : error.stack
  });
}

module.exports = {
  errorHandler
}