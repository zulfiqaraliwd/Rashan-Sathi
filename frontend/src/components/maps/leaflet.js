import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Brand-coloured teardrop pin drawn with CSS/SVG.
 * No image files needed, so no bundler icon workaround either.
 * (Styles: .store-pin in index.css)
 */
export const storeIcon = L.divIcon({
  className: 'store-pin',
  html: `<span class="store-pin__dot">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 9h16l-1.6 11H5.6L4 9Z"/><path d="M8.5 9a3.5 3.5 0 0 1 7 0"/>
    </svg>
  </span>`,
  iconSize: [40, 40],
  iconAnchor: [20, 48],
  popupAnchor: [0, -46],
});
