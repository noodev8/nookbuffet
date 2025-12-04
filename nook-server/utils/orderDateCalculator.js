/*
=======================================================================================================================================
ORDER DATE CALCULATOR - Works out when the earliest delivery/collection can be
=======================================================================================================================================
We need at least 1 day notice for orders, but there's a daily cutoff time.
If you order after the cutoff (default 4pm), you need to wait an extra day.

Example:
- Order at 2pm Monday → earliest delivery is Tuesday (before cutoff, so next day)
- Order at 5pm Monday → earliest delivery is Wednesday (after cutoff, so day after next)

The cutoff time is stored in the database so it can be changed without touching code.
=======================================================================================================================================
*/

const { query } = require('../database');

// ===== CALCULATE EARLIEST ORDER DATE =====
// Figures out the soonest date a customer can have their order delivered/collected
// Takes into account the daily cutoff time from the database
const calculateEarliestOrderDate = async () => {
  try {
    // Grab the cutoff time from the database - this is when we stop taking orders for next day
    const configResult = await query(
      'SELECT config_value FROM order_config WHERE config_key = $1',
      ['daily_cutoff_time']
    );

    // Default to 4pm if not set in database
    const cutoffTime = configResult.rows[0]?.config_value || '16:00';

    // Get current time in HH:MM format so we can compare with cutoff
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
      earliestDate: earliestDate.toISOString().split('T')[0],  // Format as YYYY-MM-DD
      cutoffTime,
      isAfterCutoff: currentTime >= cutoffTime  // Let the frontend know if we're past cutoff
    };

  } catch (error) {
    console.error('Error calculating earliest order date:', error);
    return {
      success: false,
      error: 'Unable to calculate earliest order date'
    };
  }
};

// ===== EXPORTS =====
module.exports = {
  calculateEarliestOrderDate
};