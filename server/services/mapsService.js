/**
 * Thin wrapper around Google Maps Platform REST APIs (Distance Matrix, Directions,
 * Geocoding, Places Autocomplete). Requires GOOGLE_MAPS_API_KEY in server/.env.
 * Uses global fetch (Node 18+).
 */
const BASE_URL = 'https://maps.googleapis.com/maps/api';

const getApiKey = () => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error('GOOGLE_MAPS_API_KEY is not set in server/.env - add your Google Maps Platform key.');
  }
  return key;
};

const getDistanceAndEta = async (originLat, originLng, destLat, destLng) => {
  const key = getApiKey();
  const url = `${BASE_URL}/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  const element = data?.rows?.[0]?.elements?.[0];
  if (!element || element.status !== 'OK') {
    throw new Error('Could not calculate distance for the given coordinates.');
  }
  return {
    distanceKm: element.distance.value / 1000,
    durationMin: element.duration.value / 60,
    distanceText: element.distance.text,
    durationText: element.duration.text,
  };
};

const getDirections = async (originLat, originLng, destLat, destLng, waypoints = []) => {
  const key = getApiKey();
  const waypointsParam = waypoints.length
    ? `&waypoints=${waypoints.map((w) => `${w.lat},${w.lng}`).join('|')}`
    : '';
  const url = `${BASE_URL}/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}${waypointsParam}&key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  const route = data?.routes?.[0];
  if (!route) {
    throw new Error('No route found for the given coordinates.');
  }
  return {
    polyline: route.overview_polyline.points,
    legs: route.legs,
  };
};

const geocodeAddress = async (address) => {
  const key = getApiKey();
  const url = `${BASE_URL}/geocode/json?address=${encodeURIComponent(address)}&key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  const result = data?.results?.[0];
  if (!result) {
    throw new Error(`Could not geocode address: ${address}`);
  }
  return {
    formattedAddress: result.formatted_address,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
  };
};

const autocompletePlaces = async (input, sessionToken) => {
  const key = getApiKey();
  const url = `${BASE_URL}/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${key}${
    sessionToken ? `&sessiontoken=${sessionToken}` : ''
  }`;
  const res = await fetch(url);
  const data = await res.json();
  return data.predictions || [];
};

module.exports = { getDistanceAndEta, getDirections, geocodeAddress, autocompletePlaces };
