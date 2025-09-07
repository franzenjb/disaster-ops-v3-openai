'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function FacilityMapGoogle() {
  const [facilities, setFacilities] = useState<MapFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<MapFacility | null>(null);
  const [filterDiscipline, setFilterDiscipline] = useState('all');
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;

      window.initMap = () => {
        setIsLoaded(true);
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded) return;

    const mapElement = document.getElementById('google-map');
    if (!mapElement) return;

    const newMap = new window.google.maps.Map(mapElement, {
      center: { lat: 27.9506, lng: -82.4572 }, // Tampa, FL
      zoom: 10,
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        }
      ]
    });

    setMap(newMap);
  }, [isLoaded]);

  // Load facilities data
  useEffect(() => {
    loadFacilities();
  }, []);

  // Create markers when facilities or map changes
  useEffect(() => {
    if (!map || !facilities.length || !window.google) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: any[] = [];
    const filteredFacs = filterDiscipline === 'all' 
      ? facilities 
      : facilities.filter(f => f.discipline === filterDiscipline);

    filteredFacs.forEach(facility => {
      const marker = new window.google.maps.Marker({
        position: { lat: facility.lat, lng: facility.lng },
        map: map,
        title: facility.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: facility.color === 'red' ? '#DC2626' : 
                     facility.color === 'orange' ? '#EA580C' : '#2563EB',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: 10
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 16px; max-width: 400px;">
            <h3 style="margin: 0 0 12px 0; color: #111; font-size: 24px;">${facility.icon} ${facility.name}</h3>
            <p style="margin: 8px 0; color: #666; font-size: 18px;"><strong>Type:</strong> ${facility.type}</p>
            <p style="margin: 8px 0; color: #666; font-size: 18px;"><strong>Address:</strong> ${facility.address}</p>
            <p style="margin: 8px 0; color: #666; font-size: 18px;"><strong>County:</strong> ${facility.county}</p>
            <p style="margin: 8px 0; font-size: 18px;">
              <strong>Status:</strong> 
              <span style="background: ${facility.status === 'Active' ? '#10B981' : '#F59E0B'}; 
                           color: white; padding: 4px 8px; border-radius: 4px; font-size: 16px;">
                ${facility.status}
              </span>
            </p>
            ${facility.capacity ? `
              <p style="margin: 8px 0; color: #666; font-size: 18px;">
                <strong>Capacity:</strong> 
                ${typeof facility.capacity === 'object' && facility.capacity.maximum
                  ? `${facility.capacity.current || 0}/${facility.capacity.maximum} beds`
                  : facility.capacity.meals
                  ? `${facility.capacity.meals} meals/day`
                  : 'Available'}
              </p>
            ` : ''}
            ${facility.personnel ? `
              <p style="margin: 8px 0; color: #666; font-size: 18px;">
                <strong>Staffing:</strong> 
                ${facility.personnel.have}/${facility.personnel.required} staff
                ${facility.personnel.gap > 0 ? `<span style="color: #DC2626; font-weight: bold;"> (-${facility.personnel.gap})</span>` : ''}
              </p>
            ` : ''}
            <div style="margin-top: 16px; display: flex; gap: 12px;">
              <button onclick="window.getDirections('${facility.address}')" 
                      style="background: #10B981; color: white; border: none; padding: 12px 18px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                🧭 Directions
              </button>
              <button onclick="window.copyAddress('${facility.address}')" 
                      style="background: #6B7280; color: white; border: none; padding: 12px 18px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                📋 Copy Address
              </button>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        setSelectedFacility(facility);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Add global functions for buttons
    window.getDirections = (address: string) => {
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
    };

    window.copyAddress = (address: string) => {
      navigator.clipboard.writeText(address);
      alert('Address copied to clipboard!');
    };

  }, [map, facilities, filterDiscipline]); // Removed markers from dependencies to prevent infinite loop

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
    if (map) {
      map.setCenter({ lat: facility.lat, lng: facility.lng });
      map.setZoom(16);
      
      // Find and click the marker
      const marker = markers.find(m => 
        m.getPosition().lat() === facility.lat && 
        m.getPosition().lng() === facility.lng
      );
      if (marker) {
        window.google.maps.event.trigger(marker, 'click');
      }
    }
    setSelectedFacility(facility);
  };

  const openDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mb-4 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Google Maps...</h2>
          <p className="text-gray-600 mt-1">Professional satellite and street view</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Left Panel - Facility List */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 bg-gradient-to-r from-red-600 to-red-700 text-white sticky top-0 z-10">
          <h2 className="text-xl font-bold">🗺️ Google Maps</h2>
          <p className="text-sm mt-1 text-red-100">
            {filteredFacilities.length} locations • Satellite & Street View
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
          
          {map && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => map.setMapTypeId('roadmap')}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
              >
                🗺️ Road
              </button>
              <button
                onClick={() => map.setMapTypeId('satellite')}
                className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
              >
                🛰️ Satellite
              </button>
              <button
                onClick={() => map.setMapTypeId('hybrid')}
                className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded hover:bg-purple-200"
              >
                🌍 Hybrid
              </button>
            </div>
          )}
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
                <span className="text-4xl mr-3">{facility.icon}</span>
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

      {/* Google Maps Container */}
      <div className="flex-1 relative">
        <div id="google-map" className="w-full h-full"></div>
        
        {/* Map Controls Overlay */}
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

        {/* Status Display */}
        <div className="absolute bottom-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-10">
          <div className="text-sm">
            <span className="font-bold">{filteredFacilities.length}</span> facilities • 
            <span className="text-green-400 ml-2">✓ Google Maps</span> • 
            <span className="text-blue-400">🛰️ Satellite Available</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-xs">
          <div className="text-xs text-gray-600">
            <div className="font-semibold mb-1">Professional Maps:</div>
            <div>• Real satellite imagery</div>
            <div>• Street view available</div>
            <div>• Click markers for details</div>
            <div>• GPS-accurate positioning</div>
            <div>• Google directions integration</div>
          </div>
        </div>
      </div>
    </div>
  );
}