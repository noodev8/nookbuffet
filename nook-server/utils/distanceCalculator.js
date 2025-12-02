const axios = require('axios');

/**
 * Geocode an address to get latitude and longitude
 * @param {string} address - The address to geocode
 * @returns {object} - { success: boolean, lat: number, lng: number }
 */
const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
      {
        params: {
          access_token: process.env.MAPBOX_API_KEY,
          limit: 1
        }
      }
    );

    if (response.data.features && response.data.features.length > 0) {
      const [lng, lat] = response.data.features[0].center;
      return {
        success: true,
        lat,
        lng
      };
    }

    return {
      success: false,
      error: 'Address not found'
    };

  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      success: false,
      error: 'Unable to geocode address'
    };
  }
};

/**
 * Calculate road distance between two addresses
 * @param {string} fromAddress - Starting address
 * @param {string} toAddress - Destination address
 * @returns {object} - { success: boolean, distanceMiles: number, durationMinutes: number }
 */
const calculateRoadDistance = async (fromAddress, toAddress) => {
  try {
    // Geocode addresses first, then calculate distance
    const fromCoords = await geocodeAddress(fromAddress);
    const toCoords = await geocodeAddress(toAddress);

    if (!fromCoords.success || !toCoords.success) {
      return {
        success: false,
        error: 'Unable to geocode one or both addresses'
      };
    }

    const response = await axios.get(
      `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}`,
      {
        params: {
          access_token: process.env.MAPBOX_API_KEY,
          annotations: 'distance,duration'
        }
      }
    );

    const distanceMeters = response.data.distances[0][1];
    const durationSeconds = response.data.durations[0][1];
    const distanceMiles = distanceMeters * 0.000621371; // Convert to miles

    return {
      success: true,
      distanceMiles: Math.round(distanceMiles * 10) / 10, // Round to 1 decimal
      durationMinutes: Math.round(durationSeconds / 60)
    };

  } catch (error) {
    console.error('Distance calculation error:', error);
    return {
      success: false,
      error: 'Unable to calculate distance'
    };
  }
};

module.exports = {
  geocodeAddress,
  calculateRoadDistance
};