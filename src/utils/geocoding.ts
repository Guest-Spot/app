export interface GeocodingResult {
  country: string;
  state: string;
  city: string;
  address: string;
}

interface NominatimAddress {
  country?: string;
  state?: string;
  region?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  'ISO3166-2-lvl4'?: string;
  road?: string;
  house_number?: string;
  house?: string;
  building?: string;
  suburb?: string;
}

interface NominatimResult {
  display_name: string;
  address: NominatimAddress;
}

/**
 * Reverse geocoding using Nominatim (OpenStreetMap)
 * Note: Please respect Nominatim usage policy: https://operations.osmfoundation.org/policies/nominatim/
 * For production use, consider using your own Nominatim instance or a commercial service
 */
export const reverseGeocode = async (
  lat: number,
  lng: number,
): Promise<GeocodingResult | null> => {
  try {
    // Using Nominatim API (OpenStreetMap)
    // Add a small delay to respect rate limits (1 request per second)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'GuestSpot App', // Required by Nominatim
        },
      },
    );

    if (!response.ok) {
      console.error('Geocoding failed:', response.statusText);
      return null;
    }

    const data: NominatimResult = await response.json();

    if (!data || !data.address) {
      return null;
    }

    const address = data.address;
    const country = address.country || '';
    const state = address.state || address.region || address['ISO3166-2-lvl4'] || '';
    const city = address.city || address.town || address.village || address.county || '';

    // Build address from street components only (house_number, road, house, building)
    const addressParts: string[] = [];
    if (address.house_number) {
      addressParts.push(address.house_number);
    }
    if (address.road) {
      addressParts.push(address.road);
    } else if (address.house) {
      addressParts.push(address.house);
    } else if (address.building) {
      addressParts.push(address.building);
    }
    const streetAddress = addressParts.join(' ').trim();

    return {
      country,
      state,
      city,
      address: streetAddress,
    };
  } catch (error) {
    console.error('Error during reverse geocoding:', error);
    return null;
  }
};

