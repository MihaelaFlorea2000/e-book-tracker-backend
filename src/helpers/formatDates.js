/**
 * Inspired by https://stackoverflow.com/questions/4413590/javascript-get-array-of-dates-between-2-dates
*/
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

/**
 * This post helped with the correct format for time zone
 * https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd
 */
const formatDate = (date) => {
  if (!date) return '';

  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - (offset * 60 * 1000));

  return date.toISOString().split('T')[0];
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


module.exports = { 
  getDaysInMonth, 
  formatDate, 
  getYears 
}