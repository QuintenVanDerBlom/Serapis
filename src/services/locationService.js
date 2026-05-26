let Location = null;
try {
  Location = require('expo-location');
} catch {
  // Native module not available — location features will be disabled
}

const ROTTERDAM_CENTER = { latitude: 51.9244, longitude: 4.4777 };
const ROTTERDAM_RADIUS_KM = 15;
const CACHE_DURATION_MS = 30 * 60 * 1000;

let _cachedResult = null;
let _cacheTimestamp = 0;

const toRadians = deg => (deg * Math.PI) / 180;

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const locationService = {
  async getCurrentLocation() {
    if (!Location?.requestForegroundPermissionsAsync) return null;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy?.Balanced ?? 3,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch {
      return null;
    }
  },

  async isInRotterdam() {
    const now = Date.now();
    if (_cachedResult !== null && now - _cacheTimestamp < CACHE_DURATION_MS) {
      return _cachedResult;
    }

    const coords = await this.getCurrentLocation();
    if (!coords) {
      _cachedResult = false;
      _cacheTimestamp = now;
      return false;
    }

    const distance = haversineDistance(
      coords.latitude,
      coords.longitude,
      ROTTERDAM_CENTER.latitude,
      ROTTERDAM_CENTER.longitude,
    );

    _cachedResult = distance <= ROTTERDAM_RADIUS_KM;
    _cacheTimestamp = now;
    return _cachedResult;
  },

  clearCache() {
    _cachedResult = null;
    _cacheTimestamp = 0;
  },
};
