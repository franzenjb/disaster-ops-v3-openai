'use client';

import React, { useState, useEffect, useRef } from 'react';
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

export function FacilityMap() {
  const [facilities, setFacilities] = useState<MapFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<MapFacility | null>(null);
  const [mapView, setMapView] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [filterDiscipline, setFilterDiscipline] = useState('all');
  const [showLegend, setShowLegend] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Geocoding mock - in production, use real geocoding service
  const geocodeAddress = (address: string, county: string): { lat: number; lng: number } => {
    // Mock coordinates for Florida counties
    const countyCoords: Record<string, { lat: number; lng: number }> = {
      'Hillsborough': { lat: 27.9506 + (Math.random() - 0.5) * 0.2, lng: -82.4572 + (Math.random() - 0.5) * 0.2 },
      'Pinellas': { lat: 27.8764 + (Math.random() - 0.5) * 0.2, lng: -82.7779 + (Math.random() - 0.5) * 0.2 },
      'Polk': { lat: 27.8611 + (Math.random() - 0.5) * 0.2, lng: -81.6912 + (Math.random() - 0.5) * 0.2 },
      'Manatee': { lat: 27.4799 + (Math.random() - 0.5) * 0.2, lng: -82.3452 + (Math.random() - 0.5) * 0.2 },
      'Sarasota': { lat: 27.0506 + (Math.random() - 0.5) * 0.2, lng: -82.4357 + (Math.random() - 0.5) * 0.2 },
      'Lee': { lat: 26.6630 + (Math.random() - 0.5) * 0.2, lng: -81.9496 + (Math.random() - 0.5) * 0.2 },
      'Charlotte': { lat: 26.9342 + (Math.random() - 0.5) * 0.2, lng: -82.0485 + (Math.random() - 0.5) * 0.2 },
      'Collier': { lat: 26.0765 + (Math.random() - 0.5) * 0.2, lng: -81.4170 + (Math.random() - 0.5) * 0.2 },
      'Miami-Dade': { lat: 25.5516 + (Math.random() - 0.5) * 0.2, lng: -80.6327 + (Math.random() - 0.5) * 0.2 },
      'Broward': { lat: 26.1901 + (Math.random() - 0.5) * 0.2, lng: -80.3659 + (Math.random() - 0.5) * 0.2 }
    };
    
    return countyCoords[county] || { lat: 27.6648 + (Math.random() - 0.5) * 2, lng: -81.5158 + (Math.random() - 0.5) * 2 };
  };

  useEffect(() => {
    // Aggregate all facilities
    const allFacilities: MapFacility[] = [];
    
    // Sheltering facilities
    V27_IAP_DATA.shelteringFacilities.forEach((facility, idx) => {
      const coords = geocodeAddress(facility.address, facility.county);
      allFacilities.push({
        id: `shelter-${idx}`,
        name: facility.name,
        type: 'Shelter',
        discipline: 'Sheltering',
        address: facility.address,
        county: facility.county,
        lat: coords.lat,
        lng: coords.lng,
        status: facility.status || 'Open',
        capacity: facility.capacity,
        personnel: facility.personnel,
        icon: '🏠',
        color: '#dc2626' // red
      });
    });

    // Feeding facilities
    V27_IAP_DATA.feedingFacilities.forEach((facility, idx) => {
      const coords = geocodeAddress(facility.address, facility.county);
      allFacilities.push({
        id: `feeding-${idx}`,
        name: facility.name,
        type: facility.type,
        discipline: 'Feeding',
        address: facility.address,
        county: facility.county,
        lat: coords.lat,
        lng: coords.lng,
        status: facility.status || 'Active',
        capacity: { meals: facility.mealsPerDay },
        personnel: facility.personnel,
        icon: facility.type === 'ERV' ? '🚚' : '🍽️',
        color: '#ea580c' // orange
      });
    });

    // Government Operations
    if (V27_IAP_DATA.governmentFacilities) {
      V27_IAP_DATA.governmentFacilities.forEach((facility, idx) => {
        const coords = geocodeAddress(facility.address, facility.county);
        allFacilities.push({
          id: `gov-${idx}`,
          name: facility.name,
          type: facility.type || 'EOC',
          discipline: 'Government Operations',
          address: facility.address,
          county: facility.county,
          lat: coords.lat,
          lng: coords.lng,
          status: facility.status || 'Active',
          personnel: facility.personnel,
          icon: '🏛️',
          color: '#2563eb' // blue
        });
      });
    }

    // Add other facility types similarly...
    
    setFacilities(allFacilities);
    setMapLoaded(true);
  }, []);

  // Filter facilities based on selected discipline
  const filteredFacilities = filterDiscipline === 'all' 
    ? facilities 
    : facilities.filter(f => f.discipline === filterDiscipline);

  // Get unique disciplines for filter
  const disciplines = ['all', ...Array.from(new Set(facilities.map(f => f.discipline)))];

  // Calculate center point of all facilities
  const getMapCenter = () => {
    if (filteredFacilities.length === 0) return { lat: 27.6648, lng: -81.5158 }; // Florida center
    
    const avgLat = filteredFacilities.reduce((sum, f) => sum + f.lat, 0) / filteredFacilities.length;
    const avgLng = filteredFacilities.reduce((sum, f) => sum + f.lng, 0) / filteredFacilities.length;
    
    return { lat: avgLat, lng: avgLng };
  };

  const center = getMapCenter();

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
            className="w-full px-3 py-2 border rounded mb-2"
          >
            {disciplines.map(disc => (
              <option key={disc} value={disc}>
                {disc === 'all' ? 'All Disciplines' : disc}
              </option>
            ))}
          </select>
          
          <div className="flex gap-2">
            <button
              onClick={() => setMapView('roadmap')}
              className={`flex-1 px-3 py-1 rounded text-sm ${
                mapView === 'roadmap' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Road
            </button>
            <button
              onClick={() => setMapView('satellite')}
              className={`flex-1 px-3 py-1 rounded text-sm ${
                mapView === 'satellite' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapView('terrain')}
              className={`flex-1 px-3 py-1 rounded text-sm ${
                mapView === 'terrain' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Terrain
            </button>
          </div>
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
      <div className="flex-1 relative">
        {/* Map Container */}
        <div ref={mapRef} className="w-full h-full bg-gray-100">
          {/* Simplified map visualization */}
          <div className="relative w-full h-full overflow-hidden">
            {/* Background */}
            <div className={`absolute inset-0 ${
              mapView === 'satellite' 
                ? 'bg-gray-800' 
                : mapView === 'terrain'
                ? 'bg-gradient-to-br from-green-100 to-blue-100'
                : 'bg-gray-200'
            }`}>
              {/* Florida outline (simplified) */}
              <svg viewBox="0 0 400 500" className="w-full h-full opacity-10">
                <path
                  d="M 100 50 L 300 50 L 320 150 L 300 400 L 250 450 L 200 450 L 150 400 L 100 200 Z"
                  fill="currentColor"
                />
              </svg>
            </div>

            {/* Facility Markers */}
            <div className="absolute inset-0">
              {filteredFacilities.map(facility => {
                // Convert lat/lng to percentage positions
                const x = ((facility.lng + 85) / 10) * 100; // Normalize for Florida
                const y = ((30 - facility.lat) / 10) * 100;
                
                return (
                  <div
                    key={facility.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ 
                      left: `${x}%`, 
                      top: `${y}%`,
                      zIndex: selectedFacility?.id === facility.id ? 20 : 10
                    }}
                    onClick={() => setSelectedFacility(facility)}
                  >
                    {/* Marker Pin */}
                    <div className="relative">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                        style={{ backgroundColor: facility.color }}
                      >
                        <span className="text-white text-xl">{facility.icon}</span>
                      </div>
                      {/* Pin tail */}
                      <div 
                        className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0 h-0"
                        style={{
                          borderLeft: '8px solid transparent',
                          borderRight: '8px solid transparent',
                          borderTop: `12px solid ${facility.color}`
                        }}
                      />
                      
                      {/* Label on hover or selection */}
                      {selectedFacility?.id === facility.id && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
                          <div className="bg-black text-white px-2 py-1 rounded text-xs">
                            {facility.name}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Legend</h3>
              <button
                onClick={() => setShowLegend(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs mr-2">🏠</span>
                <span>Shelters</span>
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs mr-2">🍽️</span>
                <span>Feeding Sites</span>
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs mr-2">🚚</span>
                <span>ERVs</span>
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs mr-2">🏛️</span>
                <span>EOCs</span>
              </div>
            </div>
          </div>
        )}

        {/* Legend Toggle */}
        {!showLegend && (
          <button
            onClick={() => setShowLegend(true)}
            className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2 text-sm"
          >
            📍 Show Legend
          </button>
        )}

        {/* Selected Facility Popup */}
        {selectedFacility && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-md">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg flex items-center">
                <span className="text-2xl mr-2">{selectedFacility.icon}</span>
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
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold">{selectedFacility.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discipline:</span>
                <span className="font-semibold">{selectedFacility.discipline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">County:</span>
                <span className="font-semibold">{selectedFacility.county}</span>
              </div>
              <div>
                <span className="text-gray-600">Address:</span>
                <p className="font-semibold">{selectedFacility.address}</p>
              </div>
              
              {selectedFacility.capacity && (
                <div className="pt-2 border-t">
                  <span className="text-gray-600">Capacity:</span>
                  {typeof selectedFacility.capacity === 'object' && selectedFacility.capacity.maximum ? (
                    <div className="flex items-center mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-green-600 h-4 rounded-full"
                          style={{ 
                            width: `${(selectedFacility.capacity.current / selectedFacility.capacity.maximum * 100).toFixed(0)}%` 
                          }}
                        />
                      </div>
                      <span className="ml-2 font-semibold">
                        {selectedFacility.capacity.current}/{selectedFacility.capacity.maximum}
                      </span>
                    </div>
                  ) : selectedFacility.capacity.meals ? (
                    <p className="font-semibold">{selectedFacility.capacity.meals} meals/day</p>
                  ) : null}
                </div>
              )}
              
              {selectedFacility.personnel && (
                <div className="pt-2 border-t">
                  <span className="text-gray-600">Staffing:</span>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full ${
                          selectedFacility.personnel.gap > 0 ? 'bg-yellow-500' : 'bg-green-600'
                        }`}
                        style={{ 
                          width: `${(selectedFacility.personnel.have / selectedFacility.personnel.required * 100).toFixed(0)}%` 
                        }}
                      />
                    </div>
                    <span className="ml-2 font-semibold">
                      {selectedFacility.personnel.have}/{selectedFacility.personnel.required}
                      {selectedFacility.personnel.gap > 0 && (
                        <span className="text-red-600"> (-{selectedFacility.personnel.gap})</span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                View Details
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm">
                Get Directions
              </button>
            </div>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
          <button className="block w-8 h-8 text-center hover:bg-gray-100 rounded">+</button>
          <button className="block w-8 h-8 text-center hover:bg-gray-100 rounded">-</button>
        </div>
      </div>
    </div>
  );
}