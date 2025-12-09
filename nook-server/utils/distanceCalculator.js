/*
=======================================================================================================================================
DISTANCE CALCULATOR - Mapbox API integration for delivery area validation
=======================================================================================================================================
This handles all the location stuff for checking if it's possible to can deliver to an address.
Uses Mapbox API to:
1. Turn addresses into coordinates (geocoding)
2. Calculate actual driving distance between two points

Used to check if a customer's address is within the delivery radius.
The delivery radius is set per branch in the database.
=======================================================================================================================================
*/

const axios = require('axios');

// ===== GEOCODE ADDRESS =====
// Takes a text address and turns it into lat/lng coordinates
// need this because you can't calculate distance from "123 High Street" - need actual coordinates
const geocodeAddress = async (address) => {
  try {
    //  Mapbox geocoding API - apparently its pretty good at understanding UK addresses
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
      {
        params: {
          access_token: process.env.MAPBOX_API_KEY,
          limit: 1  // Only need the best match
        }
      }
    );

    // Mapbox returns results in a "features" array
    if (response.data.features && response.data.features.length > 0) {
      // Coordinates come back as [longitude, latitude]
      const [lng, lat] = response.data.features[0].center;
      return {
        success: true,
        lat,
        lng
      };
    }

    // No results found
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

// ===== CALCULATE ROAD DISTANCE =====
// Works out the actual driving distance between two addresses
// Used to check if a delivery address is within the delivery radius
const calculateRoadDistance = async (fromAddress, toAddress) => {
  try {
    // First turn both addresses into coordinates
    const fromCoords = await geocodeAddress(fromAddress);
    const toCoords = await geocodeAddress(toAddress);

    // If either address couldn't be found
    if (!fromCoords.success || !toCoords.success) {
      return {
        success: false,
        error: 'Unable to geocode one or both addresses'
      };
    }

    // Use Mapbox's directions matrix API to get driving distance
    const response = await axios.get(
      `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}`,
      {
        params: {
          access_token: process.env.MAPBOX_API_KEY,
          annotations: 'distance,duration' 
        }
      }
    );

    // API returns distance in meters
    const distanceMeters = response.data.distances[0][1];
    const durationSeconds = response.data.durations[0][1];
    const distanceMiles = distanceMeters * 0.000621371;

    return {
      success: true,
      distanceMiles: Math.round(distanceMiles * 10) / 10,  // Round to 1 decimal place
      durationMinutes: Math.round(durationSeconds / 60)    // Convert seconds to minutes
    };

  } catch (error) {
    console.error('Distance calculation error:', error);
    return {
      success: false,
      error: 'Unable to calculate distance'
    };
  }
};

// ===== EXPORTS =====
module.exports = {
  geocodeAddress,
  calculateRoadDistance
};