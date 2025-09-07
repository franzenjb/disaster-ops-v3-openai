'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { V27_IAP_DATA } from '@/data/v27-iap-data';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const LayersControl = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl), { ssr: false });

interface MapFacility {
  id: string;
  name: string;
  type: string;
  discipline: string;
  address: string;
  county: string;
  status: string;
  capacity?: any;
  personnel?: any;
  icon: string;
  color: string;
  coordinates: [number, number]; // [lat, lng]
}

// County coordinates for Florida
const COUNTY_COORDINATES: { [key: string]: [number, number] } = {
  'Bay': [30.1588, -85.6602],
  'Broward': [26.1901, -80.2374],
  'Calhoun': [30.4413, -85.0516],
  'Charlotte': [26.9342, -82.0465],
  'Collier': [26.1420, -81.7890],
  'Dade': [25.7617, -80.2374],
  'Duval': [30.3322, -81.6557],
  'Escambia': [30.4518, -87.2169],
  'Franklin': [29.9085, -84.8799],
  'Gadsden': [30.5963, -84.6293],
  'Gulf': [29.9324, -85.3456],
  'Hernando': [28.5353, -82.4757],
  'Hillsborough': [27.9506, -82.4572],
  'Jackson': [30.7769, -85.2488],
  'Lake': [28.7639, -81.7320],
  'Leon': [30.4518, -84.2807],
  'Manatee': [27.4989, -82.5515],
  'Orange': [28.5383, -81.3792],
  'Osceola': [28.1028, -81.1081],
  'Pasco': [28.2639, -82.3101],
  'Pinellas': [27.7663, -82.6404],
  'Polk': [28.0395, -81.5158],
  'Saint Johns': [29.7949, -81.3124],
  'Sarasota': [27.2364, -82.5515],
  'Seminole': [28.6667, -81.1776],
  'Sumter': [28.7503, -82.0465],
  'Volusia': [29.0275, -81.0226],
  'Wakulla': [30.2341, -84.3733]
};

