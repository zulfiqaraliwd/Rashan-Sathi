import { useEffect } from 'react';
import { Marker, useMap, useMapEvents } from 'react-leaflet';
import BaseMap from './BaseMap';
import { storeIcon } from './leaflet';

const ClickToPin = ({ onChange }) => {
  useMapEvents({
    click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
};

/** Moves the map when `target` changes (e.g. after "Use my location"). */
const FlyTo = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 15));
  }, [target, map]);
  return null;
};

/**
 * Click the map to drop a pin, drag the pin to fine-tune it.
 * `value` and `onChange` use { lat, lng }.
 */
const LocationPicker = ({ center, value, onChange, flyTo, className = 'h-64' }) => (
  <BaseMap center={center} zoom={13} scrollWheelZoom className={className}>
    <ClickToPin onChange={onChange} />
    <FlyTo target={flyTo} />
    {value && (
      <Marker
        position={[value.lat, value.lng]}
        icon={storeIcon}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng();
            onChange({ lat, lng });
          },
        }}
      />
    )}
  </BaseMap>
);

export default LocationPicker;
