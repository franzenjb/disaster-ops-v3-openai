import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useOperationStore } from '../stores/useOperationStore';

// Get token from environment variable or show setup instructions
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Only show instructions if no token is found
if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
  console.info('📍 Map setup: Check README.md for Mapbox setup instructions');
} else {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

export function USCountyMapbox() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const selectedCounties = useOperationStore(state => state.selectedCounties);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    // If no valid token, show a simple message
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
      return;
    }

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283],
      zoom: 3.5
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add counties layer from Mapbox
      map.current.addSource('counties', {
        type: 'vector',
        url: 'mapbox://mapbox.82pkq93d' // Mapbox's county boundaries tileset
      });

      // Add county fill layer
      map.current.addLayer({
        id: 'counties-fill',
        type: 'fill',
        source: 'counties',
        'source-layer': 'original',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['get', 'selected'], false],
            '#dc2626',
            'rgba(0,0,0,0)'
          ],
          'fill-opacity': 0.6
        }
      });

      // Add county outline layer
      map.current.addLayer({
        id: 'counties-outline',
        type: 'line',
        source: 'counties',
        'source-layer': 'original',
        paint: {
          'line-color': '#e5e7eb',
          'line-width': 0.5
        }
      });

      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map when counties change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Create filter for selected counties
    const filters: any[] = ['any'];
    
    selectedCounties.forEach(county => {
      // Try multiple name formats to match Mapbox data
      filters.push(
        ['all',
          ['==', ['get', 'COUNTY'], county.name],
          ['==', ['get', 'STATE'], county.state]
        ]
      );
      filters.push(
        ['all',
          ['==', ['get', 'COUNTY'], `${county.name} County`],
          ['==', ['get', 'STATE'], county.state]
        ]
      );
      filters.push(
        ['all',
          ['==', ['get', 'NAME'], county.name],
          ['==', ['get', 'STATE'], county.state]
        ]
      );
      filters.push(
        ['all',
          ['==', ['get', 'NAME'], `${county.name} County`],
          ['==', ['get', 'STATE'], county.state]
        ]
      );
    });

    // If no counties selected, show none
    if (selectedCounties.length === 0) {
      filters.push(false);
    }

    // Update the fill layer to highlight selected counties
    map.current.setPaintProperty('counties-fill', 'fill-color', [
      'case',
      filters,
      '#dc2626',
      'rgba(0,0,0,0)'
    ]);

    map.current.setPaintProperty('counties-outline', 'line-width', [
      'case',
      filters,
      2,
      0.5
    ]);

    map.current.setPaintProperty('counties-outline', 'line-color', [
      'case',
      filters,
      '#991b1b',
      '#e5e7eb'
    ]);

    // Zoom to selected counties
    if (selectedCounties.length > 0) {
      // This is a simple zoom - in production you'd calculate actual bounds
      const bounds = new mapboxgl.LngLatBounds();
      
      // Add approximate center for each state with selected counties
      const statesWithCounties = [...new Set(selectedCounties.map(c => c.state))];
      const stateCenters: Record<string, [number, number]> = {
        'FL': [-81.5, 27.6],
        'TX': [-99.9, 31.9],
        'CA': [-119.4, 36.7],
        'NY': [-75.5, 43.0],
        'GA': [-82.9, 32.1],
        'NC': [-79.0, 35.7],
        'VA': [-78.6, 37.4],
        'AL': [-86.9, 32.3],
        'LA': [-92.1, 30.9],
        'MS': [-89.3, 32.3],
        // Add more states as needed
      };

      let hasValidBounds = false;
      statesWithCounties.forEach(state => {
        if (stateCenters[state]) {
          bounds.extend(stateCenters[state]);
          hasValidBounds = true;
        }
      });

      if (hasValidBounds) {
        map.current.fitBounds(bounds, {
          padding: 100,
          maxZoom: 7
        });
      }
    } else {
      // Reset to US view
      map.current.flyTo({
        center: [-98.5795, 39.8283],
        zoom: 3.5
      });
    }
  }, [selectedCounties, mapLoaded]);

  // Show setup message if no token
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-gray-600 mb-2">Map requires configuration</p>
          <p className="text-sm text-gray-500">See .env.example for setup</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-[400px] rounded-lg" />
      {selectedCounties.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded shadow-md">
          <div className="text-sm font-semibold">{selectedCounties.length} counties selected</div>
          <button
            onClick={() => {
              if (map.current) {
                map.current.flyTo({
                  center: [-98.5795, 39.8283],
                  zoom: 3.5
                });
              }
            }}
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            Reset view
          </button>
        </div>
      )}
    </div>
  );
}