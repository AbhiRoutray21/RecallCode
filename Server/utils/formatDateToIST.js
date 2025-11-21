function formatDateToIST(date){
  // Indian Standard Time = UTC + 5 hours 30 minutes
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // in milliseconds

  // Convert to IST timestamp
  const istDate = new Date(date.getTime() + IST_OFFSET);

  // Extract date parts
  const day = String(istDate.getUTCDate()).padStart(2, '0');
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const year = istDate.getUTCFullYear();

  const hours = String(istDate.getUTCHours()).padStart(2, '0');
  const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');

  // Return formatted string
  return `${day}-${month}-${year} at ${hours}:${minutes}`;
};

module.exports = {formatDateToIST};