// Inspired by https://stackoverflow.com/questions/4413590/javascript-get-array-of-dates-between-2-dates

Date.prototype.addDays = function (days) {
  const date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

Date.prototype.removeDays = function (days) {
  const date = new Date(this.valueOf());
  date.setDate(date.getDate() - days);
  return date;
}

// from 2022-03-01T22:00:00.000Z to 2022-03-01
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US');
}

// Return array of the past 30 days
const getDaysInMonth = () => {
  const daysInMonth = [];

  const startDate = new Date().removeDays(30);
  const endDate = new Date();

  let currentDate = startDate;
  while (currentDate <= endDate) {
    daysInMonth.push(formatDate(currentDate));
    currentDate = currentDate.addDays(1);
  }
  
  return daysInMonth;
}

// Return array of the past 30 days
const getYears = (startYear) => {
  const years = [];

  const endYear = new Date().getFullYear();

  let currentYear = startYear;
  while (currentYear <= endYear) {
    years.push(currentYear.toString());
    currentYear++;
  }

  return years;
}


module.exports = { getDaysInMonth, formatDate, getYears }