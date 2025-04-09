import * as Location from 'expo-location';

/**
 * Geocodes an address string to latitude and longitude coordinates
 * @param address The address to geocode
 * @returns Promise with latitude and longitude or null if geocoding fails
 */
export const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const results = await Location.geocodeAsync(address);
    
    if (results && results.length > 0) {
      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Reverse geocodes coordinates to an address
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Promise with address string or null if reverse geocoding fails
 */
export const reverseGeocodeCoordinates = async (
  latitude: number, 
  longitude: number
): Promise<string | null> => {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude
    });
    
    if (results && results.length > 0) {
      const { street, city, region, country, postalCode } = results[0];
      const addressParts = [street, city, region, postalCode, country].filter(Boolean);
      return addressParts.join(', ');
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};