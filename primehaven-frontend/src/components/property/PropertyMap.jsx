import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icon in Vite bundles
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Approximate coordinates for common locations
const CITY_COORDINATES = {
  beverly: [34.0736, -118.4004],
  los: [34.0522, -118.2437],
  california: [36.7783, -119.4179],
  new: [40.7128, -74.006],
  manhattan: [40.7831, -73.9712],
  miami: [25.7617, -80.1918],
  florida: [27.6648, -81.5158],
  chicago: [41.8781, -87.6298],
  austin: [30.2672, -97.7431],
  texas: [31.9686, -99.9018],
  seattle: [47.6062, -122.3321],
  london: [51.5074, -0.1278],
  paris: [48.8566, 2.3522],
  dubai: [25.2048, 55.2708],
  mumbai: [19.076, 72.8777],
  delhi: [28.6139, 77.209],
  bangalore: [12.9716, 77.5946],
  hyderabad: [17.385, 78.4867],
};

const getCoordinates = (locationStr) => {
  if (!locationStr) return [34.0736, -118.4004]; // Beverly Hills default
  const lower = locationStr.toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (lower.includes(key)) {
      return coords;
    }
  }
  return [34.0522, -118.2437]; // Default to California/LA
};

export const PropertyMap = ({ location, title, price, height = '360px' }) => {
  const coords = getCoordinates(location);

  return (
    <div
      style={{
        height,
        width: '100%',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        zIndex: 1,
      }}
    >
      <MapContainer
        center={coords}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coords} icon={customIcon}>
          <Popup>
            <div style={{ padding: '4px' }}>
              <strong style={{ color: 'var(--color-primary)' }}>{title || 'Property Location'}</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>{location}</p>
              {price && (
                <p style={{ margin: '2px 0 0', fontWeight: 600 }}>
                  ${Number(price).toLocaleString()}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
