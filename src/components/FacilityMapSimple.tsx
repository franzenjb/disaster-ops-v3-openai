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

// Simple map placeholder until Google Maps or proper ArcGIS integration
export function FacilityMapSimple() {
  const [facilities, setFacilities] = useState<MapFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<MapFacility | null>(null);
  const [filterDiscipline, setFilterDiscipline] = useState('all');

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = () => {
    const allFacilities: MapFacility[] = [];
    
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
          // Mock coordinates for demonstration
          lat: 27.6648 + (Math.random() - 0.5) * 2,
          lng: -81.5158 + (Math.random() - 0.5) * 2
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

  return (
    <div className="h-screen flex">
      {/* Left Panel - Facility List */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 bg-gray-800 text-white sticky top-0 z-10">
          <h2 className="text-xl font-bold">🗺️ Facility Map</h2>
          <p className="text-sm mt-1">{filteredFacilities.length} locations</p>
        </div>

        {/* Controls */}
        <div className="p-4 border-b bg-gray-50 sticky top-[72px] z-10">
          <select
            value={filterDiscipline}
            onChange={(e) => setFilterDiscipline(e.target.value)}
            className="w-full px-3 py-2 border rounded"
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
              onClick={() => setSelectedFacility(facility)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                selectedFacility?.id === facility.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start">
                <span className="text-2xl mr-3">{facility.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold">{facility.name}</h3>
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
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-gray-100">
        {/* Simple Grid Map Visualization */}
        <div className="w-full h-full relative overflow-hidden">
          {/* Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Florida Shape (simplified) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-96 h-96">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-sm font-bold text-gray-700">
                FLORIDA
              </div>
              
              {/* Plot facilities */}
              {filteredFacilities.map((facility, idx) => {
                if (!facility.lat || !facility.lng) return null;
                
                // Convert lat/lng to simple x/y position
                const x = ((facility.lng + 88) / 10) * 100; // Normalize longitude
                const y = ((32 - facility.lat) / 8) * 100; // Normalize latitude
                
                return (
                  <div
                    key={facility.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:z-10"
                    style={{ 
                      left: `${x}%`, 
                      top: `${y}%`,
                    }}
                    onClick={() => setSelectedFacility(facility)}
                  >
                    <div className={`relative group`}>
                      {/* Marker */}
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg
                        transform transition-transform group-hover:scale-125
                        ${facility.color === 'red' ? 'bg-red-500' : ''}
                        ${facility.color === 'orange' ? 'bg-orange-500' : ''}
                        ${facility.color === 'blue' ? 'bg-blue-500' : ''}
                      `}>
                        <span className="text-xs">{facility.icon}</span>
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          {facility.name}
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Facility Popup */}
          {selectedFacility && (
            <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg flex items-center">
                  <span className="mr-2">{selectedFacility.icon}</span>
                  {selectedFacility.name}
                </h3>
                <button
                  onClick={() => setSelectedFacility(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Type:</span> {selectedFacility.type}
                </div>
                <div>
                  <span className="font-semibold">Address:</span> {selectedFacility.address}
                </div>
                <div>
                  <span className="font-semibold">County:</span> {selectedFacility.county}
                </div>
                <div>
                  <span className="font-semibold">Status:</span>{' '}
                  <span className={`
                    px-2 py-1 rounded text-xs font-semibold
                    ${selectedFacility.status === 'Open' || selectedFacility.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'}
                  `}>
                    {selectedFacility.status}
                  </span>
                </div>
                
                {selectedFacility.capacity && (
                  <div>
                    <span className="font-semibold">Capacity:</span>{' '}
                    {typeof selectedFacility.capacity === 'object' && selectedFacility.capacity.maximum
                      ? `${selectedFacility.capacity.current || 0}/${selectedFacility.capacity.maximum} beds`
                      : selectedFacility.capacity.meals
                      ? `${selectedFacility.capacity.meals} meals/day`
                      : '-'}
                  </div>
                )}
                
                {selectedFacility.personnel && (
                  <div>
                    <span className="font-semibold">Staffing:</span>{' '}
                    {selectedFacility.personnel.have}/{selectedFacility.personnel.required}
                    {selectedFacility.personnel.gap > 0 && (
                      <span className="text-red-600 font-bold"> (-{selectedFacility.personnel.gap})</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  View Details
                </button>
                <button 
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(selectedFacility.address)}`)}
                  className="flex-1 px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Get Directions
                </button>
              </div>
            </div>
          )}

          {/* Map Controls */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow p-2">
            <div className="text-xs font-bold mb-2">Legend</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs">Sheltering</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs">Feeding</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs">Gov Ops</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}