// Geo Utilities for GPS Location & Distance Calculation

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface LocationInfo {
  name: string;
  coords: Coordinates;
  country?: string;
  source: 'gps' | 'preset' | 'manual';
}

export const FAMOUS_CITIES: Record<string, { lat: number; lon: number; country: string }> = {
  'Sialkot': { lat: 32.4945, lon: 74.5229, country: 'Pakistan (Punjab)' },
  'Ormara': { lat: 25.2088, lon: 64.6357, country: 'Pakistan (Balochistan)' },
  'Gwadar': { lat: 25.1264, lon: 62.3225, country: 'Pakistan (Balochistan)' },
  'Pasni': { lat: 25.2631, lon: 63.4692, country: 'Pakistan (Balochistan)' },
  'Turbat': { lat: 26.0031, lon: 63.0544, country: 'Pakistan (Balochistan)' },
  'Quetta': { lat: 30.1798, lon: 66.9750, country: 'Pakistan (Balochistan)' },
  'Karachi': { lat: 24.8607, lon: 67.0011, country: 'Pakistan' },
  'Islamabad': { lat: 33.6844, lon: 73.0479, country: 'Pakistan' },
  'Lahore': { lat: 31.5204, lon: 74.3587, country: 'Pakistan' },
  'New York': { lat: 40.7128, lon: -74.006, country: 'USA' },
  'Paris': { lat: 48.8566, lon: 2.3522, country: 'France' },
  'London': { lat: 51.5074, lon: -0.1278, country: 'UK' },
  'Tokyo': { lat: 35.6762, lon: 139.6503, country: 'Japan' },
  'Los Angeles': { lat: 34.0522, lon: -118.2437, country: 'USA' },
  'San Francisco': { lat: 37.7749, lon: -122.4194, country: 'USA' },
  'Chicago': { lat: 41.8781, lon: -87.6298, country: 'USA' },
  'Toronto': { lat: 43.6532, lon: -79.3832, country: 'Canada' },
  'Sydney': { lat: -33.8688, lon: 151.2093, country: 'Australia' },
  'Rome': { lat: 41.9028, lon: 12.4964, country: 'Italy' },
  'Berlin': { lat: 52.52, lon: 13.405, country: 'Germany' },
  'Dubai': { lat: 25.2048, lon: 55.2708, country: 'UAE' },
  'Singapore': { lat: 1.3521, lon: 103.8198, country: 'Singapore' },
  'Seoul': { lat: 37.5665, lon: 126.978, country: 'South Korea' },
  'Kyoto': { lat: 35.0116, lon: 135.7681, country: 'Japan' },
  'Honolulu': { lat: 21.3069, lon: -157.8583, country: 'Hawaii' },
  'Barcelona': { lat: 41.3879, lon: 2.1699, country: 'Spain' },
  'Amsterdam': { lat: 52.3676, lon: 4.9041, country: 'Netherlands' },
  'Miami': { lat: 25.7617, lon: -80.1918, country: 'USA' },
};

/**
 * Haversine formula to compute great-circle distance between two points in miles
 */
export function calculateDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(1, Math.round(R * c));
}

/**
 * Find approximate coordinates from a city string if known
 */
export function getCoordinatesForCity(cityStr: string): Coordinates {
  const normalized = cityStr.toLowerCase();
  
  if (normalized.includes('sialkot')) {
    return FAMOUS_CITIES['Sialkot'];
  }
  if (normalized.includes('ormara') || normalized.includes('balochistan') || normalized.includes('baluchistan')) {
    return FAMOUS_CITIES['Ormara'];
  }
  if (normalized.includes('gwadar')) {
    return FAMOUS_CITIES['Gwadar'];
  }
  if (normalized.includes('karachi')) {
    return FAMOUS_CITIES['Karachi'];
  }
  if (normalized.includes('quetta')) {
    return FAMOUS_CITIES['Quetta'];
  }
  if (normalized.includes('pasni')) {
    return FAMOUS_CITIES['Pasni'];
  }
  if (normalized.includes('turbat')) {
    return FAMOUS_CITIES['Turbat'];
  }
  if (normalized.includes('islamabad')) {
    return FAMOUS_CITIES['Islamabad'];
  }
  if (normalized.includes('lahore')) {
    return FAMOUS_CITIES['Lahore'];
  }

  for (const [cityName, data] of Object.entries(FAMOUS_CITIES)) {
    if (normalized.includes(cityName.toLowerCase())) {
      return { lat: data.lat, lon: data.lon };
    }
  }
  // Default fallbacks if not matched
  if (normalized.includes('jfk') || normalized.includes('york')) {
    return FAMOUS_CITIES['New York'];
  }
  if (normalized.includes('cdg') || normalized.includes('paris')) {
    return FAMOUS_CITIES['Paris'];
  }
  return { lat: 32.4945, lon: 74.5229 }; // Default to Sialkot (Dino's home)
}

/**
 * Reverse geocode GPS coordinates to a friendly city/region name
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<{ cityName: string; fullAddress?: string }> {
  // Check if coordinates are close to Sialkot / Punjab
  if (lat >= 32.0 && lat <= 33.0 && lon >= 74.0 && lon <= 75.2) {
    return {
      cityName: 'Sialkot, Punjab (Pakistan)',
      fullAddress: 'Sialkot District, Punjab, Pakistan',
    };
  }

  // Check if coordinates are close to Ormara / Balochistan coastal belt
  if (lat >= 24.8 && lat <= 25.6 && lon >= 64.0 && lon <= 65.2) {
    return {
      cityName: 'Ormara, Balochistan (Pakistan)',
      fullAddress: 'Ormara, Gwadar District, Balochistan, Pakistan',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const placeName =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.hamlet ||
        addr.suburb ||
        addr.municipality ||
        addr.county ||
        '';
      
      const region = addr.state || addr.province || addr.region || '';
      const country = addr.country || '';

      let formatted = placeName;
      if (placeName && region && !placeName.includes(region)) {
        formatted = `${placeName}, ${region}`;
      } else if (!formatted && region) {
        formatted = region;
      }
      if (formatted && country && !formatted.includes(country)) {
        formatted = `${formatted} (${country})`;
      }

      if (formatted.trim()) {
        return { cityName: formatted, fullAddress: data.display_name };
      }
    }
  } catch {
    // Fallback if network blocked or timed out
  }

  // Find closest known city if offline
  let closestCity = 'Current GPS Location';
  let minDist = Infinity;
  for (const [cityName, data] of Object.entries(FAMOUS_CITIES)) {
    const dist = calculateDistanceMiles(lat, lon, data.lat, data.lon);
    if (dist < minDist) {
      minDist = dist;
      if (dist < 120) {
        closestCity = `${cityName}, ${data.country}`;
      }
    }
  }

  if (closestCity !== 'Current GPS Location') {
    return { cityName: closestCity };
  }

  return {
    cityName: `GPS (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
  };
}

/**
 * Get current browser GPS location with Promise
 */
export function getCurrentBrowserGps(): Promise<{
  lat: number;
  lon: number;
  accuracy: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Watch browser GPS in real-time as Panther moves
 */
export function watchBrowserGps(
  onUpdate: (coords: { lat: number; lon: number; accuracy: number }) => void,
  onError?: (error: GeolocationPositionError) => void
): number | null {
  if (!navigator.geolocation) return null;
  return navigator.geolocation.watchPosition(
    (pos) => {
      onUpdate({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
    },
    (err) => {
      if (onError) onError(err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 15000,
    }
  );
}
