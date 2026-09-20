import { MapContainer, TileLayer } from 'react-leaflet';
import './leaflet';

/**
 * Shared map shell. It needs an explicit height (pass e.g. "h-80").
 * `isolate` keeps Leaflet's high z-index layers below the navbar and modals.
 * NOTE: `center` / `zoom` / `bounds` are only read on first render — change the `key`
 * on this component's parent to re-centre the map.
 */
const BaseMap = ({
  center,
  zoom = 13,
  bounds, // optional: fit the map to these bounds instead of using center/zoom
  scrollWheelZoom = false,
  className = 'h-80',
  children,
}) => (
  <div
    className={`isolate overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 ${className}`}
  >
    <MapContainer
      // react-leaflet ignores `bounds` when center + zoom are also given
      {...(bounds
        ? { bounds, boundsOptions: { padding: [16, 16] } }
        : { center, zoom })}
      scrollWheelZoom={scrollWheelZoom}
      zoomSnap={0.25}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  </div>
);

export default BaseMap;
