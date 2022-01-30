const returnMsg = (res, statusCode, status, msg) => {
  return res.status(statusCode).json({status: status, message: msg});
}

module.exports = {
  returnMsg
}