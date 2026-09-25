import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapMarker {
  id?: string;
  lat: number;
  lng: number;
  type: string;
  label: string;
  severity?: string;
  value?: string;
  details?: string;
}

interface FacilityMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  height?: string;
  onMarkerClick?: (marker: MapMarker) => void;
}

const getMarkerIcon = (type: string, severity?: string, label?: string, value?: string) => {
  let color = '#3b82f6'; // blue default
  let badgeIcon = '⚡';
  let pulse = severity === 'critical' || severity === 'high';

  switch (type.toLowerCase()) {
    case 'energy':
    case 'power':
      color = '#eab308'; badgeIcon = '⚡'; break;
    case 'water':
      color = '#3b82f6'; badgeIcon = '💧'; break;
    case 'air_quality':
    case 'airquality':
    case 'aqi':
      color = severity === 'critical' || severity === 'high' ? '#ef4444' : '#10b981';
      badgeIcon = '🌬️'; break;
    case 'waste':
      color = '#a855f7'; badgeIcon = '♻️'; break;
    case 'traffic':
    case 'parking':
      color = '#f97316'; badgeIcon = '🚗'; break;
    case 'safety':
      color = '#ef4444'; badgeIcon = '🛡️'; pulse = true; break;
    case 'asset':
      color = '#06b6d4'; badgeIcon = '⚙️'; break;
    case 'biodiversity':
    case 'tree':
      color = '#10b981'; badgeIcon = '🌳'; break;
    case 'soil':
    case 'land':
      color = '#f59e0b'; badgeIcon = '🌱'; break;
    case 'noise':
    case 'acoustic':
      color = '#ef4444'; badgeIcon = '📢'; break;
    case 'community':
    case 'social':
      color = '#3b82f6'; badgeIcon = '🤝'; break;
    case 'disaster':
    case 'flood':
      color = '#dc2626'; badgeIcon = '🚨'; pulse = true; break;
  }

  const html = `
    <div style="position: relative; cursor: pointer;">
      <div style="
        display: flex; align-items: center; gap: 4px;
        background: #0f172a; color: #f1f5f9;
        padding: 3px 8px; border-radius: 20px;
        border: 2px solid ${color};
        box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 10px ${color}66;
        font-family: system-ui, sans-serif; font-size: 11px; font-weight: 600;
        white-space: nowrap;
        ${pulse ? `animation: marker-pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;` : ''}
      ">
        <span style="font-size: 12px;">${badgeIcon}</span>
        <span>${label || type}</span>
      </div>
      <style>
        @keyframes marker-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 12px ${color}; }
          50% { transform: scale(1.08); box-shadow: 0 0 20px ${color}; }
        }
      </style>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-div-icon',
    iconSize: [100, 26],
    iconAnchor: [50, 13]
  });
};

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function FacilityMap({
  center = [20.2961, 85.8245], // Engineering College Campus, Bhubaneswar
  zoom = 16,
  markers = [],
  height = '400px',
  onMarkerClick
}: FacilityMapProps) {
  const [mounted, setMounted] = useState(false);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark');

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ height }} className="bg-slate-900 rounded-xl animate-pulse flex items-center justify-center text-slate-500">Loading GIS Map Engine...</div>;

  const defaultMarkers: MapMarker[] = markers.length > 0 ? markers : [
    { id: 'bld-1', lat: 20.2968, lng: 85.8248, type: 'energy', label: 'Academic Block A', value: '142 kW Load', details: 'HVAC & Computer Labs active' },
    { id: 'bld-2', lat: 20.2955, lng: 85.8239, type: 'water', label: 'Hostel Block 3', value: '210 LPH Flow', details: 'Overnight pressure baseline nominal' },
    { id: 'bld-3', lat: 20.2962, lng: 85.8255, type: 'waste', label: 'Central Canteen', value: 'Bin 88% Full', details: 'High collection priority' },
    { id: 'bld-4', lat: 20.2971, lng: 85.8232, type: 'air_quality', label: 'Main Gate Road', value: 'AQI 119 Moderate', details: 'PM2.5 elevated due to traffic' },
    { id: 'bld-5', lat: 20.2952, lng: 85.8251, type: 'traffic', label: 'Parking Zone A', value: '84% Capacity', details: '142 / 170 spaces occupied' }
  ];

  const tileUrl = mapStyle === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-slate-700/60 relative group">
      
      {/* Map Control Bar */}
      <div className="absolute top-3 right-3 z-[1000] flex bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg p-1 text-xs font-medium text-slate-300 shadow-xl">
        <button
          onClick={() => setMapStyle('dark')}
          className={`px-3 py-1 rounded-md transition ${mapStyle === 'dark' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400'}`}
        >
          🌙 Dark GIS
        </button>
        <button
          onClick={() => setMapStyle('satellite')}
          className={`px-3 py-1 rounded-md transition ${mapStyle === 'satellite' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400'}`}
        >
          🛰️ Satellite
        </button>
      </div>

      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapUpdater center={center} zoom={zoom} />
        {defaultMarkers.map((marker, i) => (
          <Marker
            key={marker.id || i}
            position={[marker.lat, marker.lng]}
            icon={getMarkerIcon(marker.type, marker.severity, marker.label, marker.value)}
            eventHandlers={{
              click: () => onMarkerClick?.(marker)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
                  <h4 className="font-bold text-slate-100 text-sm">{marker.label}</h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {marker.type.replace('_', ' ')}
                  </span>
                </div>
                {marker.value && <p className="text-xs font-semibold text-emerald-400 font-mono mb-1">{marker.value}</p>}
                {marker.details && <p className="text-xs text-slate-300 leading-normal">{marker.details}</p>}
                <div className="mt-3 pt-2 border-t border-slate-700/50 flex justify-between items-center text-[10px] text-slate-400">
                  <span>LAT: {marker.lat.toFixed(4)}</span>
                  <span>LNG: {marker.lng.toFixed(4)}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