export function FacilityMapProfessional() {
  const [facilities, setFacilities] = useState<MapFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<MapFacility | null>(null);
  const [filterDiscipline, setFilterDiscipline] = useState('all');
  const [mapRef, setMapRef] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on client side
  useEffect(() => {
    setIsClient(true);
    loadFacilities();
    
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
  }, []);

  const loadFacilities = () => {
    const allFacilities: MapFacility[] = [];
    
    // Process sheltering facilities
    V27_IAP_DATA.shelteringFacilities.forEach((facility) => {
      const countyCoords = COUNTY_COORDINATES[facility.county] || [28.0395, -81.5158];
      const mapFacility: MapFacility = {
        id: `shelter-${facility.id}`,
        name: facility.name,
        type: 'Shelter',
        discipline: 'Sheltering',
        address: facility.address,
        county: facility.county,
        status: facility.status || 'Active',
        capacity: facility.capacity,
        personnel: facility.personnel,
        icon: '🏠',
        color: 'red',
        coordinates: [
          countyCoords[0] + (Math.random() - 0.5) * 0.05, // Small random offset
          countyCoords[1] + (Math.random() - 0.5) * 0.05
        ]
      };
      allFacilities.push(mapFacility);
    });

    // Process feeding facilities
    V27_IAP_DATA.feedingFacilities.forEach((facility) => {
      const countyCoords = COUNTY_COORDINATES[facility.county] || [28.0395, -81.5158];
      const mapFacility: MapFacility = {
        id: `feeding-${facility.id}`,
        name: facility.name,
        type: 'Feeding',
        discipline: 'Feeding',
        address: facility.address,
        county: facility.county,
        status: facility.status || 'Active',
        capacity: facility.capacity,
        personnel: facility.personnel,
        icon: '🍽️',
        color: 'orange',
        coordinates: [
          countyCoords[0] + (Math.random() - 0.5) * 0.05,
          countyCoords[1] + (Math.random() - 0.5) * 0.05
        ]
      };
      allFacilities.push(mapFacility);
    });

    // Process government facilities if they exist
    if (V27_IAP_DATA.governmentFacilities) {
      V27_IAP_DATA.governmentFacilities.forEach((facility) => {
        const countyCoords = COUNTY_COORDINATES[facility.county] || [28.0395, -81.5158];
        const mapFacility: MapFacility = {
          id: `gov-${facility.id}`,
          name: facility.name,
          type: 'EOC',
          discipline: 'Government Operations',
          address: facility.address,
          county: facility.county,
          status: facility.status || 'Active',
          capacity: facility.capacity,
          personnel: facility.personnel,
          icon: '🏛️',
          color: 'blue',
          coordinates: [
            countyCoords[0] + (Math.random() - 0.5) * 0.05,
            countyCoords[1] + (Math.random() - 0.5) * 0.05
          ]
        };
        allFacilities.push(mapFacility);
      });
    }

    setFacilities(allFacilities);
  };

  // Create custom icons for different facility types
  const createCustomIcon = useCallback((facility: MapFacility) => {
    if (!isClient || typeof window === 'undefined') return null;
    
    const L = require('leaflet');
    
    const iconColor = facility.color === 'red' ? '#DC2626' : 
                     facility.color === 'orange' ? '#EA580C' : '#2563EB';
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background-color: ${iconColor};
          width: 28px;
          height: 28px;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          ${facility.icon}
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  }, [isClient]);

  // Filter facilities
  const filteredFacilities = filterDiscipline === 'all' 
    ? facilities 
    : facilities.filter(f => f.discipline === filterDiscipline);

  const disciplines = ['all', ...Array.from(new Set(facilities.map(f => f.discipline)))];

  const flyToFacility = (facility: MapFacility) => {
    if (mapRef) {
      mapRef.flyTo(facility.coordinates, 14, {
        animate: true,
        duration: 1
      });
    }
    setSelectedFacility(facility);
  };

  const openDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mb-4 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Professional Map...</h2>
          <p className="text-gray-600 mt-1">Powered by Leaflet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Left Panel */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 bg-gray-800 text-white sticky top-0 z-[1000]">
          <h2 className="text-xl font-bold">🗺️ Professional Map</h2>
          <p className="text-sm mt-1">{filteredFacilities.length} locations • Full Zoom & Directions</p>
        </div>

        {/* Controls */}
        <div className="p-4 border-b bg-gray-50 sticky top-[72px] z-[999]">
          <select
            value={filterDiscipline}
            onChange={(e) => setFilterDiscipline(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            {disciplines.map(disc => (
              <option key={disc} value={disc}>
                {disc === 'all' ? 'All Disciplines' : disc}
              </option>
            ))}
          </select>
        </div>

        {/* Facility List */}
        <div className="divide-y">
          {filteredFacilities.map(facility => (
            <button
              key={facility.id}
              onClick={() => flyToFacility(facility)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                selectedFacility?.id === facility.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start">
                <span className="text-2xl mr-3">{facility.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold">{facility.name}</h3>
                  <p className="text-sm text-gray-600">{facility.type} • {facility.county} County</p>
                  <p className="text-xs text-gray-500 mt-1">{facility.address}</p>
                  
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                    facility.status === 'Open' || facility.status === 'Active' || facility.status === 'Operational'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {facility.status}
                  </span>

                  {/* Quick Stats */}
                  <div className="flex gap-4 mt-2 text-xs text-gray-600">
                    {facility.capacity && (
                      <span>
                        {typeof facility.capacity === 'object' && facility.capacity.maximum
                          ? `${facility.capacity.current || 0}/${facility.capacity.maximum} beds`
                          : facility.capacity.meals
                          ? `${facility.capacity.meals} meals/day`
                          : 'Capacity info'
                        }
                      </span>
                    )}
                    {facility.personnel && (
                      <span>
                        {facility.personnel.have}/{facility.personnel.required} staff
                        {facility.personnel.gap > 0 && (
                          <span className="text-red-600 font-semibold"> (-{facility.personnel.gap})</span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        flyToFacility(facility);
                      }}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                    >
                      📍 Locate
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDirections(facility.address);
                      }}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
                    >
                      🧭 Directions
                    </button>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={[28.0395, -81.5158]} // Central Florida
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          ref={setMapRef}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Street Map">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Terrain">
              <TileLayer
                attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {filteredFacilities.map(facility => (
            <Marker
              key={facility.id}
              position={facility.coordinates}
              icon={createCustomIcon(facility)}
              eventHandlers={{
                click: () => setSelectedFacility(facility)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[250px]">
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">{facility.icon}</span>
                    <h3 className="font-bold text-lg">{facility.name}</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div><strong>Type:</strong> {facility.type}</div>
                    <div><strong>Address:</strong> {facility.address}</div>
                    <div><strong>County:</strong> {facility.county}</div>
                    <div>
                      <strong>Status:</strong>{' '}
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        facility.status === 'Open' || facility.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {facility.status}
                      </span>
                    </div>
                    
                    {facility.capacity && (
                      <div>
                        <strong>Capacity:</strong>{' '}
                        {typeof facility.capacity === 'object' && facility.capacity.maximum
                          ? `${facility.capacity.current || 0}/${facility.capacity.maximum} beds`
                          : facility.capacity.meals
                          ? `${facility.capacity.meals} meals/day`
                          : 'Available'}
                      </div>
                    )}
                    
                    {facility.personnel && (
                      <div>
                        <strong>Staffing:</strong>{' '}
                        {facility.personnel.have}/{facility.personnel.required}
                        {facility.personnel.gap > 0 && (
                          <span className="text-red-600 font-bold"> (-{facility.personnel.gap})</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openDirections(facility.address)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      🧭 Get Directions
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(facility.address);
                        alert('Address copied to clipboard!');
                      }}
                      className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Controls Overlay */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <div className="text-sm font-bold mb-2">Legend</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">🏠</div>
              <span className="text-sm">Sheltering</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs">🍽️</div>
              <span className="text-sm">Feeding</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">🏛️</div>
              <span className="text-sm">Gov Ops</span>
            </div>
          </div>
        </div>

        {/* Facility Count */}
        <div className="absolute bottom-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
          <span className="font-bold">{filteredFacilities.length}</span> facilities displayed
        </div>

        {/* Zoom & Pan Instructions */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000] max-w-xs">
          <div className="text-xs text-gray-600">
            <div className="font-semibold mb-1">Map Controls:</div>
            <div>• Click markers for details</div>
            <div>• Scroll to zoom</div>
            <div>• Drag to pan</div>
            <div>• Use layer control (top-right)</div>
            <div>• Click "Get Directions" for navigation</div>
          </div>
        </div>
      </div>
    </div>
  );
}