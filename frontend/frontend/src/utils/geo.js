/**
 * Backend (GeoJSON) stores coordinates as [lng, lat].
 * Leaflet wants [lat, lng]. Returns null when a trip has no location.
 */
export const toLatLng = (trip) => {
  const c = trip?.location?.coordinates;
  return Array.isArray(c) && c.length === 2 ? [c[1], c[0]] : null;
};
