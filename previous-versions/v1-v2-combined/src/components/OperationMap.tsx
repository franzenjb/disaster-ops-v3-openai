/**
 * Choropleth Operation Map
 * 
 * Shows county boundaries with fill colors instead of point markers
 * Auto-updates when counties are selected/removed
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useOperationStore } from '../stores/useOperationStore';
import { eventBus, EventType } from '../core/EventBus';
import { getStateCountyBoundaries } from '../services/countyBoundaries';
import { floridaCountiesFullGeoJSON } from '../data/florida-counties-full-geojson';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export function OperationMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const countyLayer = useRef<L.GeoJSON | null>(null);
  
  const selectedCounties = useOperationStore(state => state.selectedCounties);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;
    
    // Create map centered on US
    const map = L.map(mapContainer.current).setView([39.8283, -98.5795], 4);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
    
    mapInstance.current = map;
    
    // Cleanup
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);
  
  // Update choropleth when counties change
  useEffect(() => {
    if (!mapInstance.current) return;
    
    // Remove existing county layer
    if (countyLayer.current) {
      mapInstance.current.removeLayer(countyLayer.current);
      countyLayer.current = null;
    }
    
    if (selectedCounties.length === 0) {
      // Reset to US view
      mapInstance.current.setView([39.8283, -98.5795], 4);
      return;
    }
    
    // Check if all selected counties are from Florida
    const floridaCounties = selectedCounties.filter(county => {
      // Handle both formats: "Lee County" and "Lee County, FL"
      const countyNameClean = county.name.replace(', FL', '').replace(', Florida', '');
      return floridaCountiesFullGeoJSON.features.some(
        feature => feature.properties.NAME === countyNameClean
      );
    });
    
    if (floridaCounties.length > 0) {
      // Create choropleth layer for Florida counties
      const selectedCountyNames = new Set(
        selectedCounties.map(c => c.name.replace(', FL', '').replace(', Florida', ''))
      );
      
      countyLayer.current = L.geoJSON(floridaCountiesFullGeoJSON as any, {
        style: (feature) => {
          const isSelected = selectedCountyNames.has(feature?.properties.NAME);
          return {
            fillColor: isSelected ? '#dc2626' : '#e5e7eb', // Red for selected, gray for unselected
            fillOpacity: isSelected ? 0.7 : 0.2,
            color: isSelected ? '#991b1b' : '#9ca3af',
            weight: isSelected ? 2 : 1,
          };
        },
        onEachFeature: (feature, layer) => {
          const isSelected = selectedCountyNames.has(feature.properties.NAME);
          if (isSelected) {
            layer.bindPopup(`
              <div class="p-2">
                <div class="font-semibold text-lg">${feature.properties.NAME}</div>
                <div class="text-sm text-gray-600 mt-1">
                  Population: ${feature.properties.POPULATION?.toLocaleString() || 'N/A'}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  FIPS: ${feature.properties.FIPS || 'N/A'}
                </div>
                <div class="text-xs text-red-600 mt-2 font-medium">
                  Active in Operation
                </div>
              </div>
            `);
            
            // Add hover effect
            layer.on('mouseover', function(e) {
              e.target.setStyle({
                fillOpacity: 0.9,
                weight: 3
              });
            });
            
            layer.on('mouseout', function(e) {
              e.target.setStyle({
                fillOpacity: 0.7,
                weight: 2
              });
            });
          }
        }
      });
      
      countyLayer.current.addTo(mapInstance.current);
      
      // Fit map to show selected counties
      const bounds = countyLayer.current.getBounds();
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
      
      console.log(`Choropleth map updated with ${floridaCounties.length} Florida counties`);
    } else {
      // For non-Florida counties, show point markers as fallback
      const markersLayer = L.layerGroup();
      const bounds: L.LatLngBoundsExpression = [];
      
      selectedCounties.forEach(county => {
        // Generate approximate position for demo
        const lat = 39 + Math.random() * 10;
        const lng = -95 - Math.random() * 10;
        
        const marker = L.marker([lat, lng])
          .bindPopup(`
            <div class="font-semibold">${county.name}</div>
            <div class="text-sm text-gray-600">
              Note: County boundaries not yet available
            </div>
          `);
        
        markersLayer.addLayer(marker);
        bounds.push([lat, lng]);
      });
      
      markersLayer.addTo(mapInstance.current);
      
      if (bounds.length > 0) {
        mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [selectedCounties]);
  
  // Subscribe to county events for real-time updates
  useEffect(() => {
    const handleCountyAdded = () => {
      console.log('County added - choropleth will auto-update via React!');
    };
    
    const handleCountyRemoved = () => {
      console.log('County removed - choropleth will auto-update via React!');
    };
    
    const unsubAdd = eventBus.on(EventType.COUNTY_ADDED, handleCountyAdded);
    const unsubRemove = eventBus.on(EventType.COUNTY_REMOVED, handleCountyRemoved);
    
    return () => {
      unsubAdd();
      unsubRemove();
    };
  }, []);
  
  return (
    <div className="relative">
      <div 
        ref={mapContainer} 
        className="w-full h-96 rounded-lg overflow-hidden border border-gray-200"
      />
      
      {selectedCounties.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 rounded-lg p-4 text-center shadow-lg">
            <p className="text-gray-600 font-medium">No counties selected</p>
            <p className="text-sm text-gray-500 mt-1">
              County boundaries will display here when selected
            </p>
          </div>
        </div>
      )}
      
      {selectedCounties.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/95 rounded-lg p-2 shadow-lg">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-600 opacity-70 rounded"></div>
              <span>Active Counties</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-300 opacity-50 rounded"></div>
              <span>Other Counties</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}