const normalMsg = (res, statusCode, status, msg) => {
  return res.status(statusCode).json({status: status, message: msg});
}

const loginMsg = (res, statusCode, status, msg, token) => {
  return res.status(statusCode).json({status: status, message: msg, token: token});
}


module.exports = {
  normalMsg,
  loginMsg
}