/*
=======================================================================================================================================
ORDER DATE CALCULATOR - Works out when the earliest collection can be
=======================================================================================================================================
 need at least 1 day notice for orders, but there's a daily cutoff time.
If you order after the cutoff (default 4pm), you need to wait an extra day.



The cutoff time is stored in the database 
=======================================================================================================================================
*/

const { query } = require('../database');

// "YYYY-MM-DD" for a date in the server's local time. toISOString() would give the UTC day,
// which is the day before between midnight and 1am during BST.
const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const getConfigValue = async (key, fallback) => {
  const result = await query('SELECT config_value FROM order_config WHERE config_key = $1', [key]);
  return result.rows[0]?.config_value || fallback;
};

// ===== CALCULATE EARLIEST ORDER DATE =====
// Figures out the soonest date a customer can collect their order
// Takes into account the daily cutoff time from the database
const calculateEarliestOrderDate = async () => {
  try {
    // Grab the cutoff time from the database, defaulting to 4pm
    const cutoffTime = await getConfigValue('daily_cutoff_time', '16:00');

    // Get current time in HH:MM format 
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    let earliestDate = new Date();

    // The key logic: if it's after cutoff, add 2 days, otherwise just 1
    if (currentTime >= cutoffTime) {
      // Too late for tomorrow, push to day after
      earliestDate.setDate(earliestDate.getDate() + 2);
    } else {
      // Still time to get it ready for tomorrow
      earliestDate.setDate(earliestDate.getDate() + 1);
    }

    return {
      success: true,
      earliestDate: toDateKey(earliestDate),  // Format as YYYY-MM-DD
      cutoffTime,
      isAfterCutoff: currentTime >= cutoffTime  // Let the frontend know if it is past cutoff
    };

  } catch (error) {
    console.error('Error calculating earliest order date:', error);
    return {
      success: false,
      error: 'Unable to calculate earliest order date'
    };
  }
};

// ===== CALCULATE EARLIEST SANDWICH DATE =====
// Orders with only sandwiches (no buffets) can be collected the same day if placed before
// the sandwich cutoff (default 11am), otherwise from tomorrow.
const calculateEarliestSandwichDate = async () => {
  try {
    const cutoffTime = await getConfigValue('sandwich_cutoff_time', '11:00');
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const isAfterCutoff = currentTime >= cutoffTime;

    const earliestDate = new Date();
    if (isAfterCutoff) earliestDate.setDate(earliestDate.getDate() + 1);

    return {
      success: true,
      earliestDate: toDateKey(earliestDate),
      today: toDateKey(now),
      currentTime,
      cutoffTime,
      isAfterCutoff
    };
  } catch (error) {
    console.error('Error calculating earliest sandwich date:', error);
    return { success: false, error: 'Unable to calculate earliest sandwich date' };
  }
};

// ===== EXPORTS =====
module.exports = {
  calculateEarliestOrderDate,
  calculateEarliestSandwichDate
};