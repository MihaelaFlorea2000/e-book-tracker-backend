// Round a number to two decimals
const round = (number) => {
  return Math.round(number * 100) / 100
}

module.exports = { round }