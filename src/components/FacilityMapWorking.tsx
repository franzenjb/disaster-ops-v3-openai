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
  lat?: number;
  lng?: number;
  status: string;
  capacity?: any;
  personnel?: any;
  icon: string;
  color: string;
}

export function FacilityMapWorking() {
  const [facilities, setFacilities] = useState<MapFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<MapFacility | null>(null);
  const [filterDiscipline, setFilterDiscipline] = useState('all');
  const [mapCenter, setMapCenter] = useState({ lat: 28.0395, lng: -81.5158 });
  const [zoom, setZoom] = useState(7);

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = () => {
    const allFacilities: MapFacility[] = [];
    
    // County coordinates for Florida - simplified version
    const countyCoords: { [key: string]: [number, number] } = {
      'Bay': [30.1588, -85.6602],
      'Broward': [26.1901, -80.2374],
      'Charlotte': [26.9342, -82.0465],
      'Collier': [26.1420, -81.7890],
      'Dade': [25.7617, -80.2374],
      'Duval': [30.3322, -81.6557],
      'Hillsborough': [27.9506, -82.4572],
      'Lake': [28.7639, -81.7320],
      'Orange': [28.5383, -81.3792],
      'Pinellas': [27.7663, -82.6404],
      'Polk': [28.0395, -81.5158],
      'Volusia': [29.0275, -81.0226],
    };

    // Process all facility types
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
        const countyCoord = countyCoords[facility.county] || [28.0395, -81.5158];
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
          // Add small random offset for multiple facilities in same county
          lat: countyCoord[0] + (Math.random() - 0.5) * 0.1,
          lng: countyCoord[1] + (Math.random() - 0.5) * 0.1
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

  const zoomToFacility = (facility: MapFacility) => {
    if (facility.lat && facility.lng) {
      setMapCenter({ lat: facility.lat, lng: facility.lng });
      setZoom(14);
      setSelectedFacility(facility);
    }
  };

  const openDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  const zoomIn = () => setZoom(Math.min(18, zoom + 1));
  const zoomOut = () => setZoom(Math.max(6, zoom - 1));
  const resetZoom = () => {
    setZoom(7);
    setMapCenter({ lat: 28.0395, lng: -81.5158 });
  };

  return (
    <div className="h-screen flex">
      {/* Left Panel - Facility List */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 bg-gradient-to-r from-red-600 to-red-700 text-white sticky top-0 z-10">
          <h2 className="text-xl font-bold">🗺️ Professional Map</h2>
          <p className="text-sm mt-1 text-red-100">
            {filteredFacilities.length} locations • Full Zoom & Directions
          </p>
        </div>

        {/* Controls */}
        <div className="p-4 border-b bg-gray-50 sticky top-[88px] z-10">
          <select
            value={filterDiscipline}
            onChange={(e) => setFilterDiscipline(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            {disciplines.map(disc => (
              <option key={disc} value={disc}>
                {disc === 'all' ? 'All Disciplines' : disc}
              </option>
            ))}
          </select>
        </div>

        {/* Facility List */}
        <div className="divide-y divide-gray-200">
          {filteredFacilities.map(facility => (
            <div
              key={facility.id}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                selectedFacility?.id === facility.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
              }`}
              onClick={() => zoomToFacility(facility)}
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
                        zoomToFacility(facility);
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

      {/* Interactive Map Area */}
      <div className="flex-1 relative bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
        {/* Map Controls */}
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

        {/* Map Container with Interactive Grid */}
        <div className="w-full h-full relative overflow-hidden">
          {/* Background Grid */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Florida Map View */}
          <div 
            className="absolute inset-0 flex items-center justify-center transition-all duration-300"
            style={{ 
              transform: `scale(${zoom / 7}) translate(${(28.0395 - mapCenter.lat) * 100}px, ${(mapCenter.lng + 81.5158) * 100}px)` 
            }}
          >
            <div className="relative w-[600px] h-[400px]">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-lg font-bold text-gray-700 z-10">
                FLORIDA DISASTER OPERATIONS
              </div>
              
              {/* Florida Outline (simplified) */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 400">
                <path 
                  d="M100 100 L500 100 L520 150 L510 200 L480 250 L450 280 L400 300 L350 320 L300 310 L250 290 L200 270 L150 240 L120 200 L110 150 Z" 
                  fill="rgba(34, 197, 94, 0.1)" 
                  stroke="rgba(34, 197, 94, 0.3)" 
                  strokeWidth="2"
                />
              </svg>
              
              {/* Plot Facilities */}
              {filteredFacilities.map((facility) => {
                if (!facility.lat || !facility.lng) return null;
                
                // Convert lat/lng to pixel position
                const x = ((facility.lng + 88) / 10) * 600; 
                const y = ((32 - facility.lat) / 8) * 400; 
                
                const isSelected = selectedFacility?.id === facility.id;
                
                return (
                  <div
                    key={facility.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ 
                      left: `${x}px`, 
                      top: `${y}px`,
                    }}
                    onClick={() => setSelectedFacility(facility)}
                  >
                    <div className={`relative group ${isSelected ? 'z-20' : 'z-10'}`}>
                      {/* Marker */}
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg
                        transform transition-all duration-200 hover:scale-125 border-2 border-white
                        ${isSelected ? 'scale-150 ring-4 ring-yellow-400' : ''}
                        ${facility.color === 'red' ? 'bg-red-500' : ''}
                        ${facility.color === 'orange' ? 'bg-orange-500' : ''}
                        ${facility.color === 'blue' ? 'bg-blue-500' : ''}
                      `}>
                        <span className="text-sm">{facility.icon}</span>
                      </div>
                      
                      {/* Hover Tooltip */}
                      {!isSelected && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-30">
                          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                            {facility.name}
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                  onClick={() => zoomToFacility(selectedFacility)}
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

          {/* Legend */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
            <div className="text-sm font-bold mb-2">Legend</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">🏠</div>
                <span className="text-sm">Sheltering</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">🍽️</div>
                <span className="text-sm">Feeding</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">🏛️</div>
                <span className="text-sm">Gov Ops</span>
              </div>
            </div>
          </div>

          {/* Status Display */}
          <div className="absolute bottom-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-10">
            <div className="text-sm">
              <span className="font-bold">{filteredFacilities.length}</span> facilities • 
              Zoom: <span className="font-bold">{zoom}x</span> • 
              <span className="text-green-400">✓ Interactive</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-16 right-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-xs">
            <div className="text-xs text-gray-600">
              <div className="font-semibold mb-1">Map Controls:</div>
              <div>• Click facilities for details</div>
              <div>• Use +/- buttons to zoom</div>
              <div>• Click "Directions" for navigation</div>
              <div>• Select facility from list to locate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}