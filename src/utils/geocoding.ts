export interface GeocodingResult {
  country: string;
  state: string;
  city: string;
  address: string;
}

export interface ForwardGeocodingResult {
  displayName: string;
  lat: number;
  lng: number;
  address: {
    country: string | undefined;
    state: string | undefined;
    city: string | undefined;
    road: string | undefined;
    houseNumber: string | undefined;
  };
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
  lat?: string;
  lon?: string;
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

/**
 * Forward geocoding using Nominatim (OpenStreetMap)
 * Searches for places by name/address
 * Note: Please respect Nominatim usage policy: https://operations.osmfoundation.org/policies/nominatim/
 * For production use, consider using your own Nominatim instance or a commercial service
 */
export const forwardGeocode = async (
  query: string,
  limit: number = 5,
): Promise<ForwardGeocodingResult[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    // Using Nominatim API (OpenStreetMap)
    // Add a small delay to respect rate limits (1 request per second)
    const encodedQuery = encodeURIComponent(query.trim());
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=${limit}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'GuestSpot App', // Required by Nominatim
        },
      },
    );

    if (!response.ok) {
      console.error('Forward geocoding failed:', response.statusText);
      return [];
    }

    const data: NominatimResult[] = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data
      .filter((item) => item.lat && item.lon)
      .map((item) => ({
        displayName: item.display_name,
        lat: parseFloat(item.lat!),
        lng: parseFloat(item.lon!),
        address: {
          country: item.address?.country,
          state: item.address?.state || item.address?.region,
          city:
            item.address?.city ||
            item.address?.town ||
            item.address?.village ||
            item.address?.county,
          road: item.address?.road,
          houseNumber: item.address?.house_number,
        },
      }));
  } catch (error) {
    console.error('Error during forward geocoding:', error);
    return [];
  }
};

