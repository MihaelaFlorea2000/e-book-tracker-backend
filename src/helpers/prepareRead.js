const getTimestamp = (date) => {
  return `${date} 12:00:00`
}

const getInterval = (time) => {
  const timeString = {
    hours: time.hours === 0 ? '' : `${time.hours.toString()} hours `,
    minutes: time.minutes === 0 ? '' : `${time.minutes.toString()} minutes `
  }

  return `${timeString.hours}${timeString.minutes}` 
}

module.exports = { getTimestamp, getInterval }