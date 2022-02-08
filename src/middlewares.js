const jwt = require('jsonwebtoken');

const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  return res.json({
    status: false,
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '📚' : error.stack
  });
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) {
    return res.status(403).json({status: false, message: "Unauthorised"});
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {

    if (err) return res.status(403).json({status: false, message: err.message});

    req.user = user

    next()
  })
}

module.exports = {
  errorHandler,
  authenticateToken
}