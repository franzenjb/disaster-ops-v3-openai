/**
 * US County Map with Real Boundaries
 * Uses actual county GeoJSON data from US Census Bureau
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useOperationStore } from '../stores/useOperationStore';
import { STATE_FIPS_CODES, FIPS_TO_STATE } from '../utils/stateFipsCodes';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// US Census Bureau provides county boundaries
// This URL provides all US counties with accurate boundaries
const US_COUNTIES_GEOJSON_URL = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json';

export function USCountyMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const countyLayer = useRef<L.GeoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [countyData, setCountyData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  
  const selectedCounties = useOperationStore(state => state.selectedCounties);
  
  // Fetch real county boundaries on mount
  useEffect(() => {
    fetch(US_COUNTIES_GEOJSON_URL)
      .then(res => res.json())
      .then(data => {
        setCountyData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load county boundaries:', err);
        setError('Failed to load map data');
        setLoading(false);
      });
  }, []);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;
    
    // Create map centered on US
    const map = L.map(mapContainer.current).setView([39.8283, -98.5795], 4);
    
    // Use a better base map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 18,
    }).addTo(map);
    
    mapInstance.current = map;
    
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);
  
  // Update map with selected counties
  useEffect(() => {
    if (!mapInstance.current || !countyData || loading) return;
    
    // Remove existing layer
    if (countyLayer.current) {
      mapInstance.current.removeLayer(countyLayer.current);
      countyLayer.current = null;
    }
    
    // Create set of selected county names for fast lookup
    // We need to match against FIPS codes in the GeoJSON
    const selectedSet = new Set<string>();
    selectedCounties.forEach(county => {
      const fipsCode = STATE_FIPS_CODES[county.state];
      if (fipsCode) {
        // Create multiple possible keys to match different naming conventions
        const cleanName = county.name.toLowerCase().trim();
        selectedSet.add(`${cleanName}_${fipsCode}`);
        // Also try with "county" suffix in case it's in the GeoJSON
        selectedSet.add(`${cleanName} county_${fipsCode}`);
      }
    });
    
    // Track bounds of selected counties
    const selectedFeatures: L.LatLng[] = [];
    
    // Style function for counties
    const styleFeature = (feature: any) => {
      // Get county name from properties
      const countyName = (feature.properties.NAME || '').toLowerCase().trim();
      
      // Get state FIPS from the GeoJSON (could be in STATE or other property)
      let stateFips = '';
      
      // The GeoJSON often has state info in the id (first 2 digits of FIPS code)
      if (feature.id && typeof feature.id === 'string' && feature.id.length >= 2) {
        stateFips = feature.id.substring(0, 2);
      } else if (feature.properties.STATE) {
        stateFips = feature.properties.STATE;
      } else if (feature.properties.STATEFP) {
        stateFips = feature.properties.STATEFP;
      } else if (feature.properties.GEO_ID && feature.properties.GEO_ID.length >= 2) {
        // Sometimes it's in GEO_ID like "0500000US01001"
        const match = feature.properties.GEO_ID.match(/US(\d{2})/);
        if (match) {
          stateFips = match[1];
        }
      }
      
      // Create key for comparison
      const countyKey = `${countyName}_${stateFips}`;
      const isSelected = selectedSet.has(countyKey) || selectedSet.has(`${countyName} county_${stateFips}`);
      
      if (isSelected) {
        // Get center point for bounds
        if (feature.geometry && feature.geometry.type === 'Polygon') {
          const coords = feature.geometry.coordinates[0];
          coords.forEach((coord: number[]) => {
            if (coord.length >= 2) {
              selectedFeatures.push(L.latLng(coord[1], coord[0]));
            }
          });
        } else if (feature.geometry && feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach((polygon: number[][][]) => {
            polygon[0].forEach((coord: number[]) => {
              if (coord.length >= 2) {
                selectedFeatures.push(L.latLng(coord[1], coord[0]));
              }
            });
          });
        }
      }
      
      return {
        fillColor: isSelected ? '#dc2626' : 'transparent',
        fillOpacity: isSelected ? 0.5 : 0,
        color: isSelected ? '#991b1b' : '#e5e7eb',
        weight: isSelected ? 2 : 0.5,
        dashArray: isSelected ? '' : ''
      };
    };
    
    // Create GeoJSON layer with all counties
    countyLayer.current = L.geoJSON(countyData, {
      style: styleFeature,
      onEachFeature: (feature, layer) => {
        // Get county info
        const countyName = feature.properties.NAME || '';
        let stateFips = '';
        
        if (feature.id && typeof feature.id === 'string' && feature.id.length >= 2) {
          stateFips = feature.id.substring(0, 2);
        } else if (feature.properties.STATE) {
          stateFips = feature.properties.STATE;
        } else if (feature.properties.STATEFP) {
          stateFips = feature.properties.STATEFP;
        } else if (feature.properties.GEO_ID) {
          const match = feature.properties.GEO_ID.match(/US(\d{2})/);
          if (match) {
            stateFips = match[1];
          }
        }
        
        const stateCode = FIPS_TO_STATE[stateFips] || '';
        const countyKey = `${countyName.toLowerCase().trim()}_${stateFips}`;
        const isSelected = selectedSet.has(countyKey) || selectedSet.has(`${countyName.toLowerCase().trim()} county_${stateFips}`);
        
        if (isSelected) {
          // Add popup for selected counties
          layer.bindPopup(`
            <div class="p-2">
              <div class="font-bold text-lg">${countyName}</div>
              <div class="text-sm text-gray-600">${stateCode}</div>
            </div>
          `);
        }
      }
    }).addTo(mapInstance.current);
    
    // Fit map to selected counties if any
    if (selectedFeatures.length > 0) {
      try {
        const bounds = L.latLngBounds(selectedFeatures);
        mapInstance.current.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 8 // Don't zoom in too much
        });
      } catch (e) {
        console.warn('Could not fit bounds:', e);
        // Fall back to US view
        mapInstance.current.setView([39.8283, -98.5795], 4);
      }
    } else {
      // No counties selected, show full US
      mapInstance.current.setView([39.8283, -98.5795], 4);
    }
    
  }, [selectedCounties, countyData, loading]);
  
  if (loading) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-[400px] rounded-lg border border-gray-300" />
      {selectedCounties.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded shadow-md">
          <div className="text-sm font-semibold">{selectedCounties.length} counties selected</div>
          <button
            onClick={() => {
              // Reset to US view
              if (mapInstance.current) {
                mapInstance.current.setView([39.8283, -98.5795], 4);
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