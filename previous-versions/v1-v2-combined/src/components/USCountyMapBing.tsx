import React, { useEffect, useRef } from 'react';
import { useOperationStore } from '../stores/useOperationStore';

// Bing Maps API key - you'll need to get one from https://www.bingmapsportal.com/
const BING_MAPS_KEY = 'YOUR_BING_MAPS_KEY_HERE'; // Replace with your key

declare global {
  interface Window {
    Microsoft: any;
    loadBingMaps: () => void;
  }
}

export function USCountyMapBing() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const selectedCounties = useOperationStore(state => state.selectedCounties);

  useEffect(() => {
    // Load Bing Maps script
    if (!window.Microsoft) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://www.bing.com/api/maps/mapcontrol?callback=loadBingMaps&key=${BING_MAPS_KEY}`;
      script.async = true;
      script.defer = true;

      window.loadBingMaps = () => {
        if (mapRef.current && !mapInstance.current) {
          initializeMap();
        }
      };

      document.body.appendChild(script);
    } else if (mapRef.current && !mapInstance.current) {
      initializeMap();
    }
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.Microsoft) return;

    // Initialize Bing Maps
    mapInstance.current = new window.Microsoft.Maps.Map(mapRef.current, {
      credentials: BING_MAPS_KEY,
      center: new window.Microsoft.Maps.Location(39.8283, -98.5795),
      zoom: 4,
      mapTypeId: window.Microsoft.Maps.MapTypeId.road
    });

    // Load the spatial data service module for county boundaries
    window.Microsoft.Maps.loadModule('Microsoft.Maps.SpatialDataService', () => {
      updateCounties();
    });
  };

  const updateCounties = () => {
    if (!mapInstance.current || !window.Microsoft) return;

    // Clear existing layers
    mapInstance.current.layers.clear();

    if (selectedCounties.length === 0) return;

    // Create a layer for selected counties
    const layer = new window.Microsoft.Maps.Layer();

    // For each selected county, query the Bing Spatial Data Service
    selectedCounties.forEach(county => {
      const query = `AdminDivision2 eq '${county.name} County' and AdminDivision1 eq '${county.state}'`;
      
      const queryOptions = {
        entityType: 'CountyBoundary',
        queryUrl: `https://spatial.virtualearth.net/REST/v1/data/755aa60032b24cb1bfb54e8a6d59c229/USCensus2010_Counties/Counties?$filter=${encodeURIComponent(query)}&$format=json&key=${BING_MAPS_KEY}`,
      };

      window.Microsoft.Maps.SpatialDataService.QueryAPIManager.search(queryOptions, null, (data: any) => {
        if (data && data.length > 0) {
          data.forEach((result: any) => {
            if (result.polygons) {
              result.polygons.forEach((polygon: any) => {
                polygon.setOptions({
                  fillColor: 'rgba(220, 38, 38, 0.5)',
                  strokeColor: '#991b1b',
                  strokeThickness: 2
                });
                layer.add(polygon);
              });
            }
          });
        }
      });
    });

    mapInstance.current.layers.insert(layer);

    // Zoom to selected counties
    if (selectedCounties.length > 0) {
      // Calculate bounds
      const locations: any[] = [];
      selectedCounties.forEach(county => {
        // Approximate center for each county - in production you'd geocode these
        locations.push(new window.Microsoft.Maps.Location(30, -80)); // Placeholder
      });
      
      if (locations.length > 0) {
        const bounds = window.Microsoft.Maps.LocationRect.fromLocations(locations);
        mapInstance.current.setView({ bounds: bounds, padding: 50 });
      }
    }
  };

  useEffect(() => {
    if (mapInstance.current && window.Microsoft) {
      updateCounties();
    }
  }, [selectedCounties]);

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-[400px] rounded-lg border border-gray-300" />
      {selectedCounties.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded shadow-md">
          <div className="text-sm font-semibold">{selectedCounties.length} counties selected</div>
        </div>
      )}
      {BING_MAPS_KEY === 'YOUR_BING_MAPS_KEY_HERE' && (
        <div className="absolute inset-0 bg-yellow-50/90 flex items-center justify-center rounded-lg">
          <div className="bg-white p-4 rounded shadow-lg max-w-md">
            <h3 className="font-bold text-red-600 mb-2">Bing Maps API Key Required</h3>
            <p className="text-sm text-gray-700 mb-2">
              To use Bing Maps for county visualization:
            </p>
            <ol className="text-sm text-gray-600 list-decimal ml-4 space-y-1">
              <li>Go to <a href="https://www.bingmapsportal.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Bing Maps Portal</a></li>
              <li>Sign in with a Microsoft account</li>
              <li>Create a new key (Basic plan is free)</li>
              <li>Add the key to USCountyMapBing.tsx</li>
            </ol>
            <p className="text-xs text-gray-500 mt-3">
              The Basic plan includes 125,000 free transactions per year
            </p>
          </div>
        </div>
      )}
    </div>
  );
}