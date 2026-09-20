import L from 'leaflet';
import { Marker, Popup, Circle } from 'react-leaflet';
import { Link } from 'react-router-dom';
import BaseMap from './BaseMap';
import { storeIcon } from './leaflet';
import { toLatLng } from '../../utils/geo';

/**
 * Shows trips as pins. `radiusKm` (optional) draws the search radius around `center`
 * and zooms the map so the whole circle is visible.
 * `linkToTrip={false}` hides the "View trip" link (used on the trip's own page).
 */
const TripMap = ({
  trips = [],
  center,
  zoom = 13,
  radiusKm,
  linkToTrip = true,
  className = 'h-80',
}) => (
  <BaseMap
    center={center}
    zoom={zoom}
    bounds={radiusKm ? L.latLng(center).toBounds(radiusKm * 2000) : undefined}
    className={className}
  >
    {radiusKm && (
      <Circle
        center={center}
        radius={radiusKm * 1000}
        pathOptions={{
          color: '#17804d',
          weight: 1.5,
          fillColor: '#17804d',
          fillOpacity: 0.06,
          dashArray: '4 6',
        }}
      />
    )}
    {trips.map((trip) => {
      const position = toLatLng(trip);
      if (!position) return null;
      return (
        <Marker key={trip._id} position={position} icon={storeIcon}>
          <Popup>
            <p className="font-display text-base font-bold text-gray-900">{trip.storeName}</p>
            <p className="mt-0.5 text-sm text-gray-600">{trip.address}</p>
            {linkToTrip && (
              <Link to={`/trip/${trip._id}`} className="mt-2 inline-block text-sm">
                View trip
              </Link>
            )}
          </Popup>
        </Marker>
      );
    })}
  </BaseMap>
);

export default TripMap;
