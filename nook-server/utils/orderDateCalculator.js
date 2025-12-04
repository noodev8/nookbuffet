const { query } = require('../database');

/**
 * Calculate the earliest available delivery/collection date based on current time and cutoff rules
 * @returns {object} - { success: boolean, earliestDate: string, cutoffTime: string }
 */
const calculateEarliestOrderDate = async () => {
  try {
    // Get cutoff time from database
    const configResult = await query(
      'SELECT config_value FROM order_config WHERE config_key = $1',
      ['daily_cutoff_time']
    );

    const cutoffTime = configResult.rows[0]?.config_value || '16:00';
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    let earliestDate = new Date();
    
    // If current time is after cutoff, add 2 days, otherwise add 1 day
    if (currentTime >= cutoffTime) {
      earliestDate.setDate(earliestDate.getDate() + 2);
    } else {
      earliestDate.setDate(earliestDate.getDate() + 1);
    }
    
    return {
      success: true,
      earliestDate: earliestDate.toISOString().split('T')[0], // YYYY-MM-DD format
      cutoffTime,
      isAfterCutoff: currentTime >= cutoffTime
    };

  } catch (error) {
    console.error('Error calculating earliest order date:', error);
    return {
      success: false,
      error: 'Unable to calculate earliest order date'
    };
  }
};

module.exports = {
  calculateEarliestOrderDate
};