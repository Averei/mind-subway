import { MapContainer, TileLayer, Circle, Popup, LayerGroup, Marker } from 'react-leaflet';
import { LatLngExpression, LatLng, DivIcon } from 'leaflet';
import { useState } from 'react';
import React from 'react';
import 'leaflet/dist/leaflet.css';
import type { Outlet } from '../types/outlet';

interface Props {
  outlets: Outlet[];
}

interface OverlapInfo {
  outletName: string;
  distance: number;
}

export default function OutletMap({ outlets }: Props): React.ReactElement {
  const KL_CENTER: LatLngExpression = [3.139, 101.6869] as [number, number];
  const [radius, setRadius] = useState(1000);

  // Create a custom store icon
  const storeIcon = new DivIcon({
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: white;
        border: 2px solid #666;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="#666" d="M12,2L2,12h3v8h6v-6h2v6h6v-8h3L12,2z"/>
        </svg>
      </div>
    `,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const measureRadius = (outlet: Outlet): string => {
    const center = new LatLng(outlet.latitude, outlet.longitude);
    const edge = new LatLng(outlet.latitude, 
      outlet.longitude + (radius / 111320));
    const actualDistance = center.distanceTo(edge);
    
    return `Catchment radius: ${(actualDistance/1000).toFixed(2)}km`;
  };

  const getOverlappingOutlets = (currentOutlet: Outlet): OverlapInfo[] => {
    const current = new LatLng(currentOutlet.latitude, currentOutlet.longitude);
    
    return outlets
      .filter(outlet => {
        if (outlet.id === currentOutlet.id) return false;
        const other = new LatLng(outlet.latitude, outlet.longitude);
        const distance = current.distanceTo(other);
        return distance < (radius * 2);
      })
      .map(outlet => {
        const other = new LatLng(outlet.latitude, outlet.longitude);
        const distance = current.distanceTo(other);
        return {
          outletName: outlet.name,
          distance: distance
        };
      });
  };

  const formatOverlapStatus = (outlet: Outlet): React.ReactElement => {
    const overlaps = getOverlappingOutlets(outlet);
    
    if (overlaps.length === 0) {
      return <p className="text-sm text-gray-600">No overlapping Outlets</p>;
    }

    return (
      <div className="text-sm text-gray-600">
        <p className="font-medium">Overlapping with:</p>
        <ul className="list-disc pl-4 mt-1 space-y-1">
          {overlaps.map((overlap, index) => (
            <li key={index}>
              {overlap.outletName} ({(overlap.distance/1000).toFixed(2)}km away)
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const hasIntersectingCatchment = (currentOutlet: Outlet): boolean => {
    const current = new LatLng(currentOutlet.latitude, currentOutlet.longitude);
    
    return outlets.some(outlet => {
      if (outlet.id === currentOutlet.id) return false;
      const other = new LatLng(outlet.latitude, outlet.longitude);
      const distance = current.distanceTo(other);
      return distance < (radius * 2);
    });
  };

  const getCircleColor = (outlet: Outlet): string => {
    return hasIntersectingCatchment(outlet) ? '#ff4444' : '#4444ff';
  };

  return (
    <div className="absolute inset-0">
      <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg">
        <label className="block text-sm font-medium text-gray-700">
          Catchment Radius (meters)
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            min="100"
            max="10000"
            step="100"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 px-3 py-2"
          />
        </label>
        <div className="mt-2 text-sm text-gray-600">
          Current radius: {(radius/1000).toFixed(1)}km
        </div>
      </div>

      <MapContainer
        center={KL_CENTER}
        zoom={11}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LayerGroup>
          {outlets.map((outlet) => (
            <div key={outlet.id}>
              <Circle
                center={[outlet.latitude, outlet.longitude] as [number, number]}
                radius={radius}
                pathOptions={{
                  fillColor: getCircleColor(outlet),
                  fillOpacity: 0.2,
                  color: getCircleColor(outlet),
                  weight: 1
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold">{outlet.name}</h3>
                    <p className="text-sm">{outlet.address}</p>
                    <p className="text-sm italic">{outlet.operating_hours}</p>
                    <p className="text-sm text-gray-600">
                      {measureRadius(outlet)}
                    </p>
                    {formatOverlapStatus(outlet)}
                    <a 
                      href={outlet.waze_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm block mt-2"
                    >
                      Navigate with Waze
                    </a>
                  </div>
                </Popup>
              </Circle>
              <Marker 
                position={[outlet.latitude, outlet.longitude] as [number, number]}
                icon={storeIcon}
              />
            </div>
          ))}
        </LayerGroup>
      </MapContainer>
    </div>
  );
}