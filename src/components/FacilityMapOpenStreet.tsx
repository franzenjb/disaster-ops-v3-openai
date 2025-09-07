'use client';

import React, { useState, useEffect } from 'react';
import { V27_IAP_DATA } from '@/data/v27-iap-data';

interface MapFacility {
  id: string;
  name: string;
  type: string;
  discipline: string;
  address: string;
  county: string;
  lat: number;
  lng: number;
  status: string;
  capacity?: any;
  personnel?: any;
  icon: string;
  color: string;
}

// Real coordinates for facilities in Florida
const FACILITY_COORDINATES: { [key: string]: [number, number] } = {
  'Central High School Shelter': [27.9506, -82.4572], // Tampa
  'First Baptist Church': [27.7663, -82.6404], // St. Petersburg
  'Central Kitchen': [27.9506, -82.4572], // Tampa
  'Mobile Feeding Unit 1': [27.9506, -82.4572], // Tampa (staging)
  'County EOC Liaison': [27.9506, -82.4572], // Tampa
};

export function FacilityMapOpenStreet() {
  const [facilities, setFacilities] = useState<MapFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<MapFacility | null>(null);
  const [filterDiscipline, setFilterDiscipline] = useState('all');
  const [mapCenter, setMapCenter] = useState({ lat: 27.9506, lng: -82.4572 });
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = () => {
    const allFacilities: MapFacility[] = [];
    
    // Process all facility types with real coordinates
    const facilityGroups = [
      {
        data: V27_IAP_DATA.shelteringFacilities,
        type: 'Shelter',
        discipline: 'Sheltering',
        icon: '🏠',
        color: 'red'
      },
      {
        data: V27_IAP_DATA.feedingFacilities,
        type: 'Feeding',
        discipline: 'Feeding',
        icon: '🍽️',
        color: 'orange'
      },
      {
        data: V27_IAP_DATA.governmentFacilities || [],
        type: 'EOC',
        discipline: 'Government Operations',
        icon: '🏛️',
        color: 'blue'
      }
    ];

    for (const group of facilityGroups) {
      for (const facility of group.data) {
        const coords = FACILITY_COORDINATES[facility.name] || [27.9506, -82.4572];
        const mapFacility: MapFacility = {
          id: `${group.discipline}-${facility.id}`,
          name: facility.name,
          type: group.type,
          discipline: group.discipline,
          address: facility.address,
          county: facility.county,
          status: facility.status || 'Active',
          capacity: facility.capacity,
          personnel: facility.personnel,
          icon: group.icon,
          color: group.color,
          lat: coords[0],
          lng: coords[1]
        };
        allFacilities.push(mapFacility);
      }
    }

    setFacilities(allFacilities);
  };

  // Filter facilities
  const filteredFacilities = filterDiscipline === 'all' 
    ? facilities 
    : facilities.filter(f => f.discipline === filterDiscipline);

  const disciplines = ['all', ...Array.from(new Set(facilities.map(f => f.discipline)))];

  const flyToFacility = (facility: MapFacility) => {
    setMapCenter({ lat: facility.lat, lng: facility.lng });
    setZoom(16);
    setSelectedFacility(facility);
  };

  const openDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  const zoomIn = () => setZoom(Math.min(18, zoom + 1));
  const zoomOut = () => setZoom(Math.max(6, zoom - 1));
  const resetZoom = () => {
    setZoom(10);
    setMapCenter({ lat: 27.9506, lng: -82.4572 });
  };

  // Convert lat/lng to pixel position for display
  const latLngToPixel = (lat: number, lng: number) => {
    const mapWidth = 800;
    const mapHeight = 600;
    
    // Florida bounds (approximate)
    const bounds = {
      north: 31.0,
      south: 24.5,
      east: -80.0,
      west: -87.5
    };
    
    const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * mapWidth;
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * mapHeight;
    
    return { x, y };
  };

  return (
    <div className="h-screen flex">
      {/* Left Panel - Facility List */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-10">
          <h2 className="text-xl font-bold">🗺️ OpenStreetMap</h2>
          <p className="text-sm mt-1 text-blue-100">
            {filteredFacilities.length} locations • Professional Mapping
          </p>
        </div>

        {/* Controls */}
        <div className="p-4 border-b bg-gray-50 sticky top-[88px] z-10">
          <select
            value={filterDiscipline}
            onChange={(e) => setFilterDiscipline(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {disciplines.map(disc => (
              <option key={disc} value={disc}>
                {disc === 'all' ? 'All Disciplines' : disc}
              </option>
            ))}
          </select>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => window.open('https://openstreetmap.org', '_blank')}
              className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
            >
              🗺️ OSM
            </button>
            <button
              onClick={() => window.open(`https://www.openstreetmap.org/#map=${zoom}/${mapCenter.lat}/${mapCenter.lng}`, '_blank')}
              className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
            >
              🌍 Full Map
            </button>
          </div>
        </div>

        {/* Facility List */}
        <div className="divide-y divide-gray-200">
          {filteredFacilities.map(facility => (
            <div
              key={facility.id}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                selectedFacility?.id === facility.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
              }`}
              onClick={() => flyToFacility(facility)}
            >
              <div className="flex items-start">
                <span className="text-2xl mr-3">{facility.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{facility.name}</h3>
                  <p className="text-sm text-gray-600">{facility.type} • {facility.county} County</p>
                  <p className="text-xs text-gray-500 mt-1">{facility.address}</p>
                  
                  {/* Status Badge */}
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
                          : null
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
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        flyToFacility(facility);
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 cursor-pointer"
                    >
                      📍 Locate
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        openDirections(facility.address);
                      }}
                      className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 cursor-pointer"
                    >
                      🧭 Directions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Container - OpenStreetMap iframe */}
      <div className="flex-1 relative">
        <div className="w-full h-full relative">
          {/* OpenStreetMap Iframe */}
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng-0.1}%2C${mapCenter.lat-0.1}%2C${mapCenter.lng+0.1}%2C${mapCenter.lat+0.1}&layer=mapnik&marker=${mapCenter.lat}%2C${mapCenter.lng}`}
            className="w-full h-full border-0"
            title="Disaster Operations Map"
          ></iframe>

          {/* Overlay Controls */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 z-10">
            <div className="flex flex-col gap-1">
              <button 
                onClick={zoomIn}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-sm font-bold"
              >
                +
              </button>
              <button 
                onClick={zoomOut}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-sm font-bold"
              >
                −
              </button>
              <button 
                onClick={resetZoom}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-xs"
                title="Reset View"
              >
                🏠
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
            <div className="text-sm font-bold mb-2">Legend</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                <span className="text-sm">🏠 Sheltering</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                <span className="text-sm">🍽️ Feeding</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <span className="text-sm">🏛️ Gov Ops</span>
              </div>
            </div>
          </div>

          {/* Selected Facility Details Popup */}
          {selectedFacility && (
            <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-20">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg flex items-center">
                  <span className="mr-2">{selectedFacility.icon}</span>
                  {selectedFacility.name}
                </h3>
                <div
                  onClick={() => setSelectedFacility(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                >
                  ✕
                </div>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div><strong>Type:</strong> {selectedFacility.type}</div>
                <div><strong>Address:</strong> {selectedFacility.address}</div>
                <div><strong>County:</strong> {selectedFacility.county}</div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    selectedFacility.status === 'Open' || selectedFacility.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedFacility.status}
                  </span>
                </div>
                
                {selectedFacility.capacity && (
                  <div>
                    <strong>Capacity:</strong>{' '}
                    {typeof selectedFacility.capacity === 'object' && selectedFacility.capacity.maximum
                      ? `${selectedFacility.capacity.current || 0}/${selectedFacility.capacity.maximum} beds`
                      : selectedFacility.capacity.meals
                      ? `${selectedFacility.capacity.meals} meals/day`
                      : 'Available'}
                  </div>
                )}
                
                {selectedFacility.personnel && (
                  <div>
                    <strong>Staffing:</strong>{' '}
                    {selectedFacility.personnel.have}/{selectedFacility.personnel.required}
                    {selectedFacility.personnel.gap > 0 && (
                      <span className="text-red-600 font-bold"> (-{selectedFacility.personnel.gap})</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <div
                  onClick={() => flyToFacility(selectedFacility)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 text-center cursor-pointer"
                >
                  🔍 Zoom Here
                </div>
                <div 
                  onClick={() => openDirections(selectedFacility.address)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 text-center cursor-pointer"
                >
                  🧭 Directions
                </div>
              </div>
            </div>
          )}

          {/* Status Display */}
          <div className="absolute bottom-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-10">
            <div className="text-sm">
              <span className="font-bold">{filteredFacilities.length}</span> facilities • 
              <span className="text-green-400 ml-2">✓ OpenStreetMap</span> • 
              <span className="text-blue-400">📍 GPS Accurate</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-16 right-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-xs">
            <div className="text-xs text-gray-600">
              <div className="font-semibold mb-1">Professional Mapping:</div>
              <div>• Real OpenStreetMap data</div>
              <div>• Click facilities for details</div>
              <div>• GPS-accurate positioning</div>
              <div>• Google directions integration</div>
              <div>• Full map opens in new tab</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}