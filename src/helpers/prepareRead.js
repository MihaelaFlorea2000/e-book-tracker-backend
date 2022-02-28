const getTimestamp = (date) => {
  return `${date} 12:00:00`
}

const getInterval = (time) => {
  const timeString = {
    years: time.years === 0 ? '' : `${time.years.toString()} years `,
    months: time.months === 0 ? '' : `${time.months.toString()} months `,
    days: time.days === 0 ? '' : `${time.days.toString()} days `,
    hours: time.hours === 0 ? '' : `${time.hours.toString()} hours `,
    minutes: time.minutes === 0 ? '' : `${time.minutes.toString()} minutes `,
    seconds: time.seconds === 0 ? '' : `${time.seconds.toString()} seconds `,
    milliseconds: time.milliseconds === 0 ? '' : `${time.milliseconds.toString()} milliseconds`.toString()
  }

  return `${timeString.years}${timeString.months}${timeString.days}${timeString.hours}${timeString.minutes}${timeString.seconds}${timeString.milliseconds}` 
}

module.exports = { getTimestamp, getInterval }